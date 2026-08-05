"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
// Leaflet's stylesheet is the only vendor CSS in the project. Every selector in
// it is class-scoped (`.leaflet-*`), so it cannot restyle app markup; the parts
// we want to look different are overridden under a hashed class in the module.
import "leaflet/dist/leaflet.css";
import type { GeoStore } from "@/app/_data/stores-geo";
import styles from "./store-map.module.css";

/*
 * The shared Leaflet surface behind both maps.
 *
 * IMPORTANT: there is no static `import ... from "leaflet"` anywhere in this
 * file, and there must never be one. Leaflet reads `document` at module scope,
 * so a static import puts it in the server module graph and `next build` dies
 * with `document is not defined` while prerendering. The library is pulled in
 * with `await import("leaflet")` inside an effect, which only ever runs in a
 * browser. The `import type` above is erased at compile time and creates no
 * runtime edge — that is a fail-closed guarantee: break it and the build stops.
 *
 * Tiles come from CARTO's free tier. Fine for a prototype; anything
 * client-facing needs a paid provider or self-hosting.
 */

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

/** ODbL requires the OSM credit and CARTO requires theirs. Both must stay visible. */
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** A 1×1 transparent GIF, so a failed tile shows nothing rather than a broken-image glyph. */
const BLANK_TILE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** How far outside the estate a user may pan before being pulled back. */
const PAN_BOUNDS: [[number, number], [number, number]] = [
  [7.5, 101.5],
  [24.0, 110.5],
];

/**
 * Frame the estate rather than the country. Fitting Vietnam's outline into a
 * landscape card is height-bound, which fills a third of the width with
 * Thailand and the Philippines; fitting the stores keeps the data central.
 */
function boundsOf(points: GeoStore[]): [[number, number], [number, number]] {
  if (points.length === 0) {
    return [
      [8.2, 102.1],
      [23.5, 109.6],
    ];
  }
  let s = 90,
    w = 180,
    n = -90,
    e = -180;
  for (const p of points) {
    s = Math.min(s, p.lat);
    n = Math.max(n, p.lat);
    w = Math.min(w, p.lng);
    e = Math.max(e, p.lng);
  }
  return [
    [s, w],
    [n, e],
  ];
}

/** Distance from an edge at which the card flips rather than overflowing. */
const EDGE = 120;

export type StatusStyle = {
  /** A class from store-map.module.css — the colour lives there, never here. */
  className: string;
  /** Dot diameter in px. Constant across zoom, like the SVG it replaces. */
  size: number;
  /** Legend wording, reused verbatim in each marker's accessible name. */
  label: string;
  /** Paint order; higher draws on top, so meaningful dots survive a pile-up. */
  layer: number;
};

type StoreMapProps = {
  points: GeoStore[];
  /** Which field on the store carries this map's status. */
  statusKey: "visit" | "coverage";
  ramp: Record<string, StatusStyle>;
  /** Definite height for the Leaflet container. */
  height: number;
  ariaLabel: string;
};

type Hovered = {
  store: GeoStore;
  x: number;
  y: number;
  /** Resolved when the card opens, so render never has to measure the DOM. */
  flip?: "left" | "right" | "below";
};

function describe(store: GeoStore, status: StatusStyle): string {
  const when = store.lastVisit ? ` Last visit ${store.lastVisit}.` : "";
  const shots = store.photos > 0 ? ` ${store.photos} photos.` : "";
  return `${store.name}. ${store.retailer} ${store.type.toLowerCase()}, ${store.district}, ${store.region}. ${status.label}.${when}${shots}`;
}

