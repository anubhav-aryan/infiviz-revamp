import styles from "./charts.module.css";

/**
 * The Gap Analysis cards — gap headline on the left, actual and target on the
 * right. PowerBI colours the gap red when behind target and green when ahead
 * (Hair Care 59.72% against a 53.30% target reads green), so `tone` is carried
 * per card rather than derived from the sign of a number the component can't
 * see the units of.
 */

export type GapCard = {
  name: string;
  /** Pre-formatted, e.g. `"5.28%"`. */
  gap: string;
  actual: string;
  target: string;
  tone: "behind" | "ahead";
};

export function GapCards({
  cards,
  gapLabel = "gap",
}: {
  cards: GapCard[];
  gapLabel?: string;
}) {
  return (
    <div className={styles.gapGrid}>
      {cards.map((card) => (
        <div key={card.name} className={`${styles.card} ${styles.gapCard}`}>
          <div>
            <div className={styles.gapName}>{card.name}</div>
            <div>
              <span className={styles.gapAmount} data-tone={card.tone}>
                {card.gap}
              </span>
              <span className={styles.gapAmountLabel}>{gapLabel}</span>
            </div>
          </div>

          <div className={styles.gapPair}>
            <div className={styles.gapFigure}>
              <span className={styles.gapValue}>{card.actual}</span>
              <span className={styles.gapLabel}>Actual</span>
            </div>
            <div className={styles.gapFigure}>
              <span className={styles.gapValue} data-muted="true">
                {card.target}
              </span>
              <span className={styles.gapLabel}>Target</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
