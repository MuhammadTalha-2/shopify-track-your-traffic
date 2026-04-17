import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { useCallback, useState } from "react";
import { authenticate } from "../shopify.server";
import { getDashboardStats } from "../lib/queries.server";
import { getSetting, setSetting } from "~/lib/settings.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10) || 30;
  const stats = await getDashboardStats(session.shop, days);

  // Check if setup banner was already dismissed
  const setupDismissed = (await getSetting(session.shop, "setup_dismissed")) === "true";

  // Check if the theme app block is installed by inspecting settings_data.json
  let blockInstalled = false;
  if (!setupDismissed) {
    try {
      const shop  = session.shop;
      const token = session.accessToken!;
      const themesRes = await fetch(`https://${shop}/admin/api/2026-04/themes.json?role=main`, {
        headers: { "X-Shopify-Access-Token": token },
      });
      if (themesRes.ok) {
        const themesData = (await themesRes.json()) as { themes?: { id: number }[] };
        const mainTheme = themesData?.themes?.[0];
        if (mainTheme?.id) {
          const assetRes = await fetch(
            `https://${shop}/admin/api/2026-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
            { headers: { "X-Shopify-Access-Token": token } },
          );
          if (assetRes.ok) {
            const assetData = (await assetRes.json()) as { asset?: { value?: string } };
            const content = assetData?.asset?.value ?? "";
            // Extension UUID from shopify.extension.toml
            blockInstalled = content.includes("58bfcf2c-0a51-d6d8-ed5a-7d611357865d1920ccde");
          }
        }
      }
    } catch {
      // Non-fatal — show banner by default if API check fails
    }
  }

  return {
    stats,
    shopDomain: session.shop,
    showSetupBanner: !setupDismissed && !blockInstalled,
  };
};

// ── Action (dismiss setup banner) ────────────────────────────────────────────

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* ignore */ }
  if (body.intent === "dismiss_setup") {
    await setSetting(session.shop, "setup_dismissed", "true");
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false }, { status: 400 });
};

// ── Channel config ────────────────────────────────────────────────────────────

const CHANNEL_TONE: Record<string, "success" | "info" | "attention" | "magic" | "warning" | "neutral"> = {
  organic_search:  "success",
  paid_search:     "info",
  google_shopping: "attention",
  organic_social:  "magic",
  paid_social:     "magic",
  email:           "warning",
  referral:        "success",
  direct:          "neutral",
  affiliate:       "warning",
  display:         "info",
  other:           "neutral",
};

function channelLabel(channel: string) {
  return channel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pctDiff(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

function changeTone(pct: number): "success" | "critical" | "warning" {
  return pct > 0 ? "success" : pct < 0 ? "critical" : "warning";
}

const DEVICE_ICON: Record<string, string> = {
  mobile:  "mobile",
  tablet:  "tablet",
  desktop: "desktop",
};

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label, value, subtext, pct, channelBadge,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  pct?: number;
  channelBadge?: { channel: string };
}) {
  return (
    <s-box padding="base" border="base" borderRadius="base" background="base">
      <s-stack gap="small-200">
        <s-text color="subdued">{label}</s-text>
        <s-stack direction="inline" gap="small-300" align-items="center">
          <s-heading>{String(value)}</s-heading>
          {pct !== undefined && pct !== 0 && (
            <s-badge
              tone={changeTone(pct)}
              icon={pct > 0 ? "arrow-up" : "arrow-down"}
            >
              {Math.abs(pct)}%
            </s-badge>
          )}
          {channelBadge && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <s-badge
              tone={(CHANNEL_TONE[channelBadge.channel] ?? "neutral") as any}
            >
              {channelLabel(channelBadge.channel)}
            </s-badge>
          )}
        </s-stack>
        {subtext && <s-text color="subdued">{subtext}</s-text>}
      </s-stack>
    </s-box>
  );
}

// ── Inline progress bar ───────────────────────────────────────────────────────

function Bar({ value, max, color = "#2c6ecb" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0, height: 6, background: "#e1e3e5", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#6d7175", minWidth: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
    </div>
  );
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: { date: string; visits: number; uniques: number }[] }) {
  if (!data.length) {
    return (
      <s-box padding="base">
        <s-stack align-items="center" gap="base">
          {/* @ts-expect-error - chart-bar and large are valid runtime values not yet in polaris-types */}
          <s-icon type="chart-bar" color="subdued" size="large" />
          <s-text color="subdued">No traffic data for this period.</s-text>
        </s-stack>
      </s-box>
    );
  }

  const width = 800;
  const height = 220;
  const pad = { top: 20, right: 20, bottom: 36, left: 44 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;
  const maxV = Math.max(...data.map((d) => d.visits), 1);

  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * cW;
  const toY = (v: number) => pad.top + cH - (v / maxV) * cH;

  const visitPath  = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.visits)}`).join(" ");
  const uniquePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.uniques)}`).join(" ");
  const areaPath =
    `M ${toX(0)} ${toY(data[0].visits)} ` +
    data.map((d, i) => `L ${toX(i)} ${toY(d.visits)}`).join(" ") +
    ` L ${toX(data.length - 1)} ${pad.top + cH} L ${toX(0)} ${pad.top + cH} Z`;

  const yTicks  = [0, Math.round(maxV / 2), maxV];
  const step    = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="Daily traffic trend chart"
    >
      <defs>
        <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c6ecb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2c6ecb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((val) => {
        const y = toY(val);
        return (
          <g key={val}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e1e3e5" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#8c9196">
              {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#visitGrad)" />
      <path d={uniquePath} fill="none" stroke="#8c9196" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" />
      <path d={visitPath}  fill="none" stroke="#2c6ecb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.length <= 31 &&
        data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.visits)} r="3" fill="#2c6ecb" stroke="#fff" strokeWidth="1.5" />
        ))}
      {xLabels.map((d) => {
        const i = data.indexOf(d);
        return (
          <text key={d.date} x={toX(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#8c9196">
            {d.date.slice(5)}
          </text>
        );
      })}
      <line x1={width - 190} y1={10} x2={width - 172} y2={10} stroke="#2c6ecb" strokeWidth="2.5" />
      <text x={width - 168} y={14} fontSize="11" fill="#6d7175">Visits</text>
      <line x1={width - 110} y1={10} x2={width - 92} y2={10} stroke="#8c9196" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x={width - 88} y={14} fontSize="11" fill="#6d7175">Uniques</text>
    </svg>
  );
}

// ── Setup Banner ──────────────────────────────────────────────────────────────

const EXT_UUID = "58bfcf2c-0a51-d6d8-ed5a-7d611357865d1920ccde";

function SetupBanner({ shopDomain, onDismiss }: { shopDomain: string; onDismiss: () => void }) {
  const deepLink =
    `https://${shopDomain}/admin/themes/current/editor` +
    `?template=index&addAppBlockId=${encodeURIComponent(`${EXT_UUID}/tyt-tracker-embed`)}&target=newAppsSection`;

  return (
    <s-section>
      <div style={{
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        borderRadius: 8,
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Warning icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <path fillRule="evenodd" clipRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
              fill="#d97706" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#92400e", marginBottom: 4 }}>
              Tracking is not active yet
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#78350f", marginBottom: 12 }}>
              Add the <strong>Track Your Traffic</strong> block to your theme to start counting visits. Takes less than 1 minute.
            </p>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="#10b981" />
                  <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: "#374151" }}>App installed</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.5" fill="none" />
                  <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#d97706" fontWeight="bold">2</text>
                </svg>
                <span style={{ color: "#374151", fontWeight: 600 }}>Add tracking block to theme</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href={deepLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#2c6ecb", color: "#fff",
                  padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Open Theme Editor
              </a>
              <button
                onClick={onDismiss}
                style={{
                  background: "transparent", border: "1px solid #d97706",
                  color: "#92400e", padding: "8px 16px", borderRadius: 6,
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
              >
                I've already done this
              </button>
            </div>
          </div>

          {/* Dismiss X */}
          <button
            onClick={onDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#92400e", flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </s-section>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const DATE_RANGES = [
  { value: "7",   label: "7 days"  },
  { value: "14",  label: "14 days" },
  { value: "30",  label: "30 days" },
  { value: "90",  label: "90 days" },
  { value: "365", label: "1 year"  },
] as const;

export default function Dashboard() {
  const { stats, showSetupBanner, shopDomain } = useLoaderData<typeof loader>();
  const navigate  = useNavigate();
  const [days, setDays] = useState(String(stats.period));
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleDismissSetup = useCallback(async () => {
    setBannerDismissed(true);
    await fetch("/app/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "dismiss_setup" }),
    });
  }, []);

  const visitsPct   = pctDiff(stats.totalVisits,    stats.prevTotalVisits);
  const uniquesPct  = pctDiff(stats.uniqueVisitors, stats.prevUniqueVisitors);
  const todayPct    =
    stats.yesterday > 0
      ? Math.round(((stats.today - stats.yesterday) / stats.yesterday) * 100)
      : stats.today > 0 ? 100 : 0;

  const topChannel = stats.byChannel[0];
  const maxSourceVisits  = Math.max(...stats.topSources.map((r) => r.visits), 1);
  const maxPageVisits    = Math.max(...stats.topPages.map((r) => r.visits), 1);
  const maxCountryVisits = Math.max(...stats.byCountry.map((r) => r.visits), 1);

  const totalDeviceVisits = stats.byDevice.reduce((s, r) => s + r.visits, 0) || 1;

  return (
    <s-page heading="Track Your Traffic" inline-size="full">
      {showSetupBanner && !bannerDismissed && (
        <SetupBanner shopDomain={shopDomain} onDismiss={handleDismissSetup} />
      )}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .tyt-kpi-grid       { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .tyt-two-col-grid   { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:0 0 16px; }
        .tyt-three-col-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; padding:0 0 16px; }
        /* Critical: prevent grid children from overflowing their cell */
        .tyt-two-col-grid   > *,
        .tyt-three-col-grid > * { min-width: 0; overflow: hidden; }
        /* Scrollable table wrapper so long content scrolls inside the card */
        .tyt-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
        .tyt-table-wrap table,
        .tyt-table-wrap s-table { width: 100%; }
        /* Period selector scrolls horizontally on very small screens */
        .tyt-period-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
        @media (max-width:1100px) { .tyt-three-col-grid { grid-template-columns:1fr 1fr; } }
        @media (max-width:900px)  { .tyt-kpi-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:600px)  {
          .tyt-kpi-grid       { grid-template-columns:1fr; }
          .tyt-two-col-grid   { grid-template-columns:1fr; }
          .tyt-three-col-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Period selector ──────────────────────────────────────────────── */}
      <s-section padding="none">
        <s-box padding="base">
          <div className="tyt-period-wrap">
            <s-stack direction="inline" gap="small-200" align-items="center">
              <s-text color="subdued">Period:</s-text>
              {DATE_RANGES.map((r) => (
                <s-button
                  key={r.value}
                  variant={days === r.value ? "primary" : "secondary"}
                  onClick={() => {
                    setDays(r.value);
                    navigate(`?days=${r.value}`, { replace: true });
                  }}
                >
                  {r.label}
                </s-button>
              ))}
            </s-stack>
          </div>
        </s-box>
      </s-section>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <s-section padding="base">
        <div className="tyt-kpi-grid">
          <MetricCard
            label="Total Visits"
            value={stats.totalVisits.toLocaleString()}
            pct={visitsPct}
            subtext={`vs prev ${days} days`}
          />
          <MetricCard
            label="Unique Visitors"
            value={stats.uniqueVisitors.toLocaleString()}
            pct={uniquesPct}
            subtext={`vs prev ${days} days`}
          />
          <MetricCard
            label="Top Channel"
            value={topChannel ? channelLabel(topChannel.channel) : "—"}
            subtext={topChannel ? `${topChannel.visits.toLocaleString()} visits` : "No data yet"}
          />
          <MetricCard
            label="Today"
            value={stats.today.toLocaleString()}
            pct={todayPct}
            subtext="vs yesterday"
          />
        </div>
      </s-section>

      {/* ── Daily Trend Chart ────────────────────────────────────────────── */}
      <s-section heading="Daily Traffic Trend">
        <Sparkline data={stats.daily} />
      </s-section>

      {/* ── Traffic by Channel ───────────────────────────────────────────── */}
      <s-section heading="Traffic by Channel">
        {stats.byChannel.length > 0 ? (
          <div className="tyt-table-wrap">
            <s-table variant="auto" accessibility-label="Traffic by channel">
              <s-table-header-row>
                <s-table-header list-slot="primary">Channel</s-table-header>
                <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
                <s-table-header list-slot="labeled" format="numeric">Uniques</s-table-header>
                <s-table-header list-slot="labeled" format="numeric">Share</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {stats.byChannel.map((row) => {
                  const share = stats.totalVisits > 0
                    ? Math.round((row.visits / stats.totalVisits) * 100) : 0;
                  return (
                    <s-table-row key={row.channel}>
                      <s-table-cell>
                        <s-badge tone={(CHANNEL_TONE[row.channel] ?? "neutral") as any}>
                          {channelLabel(row.channel)}
                        </s-badge>
                      </s-table-cell>
                      <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                      <s-table-cell>{row.uniques.toLocaleString()}</s-table-cell>
                      <s-table-cell>{share}%</s-table-cell>
                    </s-table-row>
                  );
                })}
              </s-table-body>
            </s-table>
          </div>
        ) : (
          <s-box padding="base">
            <s-stack align-items="center" gap="small-200">
              {/* @ts-expect-error - chart-bar is a valid runtime value not yet in polaris-types */}
              <s-icon type="chart-bar" color="subdued" />
              <s-text color="subdued">No channel data for this period.</s-text>
            </s-stack>
          </s-box>
        )}
      </s-section>

      {/* ── Top Sources + Top Pages ──────────────────────────────────────── */}
      <div className="tyt-two-col-grid">
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <s-section heading="Top Sources">
            {stats.topSources.length > 0 ? (
              <div className="tyt-table-wrap">
                <s-table variant="auto" accessibility-label="Top traffic sources">
                  <s-table-header-row>
                    <s-table-header list-slot="primary">Source / Medium</s-table-header>
                    <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
                    <s-table-header list-slot="labeled">Share</s-table-header>
                  </s-table-header-row>
                  <s-table-body>
                    {stats.topSources.map((row) => (
                      <s-table-row key={`${row.source}-${row.medium}`}>
                        <s-table-cell>
                          <s-stack gap="small-100">
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                              <s-text type="strong">{row.source}</s-text>
                            </div>
                            {row.medium && <s-text color="subdued">{row.medium}</s-text>}
                          </s-stack>
                        </s-table-cell>
                        <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                        <s-table-cell>
                          <Bar value={row.visits} max={maxSourceVisits} color="#2c6ecb" />
                        </s-table-cell>
                      </s-table-row>
                    ))}
                  </s-table-body>
                </s-table>
              </div>
            ) : (
              <s-box padding="base"><s-text color="subdued">No source data yet.</s-text></s-box>
            )}
          </s-section>
        </div>

        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <s-section heading="Top Landing Pages">
            {stats.topPages.length > 0 ? (
              <div className="tyt-table-wrap">
                <s-table variant="auto" accessibility-label="Top landing pages">
                  <s-table-header-row>
                    <s-table-header list-slot="primary">Page</s-table-header>
                    <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
                    <s-table-header list-slot="labeled">Share</s-table-header>
                  </s-table-header-row>
                  <s-table-body>
                    {stats.topPages.map((row) => (
                      <s-table-row key={row.landingPage}>
                        <s-table-cell>
                          <div title={row.landingPage || "/"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                            <s-text>{row.landingPage || "/"}</s-text>
                          </div>
                        </s-table-cell>
                        <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                        <s-table-cell>
                          <Bar value={row.visits} max={maxPageVisits} color="#10b981" />
                        </s-table-cell>
                      </s-table-row>
                    ))}
                  </s-table-body>
                </s-table>
              </div>
            ) : (
              <s-box padding="base"><s-text color="subdued">No page data yet.</s-text></s-box>
            )}
          </s-section>
        </div>
      </div>

      {/* ── Device + Country ─────────────────────────────────────────────── */}
      <div className="tyt-two-col-grid">
        <div style={{ minWidth: 0, overflow: "hidden" }}>
        <s-section heading="Devices">
          {stats.byDevice.length > 0 ? (
            <s-stack gap="base">
              {stats.byDevice.map((row) => {
                const pct = Math.round((row.visits / totalDeviceVisits) * 100);
                return (
                  <s-stack key={row.deviceType} gap="small-200">
                    <s-stack direction="inline" align-items="center" gap="small-300">
                      {/* @ts-expect-error – icon type valid at runtime */}
                      <s-icon type={DEVICE_ICON[row.deviceType] ?? "desktop"} color="subdued" />
                      <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                        {row.deviceType}
                      </span>
                      <s-text color="subdued">{row.visits.toLocaleString()} visits</s-text>
                    </s-stack>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 8, background: "#e1e3e5", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`, height: "100%",
                          background: row.deviceType === "mobile" ? "#2c6ecb" : row.deviceType === "tablet" ? "#a855f7" : "#10b981",
                          borderRadius: 4,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#6d7175", minWidth: 32 }}>{pct}%</span>
                    </div>
                  </s-stack>
                );
              })}
            </s-stack>
          ) : (
            <s-box padding="base"><s-text color="subdued">No device data yet.</s-text></s-box>
          )}
        </s-section>
        </div>

        <div style={{ minWidth: 0, overflow: "hidden" }}>
        <s-section heading="Top Countries">
          {stats.byCountry.length > 0 ? (
            <div className="tyt-table-wrap">
              <s-table variant="auto" accessibility-label="Top countries">
                <s-table-header-row>
                  <s-table-header list-slot="primary">Country</s-table-header>
                  <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
                  <s-table-header list-slot="labeled">Share</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {stats.byCountry.map((row) => (
                    <s-table-row key={row.country}>
                      <s-table-cell>
                        <s-text>{countryName(row.country)}</s-text>
                      </s-table-cell>
                      <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                      <s-table-cell>
                        <Bar value={row.visits} max={maxCountryVisits} color="#f59e0b" />
                      </s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>
            </div>
          ) : (
            <s-box padding="base">
              <s-text color="subdued">
                Country data requires Cloudflare or Vercel hosting.
              </s-text>
            </s-box>
          )}
        </s-section>
        </div>
      </div>

      {/* ── Top Campaigns ────────────────────────────────────────────────── */}
      {stats.topCampaigns.length > 0 && (
        <s-section heading="Top Campaigns">
          <div className="tyt-table-wrap">
            <s-table variant="auto" accessibility-label="Top campaigns">
              <s-table-header-row>
                <s-table-header list-slot="primary">Campaign</s-table-header>
                <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
                <s-table-header list-slot="labeled">Share</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {stats.topCampaigns.map((row) => (
                  <s-table-row key={row.campaign}>
                    <s-table-cell>{row.campaign}</s-table-cell>
                    <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                    <s-table-cell>
                      <Bar
                        value={row.visits}
                        max={Math.max(...stats.topCampaigns.map((r) => r.visits), 1)}
                        color="#a855f7"
                      />
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          </div>
        </s-section>
      )}
    </s-page>
  );
}

/** Convert ISO-2 country code to full country name. */
function countryName(code: string): string {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
