/**
 * GET /privacy
 *
 * Public privacy policy page — required for Shopify App Store submission.
 * No authentication required.
 */

const SECTION: React.CSSProperties = { marginBottom: 36 };
const H2: React.CSSProperties = { fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#202223" };
const H3: React.CSSProperties = { fontSize: 16, fontWeight: 600, marginBottom: 8, marginTop: 16, color: "#202223" };
const P: React.CSSProperties = { marginTop: 0, marginBottom: 12 };
const UL: React.CSSProperties = { paddingLeft: 24, marginTop: 8, marginBottom: 12 };
const LI: React.CSSProperties = { marginBottom: 6 };

export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: 760,
      margin: "0 auto",
      padding: "56px 24px 80px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#202223",
      lineHeight: 1.75,
      fontSize: 15,
    }}>

      {/* Header */}
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>Privacy Policy</h1>
      <p style={{ color: "#6d7175", marginBottom: 8 }}>
        <strong>App:</strong> Track Your Traffic — Shopify App
      </p>
      <p style={{ color: "#6d7175", marginBottom: 48 }}>
        <strong>Last updated:</strong> April 9, 2026
      </p>

      {/* 1. Overview */}
      <section style={SECTION}>
        <h2 style={H2}>1. Overview</h2>
        <p style={P}>
          Track Your Traffic ("the App") is a Shopify application that helps merchants understand
          their store traffic sources, landing pages, devices, and UTM campaign performance.
          This Privacy Policy explains what data we collect, how we use it, how long we keep it,
          and your rights as a merchant or store visitor.
        </p>
        <p style={P}>
          By installing or using the App, you agree to the terms of this Privacy Policy.
        </p>
      </section>

      {/* 2. Data We Collect */}
      <section style={SECTION}>
        <h2 style={H2}>2. Data We Collect</h2>

        <h3 style={H3}>Merchant Data</h3>
        <p style={P}>
          When you install the App, we store your Shopify shop domain and an OAuth session token
          to authenticate API requests on your behalf. We do not store your name, email address,
          billing information, or any other personal contact details.
        </p>

        <h3 style={H3}>Storefront Visitor Analytics Data</h3>
        <p style={P}>
          The App tracks storefront visitors on your behalf via a lightweight JavaScript snippet
          installed on your store. For each visit we record:
        </p>
        <ul style={UL}>
          <li style={LI}>UTM parameters (source, medium, campaign, term, content) — from the URL</li>
          <li style={LI}>Traffic channel classification (e.g. organic search, paid search, social, email, direct)</li>
          <li style={LI}>Landing page URL path</li>
          <li style={LI}>Referring domain</li>
          <li style={LI}>Device type (mobile / tablet / desktop) — derived from User-Agent string</li>
          <li style={LI}>Country code — derived from CDN request headers (no precise geolocation)</li>
          <li style={LI}>An anonymised visitor hash — a one-way SHA-256 hash of IP address + User-Agent + date</li>
          <li style={LI}>Click ID type (e.g. gclid, fbclid) — for channel attribution only</li>
        </ul>
        <p style={{ ...P, fontWeight: 600 }}>
          We do not store raw IP addresses, names, email addresses, phone numbers, cookies, or
          any other personally identifiable information (PII). The visitor hash is a one-way
          cryptographic value and cannot be reversed to identify any individual.
        </p>
      </section>

      {/* 3. How We Use Data */}
      <section style={SECTION}>
        <h2 style={H2}>3. How We Use Data</h2>
        <p style={P}>We use the data collected solely to provide the App's features:</p>
        <ul style={UL}>
          <li style={LI}>Display traffic analytics dashboards to the merchant (visits, unique visitors, channels)</li>
          <li style={LI}>Attribute visits to UTM campaigns created by the merchant</li>
          <li style={LI}>Generate aggregated reports by channel, source, device, country, and landing page</li>
          <li style={LI}>Track campaign performance over custom date ranges</li>
        </ul>
        <p style={P}>
          We do not sell, rent, share, or use any data for advertising or marketing purposes.
          Data is never shared with third parties except those listed in Section 6 (infrastructure providers).
        </p>
      </section>

      {/* 4. Data Retention */}
      <section style={SECTION}>
        <h2 style={H2}>4. Data Retention</h2>
        <p style={P}>
          Visit data is retained for the period configured by the merchant in the App's Settings page
          (default: indefinite). Merchants can configure automatic data cleanup windows (e.g. delete
          data older than 90 days) or manually purge all data at any time from the Data Management tab.
        </p>
        <p style={P}>
          <strong>Upon app uninstallation:</strong> all analytics data associated with the merchant's
          shop domain is permanently and irreversibly deleted within 48 hours.
        </p>
      </section>

      {/* 5. GDPR & CCPA */}
      <section style={SECTION}>
        <h2 style={H2}>5. GDPR &amp; CCPA Compliance</h2>
        <p style={P}>
          Because the App does not store PII, individual customer data requests and erasure requests
          (GDPR Article 15 / Article 17, CCPA) cannot be fulfilled on a per-customer basis —
          there is no data linkable to a specific individual visitor.
        </p>
        <p style={P}>
          Shop-level data deletion is fully supported and is executed automatically upon app
          uninstallation. Merchants may also request full data deletion at any time by contacting us
          at <a href="mailto:support@addoneplugins.com" style={{ color: "#2c6ecb" }}>support@addoneplugins.com</a>.
        </p>
      </section>

      {/* 6. Third-Party Services */}
      <section style={SECTION}>
        <h2 style={H2}>6. Third-Party Services</h2>
        <p style={P}>The App uses the following third-party infrastructure providers:</p>
        <ul style={UL}>
          <li style={LI}>
            <strong>Shopify</strong> — App platform, OAuth authentication, and webhook delivery.
            Governed by <a href="https://www.shopify.com/legal/privacy" style={{ color: "#2c6ecb" }} target="_blank" rel="noreferrer">Shopify's Privacy Policy</a>.
          </li>
          <li style={LI}>
            <strong>Vercel</strong> — Application hosting and serverless infrastructure.
            Governed by <a href="https://vercel.com/legal/privacy-policy" style={{ color: "#2c6ecb" }} target="_blank" rel="noreferrer">Vercel's Privacy Policy</a>.
          </li>
          <li style={LI}>
            <strong>Supabase / PostgreSQL</strong> — Encrypted database storage for analytics data.
            Governed by <a href="https://supabase.com/privacy" style={{ color: "#2c6ecb" }} target="_blank" rel="noreferrer">Supabase's Privacy Policy</a>.
          </li>
        </ul>
        <p style={P}>
          No data is shared with any other third party beyond the infrastructure providers listed above.
        </p>
      </section>

      {/* 7. Security */}
      <section style={SECTION}>
        <h2 style={H2}>7. Security</h2>
        <p style={P}>We implement the following security measures to protect your data:</p>
        <ul style={UL}>
          <li style={LI}>All data is transmitted over HTTPS (TLS encryption)</li>
          <li style={LI}>Database connections use TLS encryption</li>
          <li style={LI}>Visitor hashes are computed using SHA-256 and are not reversible</li>
          <li style={LI}>Each merchant's data is isolated by shop domain — no cross-merchant data access is possible</li>
          <li style={LI}>No raw IP addresses are stored at any point</li>
        </ul>
      </section>

      {/* 8. Policy Changes */}
      <section style={SECTION}>
        <h2 style={H2}>8. Changes to This Policy</h2>
        <p style={P}>
          We may update this Privacy Policy from time to time. When we make material changes, we will
          update the "Last updated" date at the top of this page. We may also notify merchants via
          the Shopify App Store listing or in-app notification. Continued use of the App after changes
          are posted constitutes your acceptance of the updated policy.
        </p>
      </section>

      {/* 9. Contact */}
      <section style={SECTION}>
        <h2 style={H2}>9. Contact Us</h2>
        <p style={P}>
          If you have any questions, concerns, or requests regarding this Privacy Policy or the
          data we hold, please contact us:
        </p>
        <div style={{
          background: "#f6f6f7",
          borderRadius: 8,
          padding: "16px 20px",
          marginTop: 8,
          fontSize: 14,
        }}>
          <p style={{ margin: 0, marginBottom: 4 }}><strong>AddOne Plugins</strong></p>
          <p style={{ margin: 0, marginBottom: 4 }}>
            Email:{" "}
            <a href="mailto:support@addoneplugins.com" style={{ color: "#2c6ecb" }}>
              support@addoneplugins.com
            </a>
          </p>
          <p style={{ margin: 0 }}>
            Support:{" "}
            <a href="https://apps.shopify.com" style={{ color: "#2c6ecb" }} target="_blank" rel="noreferrer">
              Shopify App Store — Track Your Traffic
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <p style={{
        color: "#6d7175",
        fontSize: 13,
        borderTop: "1px solid #e1e3e5",
        paddingTop: 24,
        marginTop: 16,
      }}>
        This Privacy Policy applies solely to the Track Your Traffic Shopify App developed by AddOne Plugins.
      </p>
    </div>
  );
}
