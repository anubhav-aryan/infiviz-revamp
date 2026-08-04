import { USERS_FOOTNOTE, USER_ROWS, USER_TILES } from "../_data/users";
import styles from "./master-data.module.css";

/**
 * Users was only sketched. The dashed frame and the "Layout sketch" pill are
 * carried over deliberately — they tell the reader this screen is not resolved.
 */
export function UsersSketch() {
  return (
    <div className={styles.board}>
      <div className={styles.sketch}>
        <div className={styles.sketchHead}>
          <div>
            <div className={styles.eyebrow}>Master data</div>
            <h1 className={styles.sketchTitle}>Users</h1>
          </div>
          <span className={styles.sketchPill}>Layout sketch</span>
        </div>

        <div className={styles.userTiles}>
          {USER_TILES.map((tile) => (
            <div key={tile.label} className={styles.userTile}>
              <div className={styles.userTileLabel}>{tile.label}</div>
              <div className={styles.userTileValue}>{tile.val}</div>
            </div>
          ))}
        </div>

        <div className={`${styles.usersGrid} ${styles.usersHead}`}>
          <span>User · name</span>
          <span>Role</span>
          <span>Region</span>
          <span>Last active</span>
        </div>

        {USER_ROWS.map((user) => (
          <div key={user.id} className={`${styles.usersGrid} ${styles.usersRow}`}>
            <span className={styles.userName}>
              <span className={styles.userId}>{user.id}</span> · {user.name}
            </span>
            <span className={styles.cell}>{user.role}</span>
            <span className={styles.cell}>{user.region}</span>
            <span className={styles.userActive}>{user.active}</span>
          </div>
        ))}

        <div className={styles.footnote}>{USERS_FOOTNOTE}</div>
      </div>
    </div>
  );
}