export function StoreMap({
  points,
  statusKey,
  ramp,
  height,
  ariaLabel,
}: StoreMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  /**
   * Markers are cached by store id and never destroyed — filtering removes them
   * from the map and re-adds them later. Rebuilding on every filter change
   * would also blow away whichever marker currently holds keyboard focus.
   */
  const markersRef = useRef(new Map<string, Marker>());
  /** Framing uses the unfiltered estate, so filtering never re-frames the map. */
  const initialPoints = useRef(points);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);

  const clearHover = useCallback(() => setHovered(null), []);

  /** Anchors the card to a marker, flipping near an edge so it stays on-map. */
  const openCard = useCallback((store: GeoStore) => {
    const map = mapRef.current;
    const host = hostRef.current;
    if (!map || !host) return;
    const pt = map.latLngToContainerPoint([store.lat, store.lng]);
    const width = host.clientWidth;
    const flip =
      pt.y < 130
        ? "below"
        : pt.x < EDGE
          ? "right"
          : pt.x > width - EDGE
            ? "left"
            : undefined;
    setHovered({ store, x: pt.x, y: pt.y, flip });
  }, []);

  /* ---------- mount ---------- */
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let observer: ResizeObserver | null = null;
    let timer = 0;

    import("leaflet").then((L) => {
      // React 19 StrictMode mounts effects twice in dev; without this guard the
      // second run hits "Map container is already initialized".
      if (cancelled || !hostRef.current) return;

      map = L.map(hostRef.current, {
        minZoom: 5,
        maxZoom: 13,
        maxBounds: PAN_BOUNDS,
        maxBoundsViscosity: 1,
        // A map that swallows page scroll is universally regretted. Zoom
        // buttons and drag instead.
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: true,
      });
      map.attributionControl.setPrefix(false);

      let sawTile = false;
      let tileErrors = 0;
      const tiles = L.tileLayer(TILE_URL, {
        subdomains: "abcd",
        attribution: ATTRIBUTION,
        errorTileUrl: BLANK_TILE,
        maxZoom: 13,
        detectRetina: true,
      });
      // `errorTileUrl` is a data URI that always loads, so it fires `tileload`
      // too. Without this check a fully offline map reports itself healthy and
      // the notice never appears.
      tiles.on("tileload", (event) => {
        if ((event.tile as HTMLImageElement).src === BLANK_TILE) return;
        sawTile = true;
        setTilesFailed(false);
      });
      tiles.on("tileerror", () => {
        tileErrors += 1;
        if (!sawTile && tileErrors >= 3) setTilesFailed(true);
      });
      tiles.addTo(map);
      // Blocked or offline, no tileerror may ever fire — fall back to a timer.
      timer = window.setTimeout(() => {
        if (!cancelled && !sawTile) setTilesFailed(true);
      }, 6000);

      // fitBounds rather than a fixed centre/zoom: the two cards have very
      // different aspect ratios and this frames both correctly.
      map.fitBounds(boundsOf(initialPoints.current), { padding: [16, 16] });

      // Panning or zooming invalidates the card's anchor; close it rather than
      // chasing the marker across the screen.
      map.on("movestart zoomstart", clearHover);

      mapRef.current = map;
      setReady(true);

      if (typeof ResizeObserver !== "undefined" && hostRef.current) {
        let frame = 0;
        observer = new ResizeObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() =>
            mapRef.current?.invalidateSize({ animate: false }),
          );
        });
        observer.observe(hostRef.current);
      }
    });

    const cache = markersRef.current;
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      cache.clear();
      setReady(false);
    };
  }, [clearHover]);

  /* ---------- markers ---------- */
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;
      const cache = markersRef.current;
      const wanted = new Set(points.map((s) => s.id));

      // Paint order: grey underneath, the meaningful statuses on top.
      const ordered = [...points].sort(
        (a, b) =>
          (ramp[a[statusKey]]?.layer ?? 0) - (ramp[b[statusKey]]?.layer ?? 0),
      );

      for (const store of ordered) {
        const status = ramp[store[statusKey]];
        if (!status) continue;

        let marker = cache.get(store.id);
        if (!marker) {
          const size = status.size;
          const label = describe(store, status);
          const icon = L.divIcon({
            // Passing our own className replaces Leaflet's default white box.
            className: `${styles.marker} ${status.className}`,
            // Without an explicit anchor every dot renders offset down-right.
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
          const created = L.marker([store.lat, store.lng], {
            icon,
            keyboard: true,
            alt: label,
            riseOnHover: true,
            zIndexOffset: status.layer * 1000,
          });

          created.on("mouseover", () => openCard(store));
          created.on("mouseout", clearHover);
          created.on("add", () => {
            const el = created.getElement();
            if (!el || el.dataset.storeId) return;
            el.dataset.storeId = store.id;
            el.setAttribute("role", "button");
            el.setAttribute("aria-label", label);
            el.addEventListener("focus", () => openCard(store));
            el.addEventListener("blur", clearHover);
            el.addEventListener("keydown", (event) => {
              // Without an escape hatch a keyboard user is stuck stepping
              // through every store on the map.
              if (event.key === "Escape") {
                clearHover();
                hostRef.current?.focus();
              }
            });
          });

          marker = created;
          cache.set(store.id, marker);
        }

        if (!map.hasLayer(marker)) marker.addTo(map);
      }

      // Filtered-out markers leave the map but stay in the cache, so coming
      // back is a re-add rather than a rebuild.
      for (const [id, marker] of cache) {
        if (!wanted.has(id) && map.hasLayer(marker)) map.removeLayer(marker);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [points, ready, ramp, statusKey, clearHover, openCard]);

  const status = hovered ? ramp[hovered.store[statusKey]] : null;

  return (
    <div
      className={styles.wrap}
      style={{ "--map-h": `${height}px` } as React.CSSProperties}
    >
      <div
        ref={hostRef}
        className={styles.host}
        role="application"
        aria-label={ariaLabel}
      />

      {hovered && status ? (
        // Decoration: the same text is already each marker's accessible name,
        // so a screen reader never depends on this being visible.
        <div
          className={styles.card}
          data-flip={hovered.flip}
          style={{ left: hovered.x, top: hovered.y }}
          aria-hidden="true"
        >
          <div className={styles.cardName}>{hovered.store.name}</div>
          <div className={styles.cardCode}>{hovered.store.id}</div>
          <div className={styles.cardMeta}>
            {hovered.store.retailer} · {hovered.store.type}
            <br />
            {hovered.store.district}, {hovered.store.region}
          </div>
          <div className={styles.cardFoot}>
            <span className={styles.cardStatus}>
              <span className={`${styles.cardDot} ${status.className}`} />
              {hovered.store.lastVisit ?? status.label}
            </span>
            {hovered.store.photos > 0 ? (
              <span className={styles.cardPhotos}>
                {hovered.store.photos} photos
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {tilesFailed ? (
        <div className={styles.notice}>
          Basemap unavailable — showing store locations only
        </div>
      ) : null}
    </div>
  );
}
