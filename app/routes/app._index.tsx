import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getDashboardStats } from "../lib/queries.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10) || 30;
  const stats = await getDashboardStats(session.shop, days);
  return { stats };
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
  mobile:  "📱",
  tablet:  "⬛",
  desktop: "🖥",
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
    <s-box padding="base" border="base" border-radius="base" background="base">
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
            <s-badge tone={(CHANNEL_TONE[channelBadge.channel] ?? "neutral") as any}>
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
    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 80 }}>
      <div style={{ flex: 1, height: 6, background: "#e1e3e5", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, color: "#6d7175", minWidth: 28, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: { date: string; visits: number; uniques: number }[] }) {
  if (!data.length) {
    return (
      <s-box padding="base">
        <s-stack align-items="center" gap="base">
          {/* @ts-ignore - chart-bar and large are valid runtime values not yet in polaris-types */}
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

const DATE_RANGES = [
  { value: "7",   label: "7 days"  },
  { value: "14",  label: "14 days" },
  { value: "30",  label: "30 days" },
  { value: "90",  label: "90 days" },
  { value: "365", label: "1 year"  },
] as const;

export default function Dashboard() {
  const { stats } = useLoaderData<typeof loader>();
  const navigate  = useNavigate();
  const [days, setDays] = useState(String(stats.period));

  // KPI % changes vs previous period
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
    <s-page heading="Track Your Traffic" inline-size="large">
      <style>{`
        .tyt-kpi-grid      { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .tyt-two-col-grid  { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:0 0 16px; }
        .tyt-three-col-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; padding:0 0 16px; }
        @media (max-width:1100px) { .tyt-three-col-grid { grid-template-columns:1fr 1fr; } }
        @media (max-width:900px)  { .tyt-kpi-grid { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:600px)  {
          .tyt-kpi-grid { grid-template-columns:1fr; }
          .tyt-two-col-grid  { grid-template-columns:1fr; }
          .tyt-three-col-grid{ grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── Period selector ──────────────────────────────────────────────── */}
      <s-section padding="none">
        <s-box padding="base">
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
            channelBadge={topChannel ? { channel: topChannel.channel } : undefined}
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
        ) : (
          <s-box padding="base">
            <s-stack align-items="center" gap="small-200">
              {/* @ts-ignore - chart-bar is a valid runtime value not yet in polaris-types */}
              <s-icon type="chart-bar" color="subdued" />
              <s-text color="subdued">No channel data for this period.</s-text>
            </s-stack>
          </s-box>
        )}
      </s-section>

      {/* ── Top Sources + Top Pages ──────────────────────────────────────── */}
      <div className="tyt-two-col-grid">
        <s-section heading="Top Sources">
          {stats.topSources.length > 0 ? (
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
                      <div style={{ maxWidth: 200 }}>
                        <s-stack gap="small-100">
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <s-text type="strong">{row.source}</s-text>
                          </div>
                          {row.medium && <s-text color="subdued">{row.medium}</s-text>}
                        </s-stack>
                      </div>
                    </s-table-cell>
                    <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                    <s-table-cell>
                      <Bar value={row.visits} max={maxSourceVisits} color="#2c6ecb" />
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          ) : (
            <s-box padding="base"><s-text color="subdued">No source data yet.</s-text></s-box>
          )}
        </s-section>

        <s-section heading="Top Landing Pages">
          {stats.topPages.length > 0 ? (
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
                      <div title={row.landingPage || "/"} style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          ) : (
            <s-box padding="base"><s-text color="subdued">No page data yet.</s-text></s-box>
          )}
        </s-section>
      </div>

      {/* ── Device + Country ─────────────────────────────────────────────── */}
      <div className="tyt-two-col-grid">
        {/* Device Breakdown */}
        <s-section heading="Devices">
          {stats.byDevice.length > 0 ? (
            <s-stack gap="base">
              {stats.byDevice.map((row) => {
                const pct = Math.round((row.visits / totalDeviceVisits) * 100);
                return (
                  <s-stack key={row.deviceType} gap="small-200">
                    <s-stack direction="inline" align-items="center" gap="small-300">
                      <span style={{ fontSize: 18 }}>{DEVICE_ICON[row.deviceType] ?? "💻"}</span>
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

        {/* Country Breakdown */}
        <s-section heading="Top Countries">
          {stats.byCountry.length > 0 ? (
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
                      <s-stack direction="inline" gap="small-200" align-items="center">
                        <span style={{ fontSize: 18 }}>
                          {countryFlag(row.country)}
                        </span>
                        <s-text>{row.country}</s-text>
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                    <s-table-cell>
                      <Bar value={row.visits} max={maxCountryVisits} color="#f59e0b" />
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          ) : (
            <s-box padding="base">
              <s-text color="subdued">
                Country data requires Cloudflare or Vercel hosting.
              </s-text>
            </s-box>
          )}
        </s-section>
      </div>

      {/* ── Top Campaigns ────────────────────────────────────────────────── */}
      {stats.topCampaigns.length > 0 && (
        <s-section heading="Top Campaigns">
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
        </s-section>
      )}
    </s-page>
  );
}

/** Convert ISO-2 country code to emoji flag. */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1e0 + c.charCodeAt(0) - 65),
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
