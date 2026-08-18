import { AskInfiChatButton } from "@/app/_components/chat/ask-infichat-button";
import { CreateTicketButton } from "@/app/_components/create-ticket-button";
import { Hint } from "@/app/_components/hint";
import { Icon } from "@/app/_components/icon";
import type { MonthKey } from "@/app/_time/periods";
import type { PersonaId } from "../_data/module-matrix";
import { recommendationsFor, type Recommendation } from "../_data/recommendations";
import styles from "./module.module.css";
import { CardActions } from "@/app/_components/card-actions";

/**
 * Store-level recommendations, each showing the reasoning it came from.
 *
 * This sits inside the module screen rather than on a surface of its own,
 * because it belongs next to the number that motivates it — the complaint it
 * answers is that a client gets a big-picture figure and no idea what to do
 * with it, and moving the answer to a different screen would preserve exactly
 * that gap.
 *
 * Each card is ordered inputs-first: what we read, then what we suggest. A
 * merchandiser who cannot see the SKU list, the facing counts and the
 * competitor's position has no basis to trust the instruction, and no way to
 * notice when it is wrong.
 *
 * Routing to the field is the ticket mechanism, not a second delivery path:
 * "Assign" raises a ticket against this store carrying the recommendation, and
 * the assignee picker already runs down to merchandiser level.
 */
export function RecommendationsBlock({
  persona,
  month,
  monthLabel,
  scopeLabel,
}: {
  /** Who is reading, and therefore who is raising — it decides the assignee list. */
  persona: PersonaId;
  month: MonthKey;
  monthLabel: string;
  scopeLabel: string;
}) {
  const recommendations = recommendationsFor(month);
  const derived = recommendations.filter((r) => r.basis === "derived").length;

  return (
    <div className={styles.stack}>
      <div className={styles.recIntro}>
        <div>
          <span className={styles.recIntroTitle}>
            What we&apos;d suggest, and why
          </span>
          <p className={styles.recIntroText}>
            Read from what the shelf and the competitors next to it are already
            showing. Each card lists the inputs behind it — nothing here is an
            instruction you have to take on trust.
          </p>
        </div>
        {derived > 0 ? (
          <span className={styles.derivedNote}>
            <Icon name="info" size={13} />
            {derived} of {recommendations.length} use a target we derived, because
            none was supplied for those stores
          </span>
        ) : null}
      </div>

      <div className={styles.recGrid}>
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            persona={persona}
            rec={rec}
            monthLabel={monthLabel}
            scopeLabel={scopeLabel}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  persona,
  rec,
  monthLabel,
  scopeLabel,
}: {
  persona: PersonaId;
  rec: Recommendation;
  monthLabel: string;
  scopeLabel: string;
}) {
  return (
    <div className={styles.recCard}>
      <div className={styles.recHead}>
        <div className={styles.recStore}>
          <Icon name="store" size={14} />
          <span>
            {rec.storeName}
            <span className={styles.recRetailer}>{rec.retailer}</span>
          </span>
        </div>
        <CardActions>
          <AskInfiChatButton label={`Recommendation — ${rec.storeName}`} compact />
          <CreateTicketButton
            persona={persona}
            context={{
              region: scopeLabel,
              metric: `Recommendation — ${rec.action}`,
              period: monthLabel,
            }}
            compact
          />
        </CardActions>
      </div>

      {/* The reasoning comes first, deliberately. */}
      <div className={styles.recReasonLabel}>What we&apos;ve understood</div>
      <ul className={styles.recReasons}>
        <li>
          <Icon name="boxes" size={13} />
          {rec.reasoning.shelfNote}
        </li>
        <li>
          <Icon name="package" size={13} />
          {rec.reasoning.skus.length} ranged SKUs on this bay —{" "}
          {rec.reasoning.skus.join(", ")}
        </li>
        <li>
          <Icon name="target" size={13} />
          Currently {rec.reasoning.facings} facings at {rec.reasoning.promoPrice}
        </li>
      </ul>

      <div className={styles.recActionLabel}>This may help</div>
      <div className={styles.recAction}>{rec.action}</div>

      <div className={styles.recFoot}>
        <div className={styles.recFigure}>
          <span className={styles.recFigureLabel}>Now</span>
          <span className={styles.recFigureValue}>{rec.current}%</span>
        </div>
        <Icon name="arrow-right" size={14} />
        <div className={styles.recFigure}>
          <span className={styles.recFigureLabel}>
            Target
            {rec.basis === "derived" ? (
              <Hint text={rec.targetNote ?? ""} className={styles.recDerivedChip}>
                derived
              </Hint>
            ) : null}
          </span>
          <span className={styles.recFigureValue} data-basis={rec.basis}>
            {rec.target}%
          </span>
        </div>
        <span className={styles.recUpside}>
          <Icon name="trending-up" size={13} />+{rec.upside} pts expected
        </span>
      </div>
    </div>
  );
}
