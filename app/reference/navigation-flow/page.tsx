import type { Metadata } from "next";
import {
  BRANCH_INTENT,
  CONFIGURED_FOOTNOTE,
  CONFIGURED_HEADING,
  CONFIG_NODES,
  ENTRY,
  EXPERIENCES,
  EXPERIENCES_FOOTNOTE,
  EXPERIENCES_HEADING,
  HEADER,
  LEGEND,
  LEGEND_INTENT_SAMPLE,
  OPEN_QUESTION,
} from "./_data/navigation-flow";
import styles from "./navigation-flow.module.css";

export const metadata: Metadata = {
  title: "Platform navigation flow",
  description:
    "How the InfiViz surfaces connect, and which detail pages have exactly one way in.",
};

/** Landing page down into one of the two branches. */
function BranchArrow() {
  return (
    <svg
      width="16"
      height="34"
      viewBox="0 0 16 34"
      className={styles.branchArrow}
      aria-hidden="true"
    >
      <path d="M8 2v26M2 22l6 6 6-6" />
    </svg>
  );
}

/** Top-level experience down into its terminal detail page. */
function DetailArrow() {
  return (
    <svg
      width="16"
      height="30"
      viewBox="0 0 16 30"
      className={styles.detailArrow}
      aria-hidden="true"
    >
      <path d="M8 2v22M2 18l6 6 6-6" />
    </svg>
  );
}

/** Dashed because where this edge lands has not been decided. */
function UndecidedArrow() {
  return (
    <svg
      width="30"
      height="34"
      viewBox="0 0 30 34"
      className={styles.undecidedArrow}
      aria-hidden="true"
    >
      <path d="M15 2v26M9 22l6 6 6-6" />
    </svg>
  );
}

export default function NavigationFlowPage() {
  return (
    <div className={styles.poster}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>{HEADER.eyebrow}</div>
        <h1 className={styles.title}>{HEADER.title}</h1>
        <p className={styles.lede}>{HEADER.lede}</p>
      </div>

      <div className={styles.entryRow}>
        <div className={styles.entryNode}>
          <div className={styles.entryKicker}>{ENTRY.kicker}</div>
          <div className={styles.entryName}>{ENTRY.name}</div>
          <div className={styles.entryCaption}>{ENTRY.caption}</div>
        </div>
      </div>

      <div className={styles.branches}>
        {/* left branch: the three top-level experiences */}
        <div>
          <div className={styles.branchHead}>
            <div className={styles.branchStack}>
              <BranchArrow />
              <span className={styles.branchIntent}>
                {BRANCH_INTENT.experiences}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeading}>{EXPERIENCES_HEADING}</div>
            <div className={styles.experienceGrid}>
              {EXPERIENCES.map((experience) => (
                <div key={experience.name} className={styles.experience}>
                  <div className={styles.experienceBox}>
                    <div className={styles.experienceName}>
                      {experience.name}
                    </div>
                    <div className={styles.experienceCaption}>
                      {experience.caption}
                    </div>
                  </div>

                  {experience.note ? (
                    <div className={styles.experienceNote}>
                      {experience.note}
                    </div>
                  ) : null}

                  {experience.terminal ? (
                    <>
                      <DetailArrow />
                      <span className={styles.detailIntent}>
                        {experience.terminal.intent}
                      </span>
                      <div className={styles.terminal}>
                        <div className={styles.terminalCap} />
                        <div className={styles.terminalName}>
                          {experience.terminal.name}
                        </div>
                        <div className={styles.terminalCaption}>
                          {experience.terminal.caption}
                        </div>
                        <div className={styles.terminalPill}>
                          {experience.terminal.entryPill}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
            <div className={styles.cardFootnote}>{EXPERIENCES_FOOTNOTE}</div>
          </div>
        </div>

        {/* right branch: configured surfaces, plus the one open question */}
        <div>
          <div className={styles.branchHead}>
            <div className={styles.branchStack}>
              <BranchArrow />
              <span className={styles.branchIntent}>
                {BRANCH_INTENT.configured}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeading}>{CONFIGURED_HEADING}</div>
            {CONFIG_NODES.map((node) => (
              <div key={node.name} className={styles.configRow}>
                <span className={styles.configName}>{node.name}</span>
                <span
                  className={styles.configPhase}
                  data-phase-one={node.phaseOne}
                >
                  {node.phase}
                </span>
              </div>
            ))}
            <div className={styles.configFootnote}>{CONFIGURED_FOOTNOTE}</div>
          </div>

          <div className={styles.openQuestion}>
            <UndecidedArrow />
            <div className={styles.openCard}>
              <span className={styles.openGlyph} aria-hidden="true">
                {OPEN_QUESTION.glyph}
              </span>
              <div>
                <div className={styles.openName}>{OPEN_QUESTION.name}</div>
                <div className={styles.openBody}>
                  {OPEN_QUESTION.body.before}
                  <b>{OPEN_QUESTION.body.emphasis}</b>
                  {OPEN_QUESTION.body.after}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        {LEGEND.map((entry) => (
          <span key={entry.variant} className={styles.legendItem}>
            {entry.variant === "intent" ? (
              <span className={styles.legendIntent}>
                {LEGEND_INTENT_SAMPLE}
              </span>
            ) : (
              <span
                className={styles.legendSwatch}
                data-variant={entry.variant}
              />
            )}
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}
