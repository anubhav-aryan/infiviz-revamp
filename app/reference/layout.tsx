import styles from "./reference.module.css";

/**
 * The reference posters are printable standalone documents, not product
 * screens: no AppShell, no sidebar, and deliberately unlinked from the nav.
 */
export default function ReferenceLayout({ children }: LayoutProps<"/reference">) {
  return <div className={styles.frame}>{children}</div>;
}
