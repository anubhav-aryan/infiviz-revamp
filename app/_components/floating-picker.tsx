"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/app/_components/icon";
import styles from "./floating-picker.module.css";

/**
 * A pill of mutually-exclusive options, draggable anywhere on screen.
 *
 * Neither of its two users is part of the product — the landing screen's
 * onboarding/live switch and the role switch both exist so a walkthrough can
 * show one state after another — but both are pinned over the bottom-right of
 * the page, which is exactly where a reader wants to look during that
 * walkthrough. So they move.
 *
 * **Only the label drags.** Making the whole pill draggable would mean telling
 * a drag apart from a click on the buttons inside it, by distance or by time,
 * and getting that wrong either eats state switches or moves the pill when
 * someone meant to press one. A dedicated grip has neither failure mode.
 *
 * Position starts as `null` so the first render uses the stylesheet's
 * bottom-right anchor and never touches `window` — the server and client agree.
 * The first drag reads the element's real rect and switches to explicit
 * coordinates, so it picks up exactly where it was sitting rather than jumping.
 */

type Point = { x: number; y: number };

/** Keeps the pill clear of the viewport edge. */
const MARGIN = 8;
/** Arrow-key step, so the pill is movable without a pointer. */
const NUDGE = 16;

export type FloatingPickerOption<Id extends string> = {
  id: Id;
  label: string;
  /** Per-option `aria-label`; falls back to the visible label. */
  ariaLabel?: string;
};

export function FloatingPicker<Id extends string>({
  label,
  labelId,
  gripAriaLabel,
  options,
  active,
  onChange,
}: {
  label: string;
  /** Ties the option group to the caption via `aria-labelledby`. */
  labelId: string;
  gripAriaLabel: string;
  options: FloatingPickerOption<Id>[];
  active: Id;
  onChange: (id: Id) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /** `null` until first moved — the stylesheet owns the resting position. */
  const [pos, setPos] = useState<Point | null>(null);
  const grab = useRef<Point | null>(null);

  const clamp = useCallback((point: Point): Point => {
    const el = ref.current;
    const width = el?.offsetWidth ?? 0;
    const height = el?.offsetHeight ?? 0;
    return {
      x: Math.min(Math.max(MARGIN, point.x), window.innerWidth - width - MARGIN),
      y: Math.min(Math.max(MARGIN, point.y), window.innerHeight - height - MARGIN),
    };
  }, []);

  /** A pill parked at the edge would otherwise end up off-screen on resize. */
  useEffect(() => {
    if (!pos) return;
    const onResize = () => setPos((current) => (current ? clamp(current) : current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos, clamp]);

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Hand off from the CSS anchor to explicit coordinates at the pill's
    // current place, so it does not jump on the first pixel of movement.
    grab.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setPos({ x: rect.left, y: rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDrag = (event: React.PointerEvent<HTMLElement>) => {
    const offset = grab.current;
    if (!offset) return;
    setPos(clamp({ x: event.clientX - offset.x, y: event.clientY - offset.y }));
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    grab.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const step: Record<string, Point> = {
      ArrowLeft: { x: -NUDGE, y: 0 },
      ArrowRight: { x: NUDGE, y: 0 },
      ArrowUp: { x: 0, y: -NUDGE },
      ArrowDown: { x: 0, y: NUDGE },
    };
    const move = step[event.key];
    if (!move) return;
    event.preventDefault();

    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const from = pos ?? { x: rect.left, y: rect.top };
    setPos(clamp({ x: from.x + move.x, y: from.y + move.y }));
  };

  return (
    <div
      ref={ref}
      className={styles.picker}
      data-moved={pos !== null}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
    >
      <span
        className={styles.grip}
        role="button"
        tabIndex={0}
        aria-label={gripAriaLabel}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <Icon name="sliders-horizontal" size={12} />
        <span className={styles.label} id={labelId}>
          {label}
        </span>
      </span>

      <div className={styles.options} role="group" aria-labelledby={labelId}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={styles.option}
            aria-pressed={option.id === active}
            aria-label={option.ariaLabel ?? option.label}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
