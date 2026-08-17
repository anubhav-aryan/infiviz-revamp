import { Icon } from "@/app/_components/icon";
import { login } from "./actions";
import styles from "./login.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.page}>
      <form action={login} className={styles.card}>
        <div className={styles.icon}>
          <Icon name="lock" size={20} />
        </div>
        <h1 className={styles.title}>Enter password</h1>
        <p className={styles.subtitle}>This dashboard is password protected.</p>

        <input
          type="password"
          name="password"
          placeholder="Password"
          className={styles.input}
          required
          autoFocus
        />

        {error && <p className={styles.error}>Incorrect password. Try again.</p>}

        <button type="submit" className={styles.submit}>
          <Icon name="log-in" size={16} />
          Continue
        </button>
      </form>
    </div>
  );
}
