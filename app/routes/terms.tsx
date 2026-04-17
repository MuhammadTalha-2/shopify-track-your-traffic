/**
 * GET /terms
 *
 * Public Terms of Service page — required for Shopify App Store submission.
 * No authentication required.
 */

import React from "react";

const SECTION: React.CSSProperties = { marginBottom: 36 };
const H2: React.CSSProperties = { fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#202223" };
const H3: React.CSSProperties = { fontSize: 16, fontWeight: 600, marginBottom: 8, marginTop: 16, color: "#202223" };
const P: React.CSSProperties = { marginTop: 0, marginBottom: 12 };
const UL: React.CSSProperties = { paddingLeft: 24, marginTop: 8, marginBottom: 12 };
const LI: React.CSSProperties = { marginBottom: 6 };

export default function TermsOfService() {
  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#202223",
      lineHeight: 1.75,
      fontSize: 15,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Top Navigation */}
      <header style={{
        borderBottom: "1px solid #e1e3e5",
        padding: "0 24px",
        background: "#fff",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#2c6ecb" fillOpacity="0.1" />
              <rect x="5" y="17" width="4" height="7" rx="1" fill="#2c6ecb" />
              <rect x="12" y="11" width="4" height="13" rx="1" fill="#2c6ecb" />
              <rect x="19" y="5" width="4" height="19" rx="1" fill="#2c6ecb" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#202223" }}>Track Your Traffic</span>
          </a>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing",  href: "/pricing"  },
              { label: "Help",     href: "/help"     },
              { label: "Privacy",  href: "/privacy"  },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                style={{
                  color: "#6d7175",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#2c6ecb")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6d7175")}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Body */}
      <main style={{ flex: 1 }}>
        <div style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "56px 24px 80px",
        }}>

          {/* Page Title */}
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>Terms of Service</h1>
          <p style={{ color: "#6d7175", marginBottom: 8 }}>
            <strong>App:</strong> Track Your Traffic — Shopify App
          </p>
          <p style={{ color: "#6d7175", marginBottom: 48 }}>
            <strong>Last updated:</strong> April 17, 2026
          </p>

          {/* 1. Acceptance of Terms */}
          <section style={SECTION}>
            <h2 style={H2}>1. Acceptance of Terms</h2>
            <p style={P}>
              By installing, accessing, or using the Track Your Traffic Shopify application
              (the "App"), you ("Merchant" or "you") agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, do not install or use the App.
            </p>
            <p style={P}>
              These Terms constitute a legally binding agreement between you and AddOne Plugins
              ("we", "us", or "our"), the developer of the App. Your continued use of the App
              following any update to these Terms constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section style={SECTION}>
            <h2 style={H2}>2. Description of Service</h2>
            <p style={P}>
              Track Your Traffic is an analytics tracking application for Shopify stores. The App
              provides merchants with insights into their store traffic, including:
            </p>
            <ul style={UL}>
              <li style={LI}>Traffic source attribution (organic, paid, social, email, direct, referral)</li>
              <li style={LI}>UTM campaign tracking and performance reporting</li>
              <li style={LI}>Landing page and device breakdown analytics</li>
              <li style={LI}>Visitor trends across custom date ranges</li>
              <li style={LI}>Country-level traffic distribution</li>
            </ul>
            <p style={P}>
              The App is offered as a software-as-a-service (SaaS) product and requires an active
              Shopify store to function. We reserve the right to modify, suspend, or discontinue any
              part of the App at any time with reasonable notice.
            </p>
          </section>

          {/* 3. User Accounts and Access */}
          <section style={SECTION}>
            <h2 style={H2}>3. User Accounts and Access</h2>

            <h3 style={H3}>Shopify OAuth Authentication</h3>
            <p style={P}>
              Access to the App is granted through Shopify's OAuth 2.0 authorization flow. You must
              have a valid Shopify account and an active Shopify store to install and use the App.
              We do not maintain separate user credentials; your Shopify store identity serves as
              your account.
            </p>

            <h3 style={H3}>Merchant Responsibilities</h3>
            <p style={P}>
              As a merchant, you are responsible for:
            </p>
            <ul style={UL}>
              <li style={LI}>Maintaining the security and confidentiality of your Shopify account credentials</li>
              <li style={LI}>Ensuring that your use of the App complies with all applicable laws and regulations</li>
              <li style={LI}>Informing your store visitors about analytics tracking in your store's own Privacy Policy</li>
              <li style={LI}>Ensuring any use of the data provided by the App is lawful and ethical</li>
              <li style={LI}>Any activity that occurs under your store's connection to the App</li>
            </ul>
            <p style={P}>
              You may not share, sublicense, resell, or transfer access to the App to any third party.
            </p>
          </section>

          {/* 4. Subscription and Billing */}
          <section style={SECTION}>
            <h2 style={H2}>4. Subscription and Billing</h2>

            <h3 style={H3}>Plans</h3>
            <p style={P}>The App is offered under the following subscription plans:</p>
            <ul style={UL}>
              <li style={LI}><strong>Starter — $10/month:</strong> Core analytics features for small stores</li>
              <li style={LI}><strong>Pro — $25/month:</strong> Advanced campaign tracking and UTM management</li>
              <li style={LI}><strong>Growth — $49/month:</strong> Full feature access with extended data retention and priority support</li>
            </ul>

            <h3 style={H3}>Free Trial</h3>
            <p style={P}>
              All plans include a 7-day free trial. No charges are applied during the trial period.
              If you do not cancel before the trial ends, your selected plan will automatically
              activate and billing will commence through Shopify's billing system.
            </p>

            <h3 style={H3}>Billing Cycle</h3>
            <p style={P}>
              Subscriptions are billed on a monthly or annual basis, depending on the option you
              select at checkout. Annual billing is paid upfront and typically offers a discounted
              rate compared to monthly billing. All payments are processed by Shopify in accordance
              with their billing terms.
            </p>

            <h3 style={H3}>Refund Policy</h3>
            <p style={P}>
              Refunds are available within the 7-day free trial period. After the trial period ends
              and billing has commenced, we do not offer refunds for any partial billing period,
              unused features, or unused time remaining on a subscription. If you believe a charge
              was made in error, please contact us at{" "}
              <a href="mailto:support@addoneplugins.com" style={{ color: "#2c6ecb" }}>
                support@addoneplugins.com
              </a>{" "}
              within 14 days of the charge.
            </p>
          </section>

          {/* 5. Acceptable Use */}
          <section style={SECTION}>
            <h2 style={H2}>5. Acceptable Use</h2>

            <h3 style={H3}>Permitted Use</h3>
            <p style={P}>You may use the App to:</p>
            <ul style={UL}>
              <li style={LI}>Monitor and analyze traffic to your own Shopify store</li>
              <li style={LI}>Track UTM campaign performance for your own marketing activities</li>
              <li style={LI}>Export and use analytics data for your own internal business purposes</li>
              <li style={LI}>Share analytics reports internally within your organization</li>
            </ul>

            <h3 style={H3}>Prohibited Use</h3>
            <p style={P}>You must not use the App to:</p>
            <ul style={UL}>
              <li style={LI}>Track visitors or analytics on any store or website you do not own or have authorization to monitor</li>
              <li style={LI}>Attempt to reverse-engineer, decompile, or extract the App's source code or underlying algorithms</li>
              <li style={LI}>Resell, sublicense, or redistribute the App or its data to third parties</li>
              <li style={LI}>Interfere with or disrupt the App's infrastructure or other users' access</li>
              <li style={LI}>Circumvent any rate limits, access controls, or security measures</li>
              <li style={LI}>Use the App for any unlawful purpose or in violation of applicable laws</li>
              <li style={LI}>Attempt to access data belonging to other merchants</li>
            </ul>
            <p style={P}>
              Violation of these acceptable use terms may result in immediate suspension or
              termination of your access to the App without refund.
            </p>
          </section>

          {/* 6. Data and Privacy */}
          <section style={SECTION}>
            <h2 style={H2}>6. Data and Privacy</h2>
            <p style={P}>
              Your use of the App is also governed by our{" "}
              <a href="/privacy" style={{ color: "#2c6ecb" }}>Privacy Policy</a>, which is
              incorporated into these Terms by reference. By using the App, you consent to the
              data practices described in our Privacy Policy.
            </p>
            <p style={P}>
              The App is designed with privacy by default. We do not store raw IP addresses,
              cookies, or any personally identifiable information (PII) about your store visitors.
              Analytics data is associated with your shop domain only and is never shared with
              other merchants or third parties beyond our infrastructure providers.
            </p>
            <p style={P}>
              If your store operates in the European Economic Area (EEA) or serves EEA customers,
              you are responsible for ensuring your use of the App complies with the General Data
              Protection Regulation (GDPR). Because the App does not process PII, it is designed
              to operate in a GDPR-compatible manner; however, you remain the data controller for
              your store visitors and are responsible for your own compliance obligations.
            </p>
          </section>

          {/* 7. Intellectual Property */}
          <section style={SECTION}>
            <h2 style={H2}>7. Intellectual Property</h2>
            <p style={P}>
              The App, including its source code, design, algorithms, interface, branding, and all
              associated intellectual property, is owned exclusively by AddOne Plugins. All rights
              are reserved.
            </p>
            <p style={P}>
              These Terms do not grant you any ownership rights in the App. Your subscription
              grants you a limited, non-exclusive, non-transferable, revocable license to access
              and use the App solely for your own internal business purposes during the subscription
              term.
            </p>
            <p style={P}>
              Any feedback, suggestions, or ideas you submit to us regarding the App may be used by
              AddOne Plugins without restriction or compensation to you.
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section style={SECTION}>
            <h2 style={H2}>8. Limitation of Liability</h2>
            <p style={P}>
              To the maximum extent permitted by applicable law, AddOne Plugins shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, including
              but not limited to loss of profits, loss of data, loss of goodwill, service
              interruption, computer damage, or system failure, even if we have been advised of
              the possibility of such damages.
            </p>
            <p style={P}>
              Our total cumulative liability to you for any claims arising out of or related to
              these Terms or the App shall not exceed the total amount you have paid to us in the
              three (3) months immediately preceding the claim.
            </p>
            <p style={P}>
              The App is provided "as is" and "as available" without warranties of any kind, either
              express or implied, including but not limited to warranties of merchantability, fitness
              for a particular purpose, or non-infringement. We do not warrant that the App will be
              uninterrupted, error-free, or completely secure.
            </p>
          </section>

          {/* 9. Termination */}
          <section style={SECTION}>
            <h2 style={H2}>9. Termination</h2>

            <h3 style={H3}>By Merchant</h3>
            <p style={P}>
              You may terminate your use of the App at any time by uninstalling it from your
              Shopify store through the Shopify admin panel. Uninstalling the App will cancel your
              active subscription at the end of the current billing period (no mid-period refunds).
            </p>

            <h3 style={H3}>Data Deletion</h3>
            <p style={P}>
              Upon uninstallation, all analytics data associated with your shop domain will be
              permanently and irreversibly deleted within 48 hours. This action cannot be undone.
              If you reinstall the App after this window, your historical data will not be
              recoverable.
            </p>

            <h3 style={H3}>By AddOne Plugins</h3>
            <p style={P}>
              We reserve the right to suspend or terminate your access to the App at any time if
              you violate these Terms, engage in fraudulent activity, or if we are required to do
              so by law. In the event of termination by us without cause, we will provide a
              prorated refund for any unused portion of a paid subscription period.
            </p>
          </section>

          {/* 10. Changes to Terms */}
          <section style={SECTION}>
            <h2 style={H2}>10. Changes to Terms</h2>
            <p style={P}>
              We may update or modify these Terms of Service from time to time at our discretion.
              When we make material changes, we will update the "Last updated" date at the top of
              this page.
            </p>
            <p style={P}>
              We will notify active merchants of significant changes via an in-app notification
              within the App's dashboard. It is your responsibility to review the updated Terms.
              Your continued use of the App after changes are posted constitutes your acceptance
              of the revised Terms. If you do not agree to the updated Terms, you must stop using
              the App and uninstall it from your store.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section style={SECTION}>
            <h2 style={H2}>11. Governing Law</h2>
            <p style={P}>
              These Terms shall be governed by and construed in accordance with applicable
              international commercial law principles. We are committed to complying with all
              relevant laws and regulations in the jurisdictions in which we operate, including
              but not limited to consumer protection laws, data protection regulations (such as
              GDPR), and e-commerce regulations.
            </p>
            <p style={P}>
              Any disputes arising out of or in connection with these Terms that cannot be resolved
              informally shall be submitted to binding arbitration or the appropriate courts of
              competent jurisdiction, as mutually agreed upon by the parties. Nothing in this
              section limits your rights as a consumer under local mandatory law.
            </p>
          </section>

          {/* 12. Contact */}
          <section style={SECTION}>
            <h2 style={H2}>12. Contact</h2>
            <p style={P}>
              If you have any questions, concerns, or requests regarding these Terms of Service,
              please reach out to us:
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

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #e1e3e5",
        background: "#f6f6f7",
        padding: "24px 24px",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 13,
          color: "#6d7175",
        }}>
          <span>© 2026 AddOne Plugins. All rights reserved.</span>
          <nav style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Privacy Policy",    href: "/privacy" },
              { label: "Terms of Service",  href: "/terms"   },
              { label: "Help",              href: "/help"    },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                style={{
                  color: "#6d7175",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#2c6ecb")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6d7175")}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  );
}
