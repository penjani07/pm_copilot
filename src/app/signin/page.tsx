import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import styles from "./signin-page.module.css";

type SignInPageProps = {
  searchParams?: Promise<{
    oauth?: string;
  }>;
};

function getOauthMessage(status: string | undefined) {
  if (status === "missing-google-env") {
    return "Google sign-in is not configured in this local environment yet.";
  }

  if (status === "google-error") {
    return "Google could not verify this sign-in request. Check the OAuth redirect URI and try again.";
  }

  return null;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const oauthMessage = getOauthMessage(params?.oauth);
  const isGoogleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <main className={styles.page}>
      <Link className={styles.backButton} href="/">
        <ArrowLeft size={18} />
        Back to homepage
      </Link>

      <section className={styles.panel} aria-labelledby="signin-title">
        <div className={styles.authCard}>
          <div className={styles.brand}>
            <span className={styles.logo}>
              <Sparkles size={18} />
            </span>
            <span>PMO Copilot</span>
          </div>

          <div className={styles.copy}>
            <span className={styles.eyebrow}>Secure workspace access</span>
            <h1 id="signin-title">Sign in to continue.</h1>
            <p>
              Use Google to access the PMO workspace and keep delivery data tied
              to a verified account.
            </p>
          </div>

          {oauthMessage ? <div className={styles.notice}>{oauthMessage}</div> : null}

          {!isGoogleConfigured ? (
            <div className={styles.setupNotice}>
              <KeyRound size={18} />
              <div>
                <strong>Google OAuth needs two local env values.</strong>
                <span>
                  Add <code>GOOGLE_CLIENT_ID</code> and{" "}
                  <code>GOOGLE_CLIENT_SECRET</code>, then restart the dev server.
                </span>
              </div>
            </div>
          ) : null}

          <div className={styles.actions}>
            <a className={styles.googleButton} href="/api/auth/google">
              <span className={styles.googleMark}>G</span>
              Continue with Google
              <ArrowRight size={16} />
            </a>

            <button className={styles.secondaryButton} type="button" disabled>
              Organization SSO
            </button>
          </div>

          <div className={styles.securityRow}>
            <span>
              <ShieldCheck size={16} />
              OAuth flow
            </span>
            <span>
              <LockKeyhole size={16} />
              No password stored
            </span>
          </div>
        </div>

        <aside className={styles.infoCard} aria-label="Google sign-in setup">
          <span className={styles.eyebrow}>Setup status</span>
          <h2>{isGoogleConfigured ? "Google is ready." : "Finish Google setup."}</h2>
          <div className={styles.statusList}>
            <div>
              <CheckCircle2 size={17} />
              <span>Redirect URI</span>
              <strong>http://localhost:8000/api/auth/google/callback</strong>
            </div>
            <div>
              <CheckCircle2 size={17} />
              <span>Required scopes</span>
              <strong>Profile, email, OpenID</strong>
            </div>
            <div className={isGoogleConfigured ? styles.readyItem : styles.pendingItem}>
              <CheckCircle2 size={17} />
              <span>Local credentials</span>
              <strong>
                {isGoogleConfigured ? "Configured" : "Missing in .env.local"}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
