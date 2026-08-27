"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Visit } from "@/app/_data/visits";
import { EXCEPTION_BY_BOX, type Exception } from "../_data/session-compliance";
import { flatSessionsFor } from "../_data/session-history";
import {
  DEFAULT_SESSION,
  FLAGSHIP_VISIT,
  slugifyStore,
  MUST_HAVE_BRANDS,
  RECOGNITION_BOXES,
  type ExtraKind,
  type MslFilter,
  type RecognitionBox,
  type Scope,
  type SessionIdentity,
  type ShelfView,
} from "../_data/session-viewer";
import { CaptureTimeline } from "./capture-timeline";
import { InsightsRail, type RailTab } from "./insights-rail";
import { SessionHeader } from "./session-header";
import { SessionTables } from "./session-tables";
import { SessionToolbar } from "./session-toolbar";
import { ShelfStage } from "./shelf-stage";
import { ShelfToggles } from "./shelf-toggles";
import styles from "./session-viewer.module.css";

const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

/**
 * One capture session: the stitch, what recognition read off it, and the
 * numbers that follow.
 *
 * All page state lives here. The stage, the rail and the tables are three
 * views of one selection — pinning a box on the stitch moves the rail and
 * filters the SKU table, and picking an exception in the rail scrolls the
 * stitch — so a single owner is what keeps them from disagreeing.
 *
 * Session is in-page state, not a route: the store is the route, and Analytics
 * deep-links into it by slug. Switching session changes identity and timeline
 * only; the recognition evidence below is the one authored capture, and the
 * stage says so whenever the reader is on a different session.
 */
