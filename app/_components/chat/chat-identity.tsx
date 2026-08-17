import { Icon } from "@/app/_components/icon";
import { ChatStatus } from "./chat-status";
import styles from "./chat.module.css";

/**
 * The branding block shared by the panel header and the hub header: avatar,
 * "InfiChat" title, the "Agent"/"Preview" badges, an optional caption line,
 * and presence. One place so the two chrome components can't drift apart.
 */
export function ChatIdentity({ caption }: { caption?: string }) {
  return (
    <>
      <span className={styles.headAvatar} aria-hidden="true">
        <Icon name="sparkles" size={16} />
      </span>
      <div className={styles.headBody}>
        <div className={styles.headTitleRow}>
          <span className={styles.headTitle}>InfiChat</span>
          <span className={styles.agentBadge}>Agent</span>
          <span className={styles.panelBadge}>Preview</span>
          <ChatStatus />
        </div>
        {caption ? <div className={styles.headCaption}>{caption}</div> : null}
      </div>
    </>
  );
}
