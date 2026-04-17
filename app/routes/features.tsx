import React from "react";

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", margin: 0, padding: 0, backgroundColor: "#f9fafb", color: "#111827" }}>

      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#2c6ecb" />
              <rect x="5" y="16" width="4" height="7" rx="1" fill="white" />
              <rect x="12" y="11" width="4" height="12" rx="1" fill="white" />
              <rect x="19" y="6" width="4" height="17" rx="1" fill="white" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#111827", letterSpacing: "-0.3px" }}>Track Your Traffic</span>
          </a>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <a href="/features" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, fontWeight: 600, color: "#2c6ecb", backgroundColor: "#eff6ff", textDecoration: "none" }}>Features</a>
            <a href="/pricing" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", transition: "color 0.15s" }}>Pricing</a>
            <a href="/help" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none" }}>Help</a>
            <a href="/privacy" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ marginLeft: 8, padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#ffffff", backgroundColor: "#2c6ecb", textDecoration: "none", boxShadow: "0 1px 3px rgba(44,110,203,0.3)" }}>Start Free Trial</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "96px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(44,110,203,0.25)", border: "1px solid rgba(44,110,203,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
            <span style={{ fontSize: 13, color: "#93c5fd", fontWeight: 500 }}>Built for Shopify Merchants</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.15, marginBottom: 22, letterSpacing: "-1px" }}>
            Know exactly where your<br />traffic comes from
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40, maxWidth: 620, margin: "0 auto 40px" }}>
            Track Your Traffic gives you real-time UTM analytics, campaign attribution, and traffic source insights — built directly into your Shopify admin.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#" style={{ padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#ffffff", backgroundColor: "#2c6ecb", textDecoration: "none", boxShadow: "0 4px 14px rgba(44,110,203,0.5)", display: "inline-block" }}>
              Start Free Trial
            </a>
            <a href="/pricing" style={{ padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: "#ffffff", backgroundColor: "transparent", textDecoration: "none", border: "2px solid rgba(255,255,255,0.35)", display: "inline-block" }}>
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.5px" }}>Everything you need to understand your traffic</h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 540, margin: "0 auto" }}>Powerful analytics features designed specifically for Shopify store owners — no data science degree required.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

          {/* Card 1: Real-Time Traffic Dashboard */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="13" width="4" height="9" rx="1" fill="#2c6ecb" />
                <rect x="9" y="9" width="4" height="13" rx="1" fill="#2c6ecb" />
                <rect x="16" y="5" width="4" height="17" rx="1" fill="#2c6ecb" />
                <circle cx="4" cy="11" r="1.5" fill="#2c6ecb" />
                <circle cx="11" cy="7" r="1.5" fill="#2c6ecb" />
                <circle cx="18" cy="3" r="1.5" fill="#2c6ecb" />
                <path d="M4 11 L11 7 L18 3" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Real-Time Traffic Dashboard</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>See every visit as it happens. Monitor total visits, unique visitors, top channels, and today's activity in one beautiful dashboard.</p>
          </div>

          {/* Card 2: UTM Campaign Tracking */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="7" r="1.5" fill="#10b981" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>UTM Campaign Tracking</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Create and manage UTM campaigns, track performance per campaign, and attribute visits to specific marketing efforts with full UTM parameter support.</p>
          </div>

          {/* Card 3: Traffic Source Analytics */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#a855f7" strokeWidth="2" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Traffic Source Analytics</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Identify where your visitors come from — organic search, paid ads, social media, email, or direct. Break down by source, medium, and channel.</p>
          </div>

          {/* Card 4: UTM Link Builder */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>UTM Link Builder</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Build properly formatted UTM URLs in seconds. Bulk-generate tagged links for your landing pages and share them directly from the app.</p>
          </div>

          {/* Card 5: Device & Country Stats */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="2" width="10" height="20" rx="3" stroke="#2c6ecb" strokeWidth="2" />
                <circle cx="12" cy="17.5" r="1" fill="#2c6ecb" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Device &amp; Country Stats</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Understand your audience. See the breakdown of mobile, tablet, and desktop visitors alongside the top countries driving your traffic.</p>
          </div>

          {/* Card 6: Data Export */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Data Export</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Export your analytics data as CSV for further analysis in Excel, Google Sheets, or your BI tool of choice. Available on Pro and Growth plans.</p>
          </div>

          {/* Card 7: Bot & IP Filtering */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="9" y1="12" x2="15" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Bot &amp; IP Filtering</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Automatically filter out bot traffic and known crawlers. Exclude specific IPs and custom patterns to keep your data clean and accurate.</p>
          </div>

          {/* Card 8: Privacy-First Analytics */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6b7280" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.5" fill="#6b7280" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Privacy-First Analytics</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>No cookies, no PII. We use anonymized visitor hashes (SHA-256) that cannot identify individuals. GDPR and CCPA compliant by design.</p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: "#f3f4f6", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.5px" }}>Up and running in minutes</h2>
            <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>No developers needed. No code required. Just install, add a block, and start seeing data.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>

            {/* Step 1 */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 32, border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#2c6ecb", color: "#ffffff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>1</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Install the App</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Install from the Shopify App Store. OAuth authentication sets everything up automatically.</p>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 32, border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#2c6ecb", color: "#ffffff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>2</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Add the Tracking Block</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Go to your theme editor, add the Track Your Traffic block. Takes under 1 minute, no code required.</p>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: 32, border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#2c6ecb", color: "#ffffff", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>3</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>See Your Data</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Visits start appearing in your dashboard immediately. Filter by date range, channel, source, or campaign.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#111827", marginBottom: 12, letterSpacing: "-0.5px" }}>Track Your Traffic vs. Google Analytics for Shopify</h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 520, margin: "0 auto" }}>We built something purpose-made for Shopify — not a ported enterprise tool that requires a consultant to configure.</p>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "16px 24px", textAlign: "left", fontWeight: 700, color: "#111827", borderBottom: "1px solid #e5e7eb", width: "40%" }}>Feature</th>
                <th style={{ padding: "16px 24px", textAlign: "center", fontWeight: 700, color: "#2c6ecb", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="28" height="28" rx="6" fill="#2c6ecb" />
                      <rect x="5" y="16" width="4" height="7" rx="1" fill="white" />
                      <rect x="12" y="11" width="4" height="12" rx="1" fill="white" />
                      <rect x="19" y="6" width="4" height="17" rx="1" fill="white" />
                    </svg>
                    Track Your Traffic
                  </div>
                </th>
                <th style={{ padding: "16px 24px", textAlign: "center", fontWeight: 700, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Google Analytics</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Setup complexity", tyt: "Simple", ga: "Complex" },
                { feature: "Shopify Admin embedded", tyt: "Yes", ga: "No" },
                { feature: "UTM campaign builder", tyt: "Built-in", ga: "No" },
                { feature: "Privacy-first", tyt: "Yes", ga: "Requires config" },
                { feature: "Price", tyt: "From $10/mo", ga: "Free but complex" },
              ].map((row, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                  <td style={{ padding: "15px 24px", color: "#374151", fontWeight: 500, borderBottom: "1px solid #f3f4f6" }}>{row.feature}</td>
                  <td style={{ padding: "15px 24px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      color: row.tyt === "No" || row.tyt === "Complex" ? "#ef4444" : "#10b981",
                      fontWeight: 600, fontSize: 14
                    }}>
                      {row.tyt === "No" || row.tyt === "Complex" ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#fef2f2" /><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#ecfdf5" /><path d="M3.5 7l2.5 2.5L10.5 5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                      {row.tyt}
                    </span>
                  </td>
                  <td style={{ padding: "15px 24px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      color: row.ga === "No" || row.ga === "Complex" || row.ga === "Requires config" ? "#ef4444" : "#6b7280",
                      fontWeight: 600, fontSize: 14
                    }}>
                      {row.ga === "No" || row.ga === "Complex" || row.ga === "Requires config" ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#fef2f2" /><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#f3f4f6" /><path d="M3.5 7l2.5 2.5L10.5 5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                      {row.ga}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: "#2c6ecb", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", marginBottom: 14, letterSpacing: "-0.5px" }}>Ready to understand your traffic?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 36, lineHeight: 1.6 }}>Start your 7-day free trial today. No credit card required.</p>
          <a href="#" style={{ display: "inline-block", padding: "15px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700, color: "#2c6ecb", backgroundColor: "#ffffff", textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
            Start Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#111827", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>© 2026 AddOne Plugins. All rights reserved.</p>
          <nav style={{ display: "flex", gap: 20 }}>
            <a href="/privacy" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/terms" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>Terms of Service</a>
            <a href="/help" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>Help</a>
          </nav>
        </div>
      </footer>

    </div>
  );
}