export function SessionViewer({
  session = DEFAULT_SESSION,
  visit,
}: {
  session?: SessionIdentity;
  visit?: Visit;
}) {
  const [view, setView] = useState<ShelfView>("store");
  const [zoomIndex, setZoomIndex] = useState(0);
  const [shown, setShown] = useState<Set<ExtraKind>>(() => new Set());

  /* One index over every session in every visit — the header offers one
     control, so the page keeps one number. */
  const [flatIndex, setFlatIndex] = useState(0);

  const [railOpen, setRailOpen] = useState(false);
  const [railTab, setRailTab] = useState<RailTab>("summary");
  const [qualityOpen, setQualityOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(true);

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [focusAbsent, setFocusAbsent] = useState(false);
  /* Empty means unfiltered — "all brands" is the absence of a filter, not a
     fourteenth entry in it. */
  const [brandFilter, setBrandFilter] = useState<ReadonlySet<string>>(() => new Set());
  const [mslFilter, setMslFilter] = useState<MslFilter>("all");

  const [brandScope, setBrandScope] = useState<Scope>("all");
  const [brandAsc, setBrandAsc] = useState(false);
  const [accBrandScope, setAccBrandScope] = useState<Scope>("all");
  const [accBrandAsc, setAccBrandAsc] = useState(true);
  const [accSkuScope, setAccSkuScope] = useState<Scope>("top");
  const [accSkuAsc, setAccSkuAsc] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);

  /* Pure over the visit, so the server and the first client render agree. */
  /* `/session-viewer` with no store is still the flagship's session, so its
     own visit row is what the history is built from — not a synthesised one. */
  const sessions = useMemo(() => flatSessionsFor(visit ?? FLAGSHIP_VISIT), [visit]);
  const current = sessions[Math.min(flatIndex, sessions.length - 1)];
  const isCurrentCapture = flatIndex === 0;

  const isVisible = useCallback(
    (box: RecognitionBox) =>
      (brandFilter.size === 0 || brandFilter.has(box.brand)) &&
      (mslFilter === "all" || MUST_HAVE_BRANDS.has(box.brand)),
    [brandFilter, mslFilter],
  );

  const visibleIndices = useMemo(
    () => RECOGNITION_BOXES.flatMap((box, index) => (isVisible(box) ? [index] : [])),
    [isVisible],
  );

  /** Centres the viewport on a box. Fires a native scroll, so the minimap follows. */
  const scrollToBox = useCallback((index: number) => {
    const node = viewportRef.current;
    if (!node) return;
    const box = RECOGNITION_BOXES[index];
    node.scrollLeft =
      ((box.x + box.w / 2) / 100) * node.scrollWidth - node.clientWidth / 2;
  }, []);

  const selectBox = useCallback((index: number) => {
    setSelected((current) => (current === index ? null : index));
    setFocusAbsent(false);
    setRailOpen(true);
    setRailTab(EXCEPTION_BY_BOX.has(RECOGNITION_BOXES[index].id) ? "compliance" : "availability");
  }, []);

  const onArrow = useCallback(
    (direction: 1 | -1) => {
      if (visibleIndices.length === 0) return;
      const at = selected === null ? -1 : visibleIndices.indexOf(selected);
      const next =
        at === -1
          ? visibleIndices[direction === 1 ? 0 : visibleIndices.length - 1]
          : visibleIndices[(at + direction + visibleIndices.length) % visibleIndices.length];
      setSelected(next);
      setHovered(next);
      scrollToBox(next);
    },
    [selected, visibleIndices, scrollToBox],
  );

  const pickException = useCallback(
    (exception: Exception) => {
      if (exception.kind === "absent") {
        /* An absent SKU has no box — there is no rectangle to draw around a
           gap. The answer is in the must-stock list, so go there instead. */
        setSelected(null);
        setHovered(null);
        setRailTab("availability");
        setFocusAbsent(true);
        setMslFilter("must");
        return;
      }
      const index = RECOGNITION_BOXES.findIndex((box) => box.id === exception.boxId);
      if (index < 0) return;
      setSelected(index);
      setHovered(index);
      scrollToBox(index);
      setFocusAbsent(false);
    },
    [scrollToBox],
  );

  const clearPin = useCallback(() => {
    setSelected(null);
    setFocusAbsent(false);
  }, []);

  const toggleExtra = useCallback((kind: ExtraKind) => {
    setShown((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const selectedBox = selected === null ? null : RECOGNITION_BOXES[selected];
  const zoom = ZOOM_STEPS[zoomIndex];
  const storeSlug = slugifyStore((visit ?? FLAGSHIP_VISIT).store);
  const compareHref = `/session-viewer/${storeSlug}/compare` as const;

  /* The Summary tab's one action: the two must-stock gaps, shown as gaps. */
  const viewGaps = useCallback(() => {
    setRailTab("availability");
    setMslFilter("must");
    setSelected(null);
    setFocusAbsent(true);
  }, []);

  return (
    <div>
      <SessionHeader
        session={session}
        sessions={sessions}
        flatIndex={flatIndex}
        onSession={(index) => {
          if (index < 0 || index >= sessions.length) return;
          setFlatIndex(index);
          clearPin();
        }}
        qualityOpen={qualityOpen}
        onToggleQuality={() => setQualityOpen((open) => !open)}
        railOpen={railOpen}
        onToggleRail={() => setRailOpen((open) => !open)}
      />


      <CaptureTimeline
        startedAt={current.startedAt}
        open={timelineOpen}
        onToggle={() => setTimelineOpen((open) => !open)}
      />

      <div className={styles.pageBody}>
        <div className={styles.workspace} data-rail-open={railOpen}>
          <section className={styles.stagePanel}>
            <SessionToolbar
              compareHref={compareHref}
              view={view}
              onViewChange={setView}
              onZoomIn={() =>
                setZoomIndex((index) => Math.min(index + 1, ZOOM_STEPS.length - 1))
              }
              onZoomOut={() => setZoomIndex((index) => Math.max(index - 1, 0))}
              canZoomIn={zoomIndex < ZOOM_STEPS.length - 1}
              canZoomOut={zoomIndex > 0}
              zoomLabel={`${zoom}×`}
              onReset={() => {
                setZoomIndex(0);
                setBrandFilter(new Set());
                setMslFilter("all");
                clearPin();
              }}
              canReset={
                zoomIndex > 0 ||
                brandFilter.size > 0 ||
                mslFilter !== "all" ||
                selected !== null
              }
            />

            <ShelfToggles
              shown={shown}
              onToggle={toggleExtra}
              view={view}
              brandFilter={brandFilter}
              onBrandFilter={(brands) => {
                setBrandFilter(brands);
                clearPin();
              }}
              mslFilter={mslFilter}
              onMslFilter={(filter) => {
                setMslFilter(filter);
                clearPin();
              }}
            />

            {!isCurrentCapture ? (
              <div className={styles.stageNote}>
                Recognition evidence below is the {sessions[0].dayLabel} capture —
                earlier sessions carry identity and timeline only.
              </div>
            ) : null}

            <ShelfStage
              view={view}
              zoom={zoom}
              exportName={storeSlug}
              shown={shown}
              viewportRef={viewportRef}
              hovered={hovered}
              onHover={setHovered}
              selected={selected}
              onSelect={selectBox}
              isVisible={isVisible}
              onArrow={onArrow}
            />
          </section>

          {railOpen ? (
            <InsightsRail
              tab={railTab}
              onTab={setRailTab}
              onClose={() => setRailOpen(false)}
              selectedBox={selectedBox}
              onClearPin={clearPin}
              retailer={session.retailer}
              focusAbsent={focusAbsent}
              onPickException={pickException}
              onHoverBox={(boxId) =>
                setHovered(
                  boxId === null
                    ? null
                    : RECOGNITION_BOXES.findIndex((box) => box.id === boxId),
                )
              }
              brandScope={brandScope}
              onBrandScope={setBrandScope}
              brandAsc={brandAsc}
              onBrandSort={() => setBrandAsc((asc) => !asc)}
              accBrandScope={accBrandScope}
              onAccBrandScope={setAccBrandScope}
              accBrandAsc={accBrandAsc}
              onAccBrandSort={() => setAccBrandAsc((asc) => !asc)}
              accSkuScope={accSkuScope}
              onAccSkuScope={setAccSkuScope}
              accSkuAsc={accSkuAsc}
              onAccSkuSort={() => setAccSkuAsc((asc) => !asc)}
              shown={shown}
              photos={session.photos}
              onViewGaps={viewGaps}
            />
          ) : null}
        </div>

        <SessionTables
          brandFilter={selectedBox?.brand ?? null}
          onClearFilter={clearPin}
        />
      </div>
    </div>
  );
}

