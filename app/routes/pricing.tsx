/**
 * GET /pricing
 *
 * Public pricing page for the Track Your Traffic Shopify app.
 * No authentication required.
 */

import React, { useState } from "react";

// ── colour tokens ──────────────────────────────────────────────────────────────
const BLUE   = "#2c6ecb";
const GREEN  = "#10b981";
const DARK   = "#111827";
const GRAY   = "#6b7280";
const LIGHT  = "#f9fafb";
const BORDER = "#e5e7eb";

// ── shared layout helpers ──────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  color: DARK,
  lineHeight: 1.6,
  fontSize: 15,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "#fff",
};

// ── SVG icons ─────────────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill={BLUE} />
      <rect x="5"  y="16" width="4" height="7" rx="1" fill="#fff" />
      <rect x="12" y="11" width="4" height="12" rx="1" fill="#fff" />
      <rect x="19" y="5"  width="4" height="18" rx="1" fill="#fff" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="9" cy="9" r="9" fill={GREEN} fillOpacity="0.15" />
      <path d="M5 9l3 3 5-5" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"
      style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M5 7.5l5 5 5-5" stroke={GRAY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header style={{
      borderBottom: `1px solid ${BORDER}`,
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: DARK }}>
          <LogoIcon />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Track Your Traffic</span>
        </a>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { label: "Features", href: "/features" },
            { label: "Pricing",  href: "/pricing",  active: true },
            { label: "Help",     href: "/help" },
            { label: "Privacy",  href: "/privacy" },
          ].map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? BLUE : GRAY,
                background: active ? "#eff6ff" : "transparent",
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="https://apps.shopify.com"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 18px",
            background: BLUE,
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Install App
        </a>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${BORDER}`,
      background: LIGHT,
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 13,
        color: GRAY,
      }}>
        <span>© 2026 AddOne Plugins. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Privacy Policy",   href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Help",             href: "/help" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{ color: GRAY, textDecoration: "none" }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── Plan data ─────────────────────────────────────────────────────────────────
type Plan = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;       // per-month equivalent when billed yearly
  yearlyTotal: number;       // actual yearly charge
  popular: boolean;
  features: string[];
  buttonLabel: string;
  buttonStyle: React.CSSProperties;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 10,
    yearlyPrice: 9,
    yearlyTotal: 108,
    popular: false,
    features: [
      "Unlimited campaigns",
      "30-day traffic history",
      "UTM link builder",
      "Top sources & channels",
      "Device & country stats",
      "Top landing pages",
      "Bot & IP filtering",
      "7-day free trial",
    ],
    buttonLabel: "Start 7-day free trial",
    buttonStyle: {
      background: "#f3f4f6",
      color: DARK,
      border: `1px solid ${BORDER}`,
    },
  },
  {
    name: "Pro",
    monthlyPrice: 25,
    yearlyPrice: 22.50,
    yearlyTotal: 270,
    popular: true,
    features: [
      "Unlimited campaigns",
      "90-day traffic history",
      "UTM link builder",
      "Advanced channel analytics",
      "Device & country stats",
      "Top landing pages",
      "Bot & IP filtering",
      "Email support",
    ],
    buttonLabel: "Start 7-day free trial",
    buttonStyle: {
      background: BLUE,
      color: "#fff",
      border: `1px solid ${BLUE}`,
    },
  },
  {
    name: "Growth",
    monthlyPrice: 49,
    yearlyPrice: 44.08,
    yearlyTotal: 529,
    popular: false,
    features: [
      "Unlimited campaigns",
      "1-year traffic history",
      "UTM link builder",
      "Full analytics suite",
      "Device & country stats",
      "Data export (CSV)",
      "Bot & IP filtering",
      "Priority support",
    ],
    buttonLabel: "Start 7-day free trial",
    buttonStyle: {
      background: DARK,
      color: "#fff",
      border: `1px solid ${DARK}`,
    },
  },
];

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price    = annual ? plan.yearlyPrice   : plan.monthlyPrice;
  const subLabel = annual ? `$${plan.yearlyTotal}/yr, billed annually` : "billed monthly";

  return (
    <div style={{
      flex: "1 1 280px",
      maxWidth: 360,
      border: plan.popular ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
      borderRadius: 16,
      padding: "32px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      position: "relative",
      background: "#fff",
      boxShadow: plan.popular
        ? "0 8px 32px rgba(44,110,203,0.12)"
        : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Popular badge */}
      {plan.popular && (
        <div style={{
          position: "absolute",
          top: -14,
          left: "50%",
          transform: "translateX(-50%)",
          background: BLUE,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 14px",
          borderRadius: 20,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}>
          MOST POPULAR
        </div>
      )}

      {/* Plan name */}
      <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: DARK }}>{plan.name}</p>

      {/* Price */}
      <div style={{ marginTop: 20, marginBottom: 4, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 44, fontWeight: 800, color: DARK, letterSpacing: "-0.03em" }}>
          ${annual ? plan.yearlyPrice.toFixed(0) : plan.monthlyPrice}
        </span>
        <span style={{ fontSize: 15, color: GRAY }}>/mo</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: GRAY, marginBottom: 28 }}>{subLabel}</p>

      {/* CTA */}
      <a
        href="https://apps.shopify.com"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          padding: "12px 0",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          textDecoration: "none",
          marginBottom: 28,
          transition: "opacity 0.15s",
          ...plan.buttonStyle,
        }}
      >
        {plan.buttonLabel}
      </a>

      {/* Features */}
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: DARK }}>
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: DARK }}>
      <button
        onClick={() => onChange(false)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: annual ? 400 : 700,
          color: annual ? GRAY : DARK,
          fontSize: 14,
          padding: "4px 8px",
        }}
      >
        Monthly
      </button>

      {/* pill track */}
      <div
        onClick={() => onChange(!annual)}
        role="switch"
        aria-checked={annual}
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          background: BLUE,
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3,
          left: annual ? 24 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>

      <button
        onClick={() => onChange(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: annual ? 700 : 400,
          color: annual ? DARK : GRAY,
          fontSize: 14,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Annual
        <span style={{
          background: "#dcfce7",
          color: "#15803d",
          fontSize: 11,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
        }}>
          Save ~10%
        </span>
      </button>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Is there really a free trial? Do I need a credit card?",
    a: "Yes — every plan includes a 7-day free trial. Shopify handles billing, so you will not be charged until your trial ends. You can cancel at any time from your Shopify admin.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time from within the app. When you upgrade, you get access to the new features immediately and Shopify prorates any difference in billing.",
  },
  {
    q: "What happens to my data if I exceed my history limit?",
    a: "Only data within your plan's history window is shown in the dashboard. If you upgrade, older data (up to the new limit) is instantly unlocked. Data is never automatically deleted — it is retained as long as the app is installed.",
  },
  {
    q: "Does Track Your Traffic slow down my storefront?",
    a: "No. The tracking snippet is an asynchronous, lightweight script (< 2 KB) that loads after the page is interactive. It has no measurable impact on your store's performance scores.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ maxWidth: 720, margin: "80px auto 0", padding: "0 24px" }}>
      <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 40, color: DARK }}>
        Frequently asked questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                borderTop: i === 0 ? `1px solid ${BORDER}` : "none",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 15, color: DARK }}>{item.q}</span>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <p style={{ margin: 0, padding: "0 4px 20px", fontSize: 14, color: GRAY, lineHeight: 1.7 }}>
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div style={pageWrap}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{
          textAlign: "center",
          padding: "72px 24px 56px",
          background: LIGHT,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: BLUE, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pricing
          </p>
          <h1 style={{ margin: "0 0 16px", fontSize: 44, fontWeight: 800, color: DARK, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ margin: "0 auto 36px", maxWidth: 520, fontSize: 17, color: GRAY, lineHeight: 1.6 }}>
            Start with a 7-day free trial on any plan. No credit card required upfront —
            Shopify handles billing, so you can cancel anytime.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BillingToggle annual={annual} onChange={setAnnual} />
          </div>
        </section>

        {/* Plan cards */}
        <section style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 24px",
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
            alignItems: "stretch",
          }}>
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} annual={annual} />
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section style={{
          textAlign: "center",
          padding: "0 24px 64px",
        }}>
          <p style={{ fontSize: 13, color: GRAY }}>
            All plans include a 7-day free trial &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp;
            Billed through Shopify &nbsp;·&nbsp; SSL-secured analytics
          </p>
        </section>

        {/* FAQ */}
        <FAQ />

        {/* Final CTA banner */}
        <section style={{
          background: BLUE,
          margin: "80px 0 0",
          padding: "56px 24px",
          textAlign: "center",
          color: "#fff",
        }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Ready to understand your traffic?
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 16, opacity: 0.85 }}>
            Install Track Your Traffic and start your free 7-day trial today.
          </p>
          <a
            href="https://apps.shopify.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: "#fff",
              color: BLUE,
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Install Free on Shopify
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
