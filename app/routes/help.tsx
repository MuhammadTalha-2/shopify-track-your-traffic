import { useState } from "react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I install the tracking block?",
      answer:
        "Go to Online Store → Themes → Customize → Add block → Apps → Track Your Traffic Tracker → Save. The block will then begin tracking visitors on all pages of your store.",
    },
    {
      question: "Why am I not seeing any visits?",
      answer:
        "There are a few common reasons: the block may not have been added to your theme yet, visits from the store admin are excluded by default, your browser cache or incognito mode may be interfering, or rate limiting may be active if there is a high burst of traffic.",
    },
    {
      question: "What is a UTM campaign?",
      answer:
        "UTM parameters are URL query string tags (utm_source, utm_medium, utm_campaign, utm_term, utm_content) that you append to your marketing links. They allow Track Your Traffic to attribute each visit to the correct campaign, channel, and source so you can measure the performance of your marketing efforts.",
    },
    {
      question: "How do unique visitors work?",
      answer:
        "Unique visitors are identified using an anonymized SHA-256 hash of the visitor's IP address, User-Agent string, and the current date. No personally identifiable information (PII) is stored. The hash resets daily, so a visitor returning the next day is counted as a new unique visitor.",
    },
    {
      question: "Can I track multiple pages?",
      answer:
        "Yes. Once you add the Track Your Traffic block to your theme, it runs automatically on every page of your store. There is no need to add it page by page.",
    },
    {
      question: "How do I export my data?",
      answer:
        "Data export is available on the Pro and Growth plans. Navigate to your dashboard and click the Export button in the top-right corner to download your analytics data as a CSV file.",
    },
    {
      question: "How do I delete my data?",
      answer:
        "Go to Settings → Data Management tab → Delete all data and confirm the action. All stored analytics will be permanently removed. Additionally, if you uninstall the app, all data is automatically deleted within 48 hours.",
    },
    {
      question: "Which plan should I choose?",
      answer:
        "Choose Starter if you run a small store and need basic traffic insights. Choose Pro if you have an established store running marketing campaigns and need UTM tracking and exports. Choose Growth if you run a high-volume store and need full analytics, priority support, and the highest data retention.",
    },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#111827", background: "#f9fafb", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="12" width="4" height="10" rx="1" fill="#2c6ecb" />
              <rect x="8" y="7" width="4" height="15" rx="1" fill="#2c6ecb" />
              <rect x="14" y="3" width="4" height="19" rx="1" fill="#2c6ecb" />
              <rect x="20" y="9" width="2" height="13" rx="1" fill="#93c5fd" />
            </svg>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Track Your Traffic</span>
          </a>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <a href="/features" style={{ padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>Features</a>
            <a href="/pricing" style={{ padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>Pricing</a>
            <a href="/help" style={{ padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: "#2c6ecb", background: "#eff6ff" }}>Help</a>
            <a href="/privacy" style={{ padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>Privacy</a>
            <a
              href="mailto:support@addoneplugins.com"
              style={{ marginLeft: "8px", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600, color: "#ffffff", background: "#2c6ecb" }}
            >
              Get Support
            </a>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2c6ecb 100%)", color: "#ffffff", padding: "72px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", background: "rgba(255,255,255,0.15)", borderRadius: "16px", marginBottom: "24px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path d="M12 8v4l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: 800, margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>Help Center</h1>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.6 }}>Everything you need to get started with Track Your Traffic</p>
          </div>
        </section>

        {/* Quick Start */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px", color: "#111827" }}>Quick Start</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "16px", marginBottom: "40px" }}>Get up and running in three simple steps</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>

            {/* Step 1 */}
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", position: "relative", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#2c6ecb" }}>1</div>
              <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {/* Puzzle piece icon */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.5 2.5 0 0 1 0 5H2V19a2 2 0 0 0 2 2h3.8v-1.5a2.5 2.5 0 0 1 5 0V21H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5Z" stroke="#2c6ecb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0", color: "#111827" }}>Install the App</h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: 0, lineHeight: 1.65 }}>Install Track Your Traffic from the Shopify App Store and approve the required permissions to connect your store.</p>
            </div>

            {/* Step 2 */}
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", position: "relative", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "28px", height: "28px", borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#10b981" }}>2</div>
              <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {/* Chart bar icon */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="13" width="4" height="8" rx="1" fill="#10b981" />
                  <rect x="9" y="8" width="4" height="13" rx="1" fill="#10b981" />
                  <rect x="15" y="4" width="4" height="17" rx="1" fill="#10b981" />
                  <path d="M2 21h20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0", color: "#111827" }}>Add Tracking Block</h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: 0, lineHeight: 1.65 }}>In your Shopify theme editor, add the Track Your Traffic block to your theme and save. It will begin recording visits immediately.</p>
            </div>

            {/* Step 3 */}
            <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", position: "relative", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "absolute", top: "20px", right: "20px", width: "28px", height: "28px", borderRadius: "50%", background: "#fdf4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#9333ea" }}>3</div>
              <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#fdf4ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {/* Eye icon */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="#9333ea" strokeWidth="2" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0", color: "#111827" }}>View Analytics</h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: 0, lineHeight: 1.65 }}>Open the Track Your Traffic dashboard inside Shopify admin to see visits, unique visitors, top pages, UTM campaigns, and more.</p>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: "#ffffff", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "64px 24px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px", color: "#111827" }}>Frequently Asked Questions</h2>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: "16px", marginBottom: "40px" }}>Answers to the most common questions</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#ffffff" }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{faq.question}</span>
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: openFaq === index ? "#eff6ff" : "#f3f4f6" }}>
                      {openFaq === index ? (
                        /* Minus icon */
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14" stroke="#2c6ecb" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      ) : (
                        /* Plus icon */
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5v14M5 12h14" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div style={{ padding: "0 24px 20px 24px", borderTop: "1px solid #f3f4f6" }}>
                      <p style={{ margin: "16px 0 0 0", fontSize: "15px", color: "#6b7280", lineHeight: 1.7 }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2c6ecb 100%)", borderRadius: "16px", padding: "48px 40px", textAlign: "center", color: "#ffffff" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", background: "rgba(255,255,255,0.15)", borderRadius: "14px", marginBottom: "20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 12px 0" }}>Still need help?</h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", margin: "0 0 28px 0", lineHeight: 1.6 }}>Our support team is ready to assist you with any questions or issues.</p>
            <a
              href="mailto:support@addoneplugins.com"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#ffffff", color: "#2c6ecb", padding: "14px 28px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "16px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" stroke="#2c6ecb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22,6 12,13 2,6" stroke="#2c6ecb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              support@addoneplugins.com
            </a>
            <p style={{ marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Usually within 24 hours</p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: "#111827", color: "#9ca3af", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>© 2026 AddOne Plugins. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="/privacy" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</a>
            <a href="/terms" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Terms of Service</a>
            <a href="/help" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Help</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
