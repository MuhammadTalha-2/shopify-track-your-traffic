import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#2c6ecb" />
      <rect x="5"  y="16" width="4" height="7"  rx="1" fill="#fff" />
      <rect x="12" y="11" width="4" height="12" rx="1" fill="#fff" />
      <rect x="19" y="5"  width="4" height="18" rx="1" fill="#fff" />
    </svg>
  );
}

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>

      {/* ── Header / Nav ───────────────────────────────────────────── */}
      <header className={styles.nav}>
        <a href="/" className={styles.navBrand}>
          <LogoIcon />
          Track Your Traffic
        </a>

        <nav className={styles.navLinks}>
          {[
            { label: "Features", href: "/features" },
            { label: "Pricing",  href: "/pricing"  },
            { label: "Help",     href: "/help"      },
            { label: "Privacy",  href: "/privacy"   },
          ].map(({ label, href }) => (
            <a key={label} href={href} className={styles.navLink}>{label}</a>
          ))}
        </nav>

        {showForm && (
          <Form method="post" action="/auth/login" style={{ display: "flex", alignItems: "center" }}>
            <input type="hidden" name="shop" id="nav-shop-input" />
            <a
              href="#install"
              className={styles.navCta}
              onClick={(e) => {
                e.preventDefault();
                const input = document.querySelector<HTMLInputElement>("input[name='shop']");
                input?.focus();
                input?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              Install App
            </a>
          </Form>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className={styles.hero} id="install">
        <span className={styles.pill}>UTM Analytics for Shopify</span>

        <h1 className={styles.heading}>
          Know exactly where<br />
          <span className={styles.headingAccent}>your traffic comes from</span>
        </h1>

        <p className={styles.subtext}>
          Track UTM campaigns, traffic sources, devices, and countries — all from inside your Shopify admin. No coding required.
        </p>

        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
                autoComplete="off"
              />
              <button className={styles.button} type="submit">
                Install App
              </button>
            </div>
            <span className={styles.formHint}>Enter your Shopify store domain to get started</span>
          </Form>
        )}
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>UTM</span>
          <span className={styles.statLabel}>Attribution</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>Real-time</span>
          <span className={styles.statLabel}>Visit tracking</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>No code</span>
          <span className={styles.statLabel}>Setup required</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>GDPR</span>
          <span className={styles.statLabel}>Compliant</span>
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresSectionInner}>
          <h2 className={styles.featuresHeading}>Everything you need to understand your traffic</h2>
          <p className={styles.featuresSubtext}>Powerful analytics built directly into your Shopify admin — no external tools needed.</p>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📊</span>
              <p className={styles.featureTitle}>UTM Campaign Tracking</p>
              <p className={styles.featureDesc}>
                Track every UTM-tagged campaign and see exactly how many visits each one generates. Set goals and monitor progress.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔀</span>
              <p className={styles.featureTitle}>Traffic Source Breakdown</p>
              <p className={styles.featureDesc}>
                See which channels — organic search, paid ads, social, email, and more — are driving visitors to your store.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🌍</span>
              <p className={styles.featureTitle}>Device &amp; Country Insights</p>
              <p className={styles.featureDesc}>
                Understand whether your visitors are on mobile or desktop, and where they are in the world.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔗</span>
              <p className={styles.featureTitle}>UTM Link Builder</p>
              <p className={styles.featureDesc}>
                Generate perfectly formatted UTM URLs for any campaign. Bulk-tag multiple URLs at once with a single click.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🚫</span>
              <p className={styles.featureTitle}>IP Filtering</p>
              <p className={styles.featureDesc}>
                Exclude your own visits and team traffic so your analytics stay clean and accurate.
              </p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📤</span>
              <p className={styles.featureTitle}>CSV Export</p>
              <p className={styles.featureDesc}>
                Export your visit data any time for reporting, sharing with clients, or deeper analysis in a spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} AddOne Plugins &nbsp;·&nbsp;{" "}
          <a href="/privacy">Privacy Policy</a>
          &nbsp;·&nbsp;{" "}
          <a href="/terms">Terms of Service</a>
          &nbsp;·&nbsp;{" "}
          <a href="/help">Help</a>
        </p>
      </footer>
    </div>
  );
}
