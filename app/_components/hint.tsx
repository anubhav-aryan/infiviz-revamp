import type { ReactNode } from "react";
import styles from "./hint.module.css";

type HintProps = {
  /** The explanation. Load-bearing content, not decoration. */
  text: string;
  /** Anchor the bubble to the right edge when the trigger sits near one. */
  align?: "center" | "end";
  /** The trigger's own styling. When given, it owns `display`. */
  className?: string;
  children: ReactNode;
} & Record<`data-${string}`, string | undefined>;

/**
 * Attaches an explanation to something without hiding it behind a `title`
 * attribute. `title` is mouse-only — unreachable by keyboard, unreadable on
 * touch, and on an `<svg>` it never renders at all, since SVG needs a `<title>`
 * child rather than the attribute. The bubble here is focusable, stays in the
 * accessibility tree, and needs no JavaScript.
 */
export function Hint({
  text,
  align = "center",
  className,
  children,
  ...rest
}: HintProps) {
  return (
    <span
      {...rest}
      // `.hint` only positions. Display is left to the caller's class so this
      // can wrap a flex grid cell without overriding its layout.
      className={
        className
          ? `${styles.hint} ${className}`
          : `${styles.hint} ${styles.hintInline}`
      }
      data-hint-align={align === "end" ? "end" : undefined}
      tabIndex={0}
    >
      {children}
      {/* Two copies on purpose: the clipped one is what assistive tech reads
          and costs no layout, the visible one is drawn only while shown. */}
      <span className={styles.srOnly}>{text}</span>
      <span className={styles.bubble} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
