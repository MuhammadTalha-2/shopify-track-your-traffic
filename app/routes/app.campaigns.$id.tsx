import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getCampaignStats } from "../lib/queries.server";
import prisma from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const id = parseInt(params.id || "", 10);

  if (Number.isNaN(id)) throw new Response("Invalid ID", { status: 400 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, shop: session.shop },
  });

  if (!campaign) throw new Response("Not found", { status: 404 });

  const stats = await getCampaignStats(session.shop, campaign.campaign);

  return { campaign, stats };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysActive(startDate: Date | string | null, createdAt: Date | string): number {
  const start = startDate ? new Date(startDate) : new Date(createdAt);
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000));
}

// ── Dual-line Sparkline ───────────────────────────────────────────────────────

function Sparkline({ data }: { data: { date: string; visits: number; uniques: number }[] }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#8c9196" }}>
        No visit data yet for this campaign.
      </div>
    );
  }

  const width = 800;
  const height = 200;
  const pad = { top: 20, right: 20, bottom: 32, left: 44 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map((d) => d.visits), 1);

  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * cW;
  const toY = (v: number) => pad.top + cH - (v / maxVal) * cH;

  const pathOf = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const visitPts  = data.map((d, i) => ({ x: toX(i), y: toY(d.visits) }));
  const uniquePts = data.map((d, i) => ({ x: toX(i), y: toY(d.uniques) }));

  const areaPath =
    pathOf(visitPts) +
    ` L ${visitPts[visitPts.length - 1].x} ${pad.top + cH} L ${pad.left} ${pad.top + cH} Z`;

  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  const step = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="cAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c6ecb" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2c6ecb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((val) => {
        const y = toY(val);
        return (
          <g key={val}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e1e3e5" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#8c9196">{val}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#cAreaGrad)" />
      <path d={pathOf(visitPts)} fill="none" stroke="#2c6ecb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathOf(uniquePts)} fill="none" stroke="#50b86c" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
      {data.length <= 60 && visitPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2c6ecb" stroke="#fff" strokeWidth="1.5" />
      ))}
      {xLabels.map((d) => {
        const i = data.indexOf(d);
        return (
          <text key={d.date} x={toX(i)} y={height - 4} textAnchor="middle" fontSize="10" fill="#8c9196">
            {d.date.slice(5)}
          </text>
        );
      })}
      {/* inline legend */}
      <line x1={width - 170} y1={12} x2={width - 152} y2={12} stroke="#2c6ecb" strokeWidth="2.5" />
      <text x={width - 148} y={16} fontSize="11" fill="#6d7175">Visits</text>
      <line x1={width - 100} y1={12} x2={width - 82} y2={12} stroke="#50b86c" strokeWidth="2" strokeDasharray="5 3" />
      <text x={width - 78} y={16} fontSize="11" fill="#6d7175">Uniques</text>
    </svg>
  );
}

// ── Goal Progress ─────────────────────────────────────────────────────────────

function GoalProgress({ visits, goal }: { visits: number; goal: number }) {
  if (goal <= 0) return null;
  const pct = Math.min(100, Math.round((visits / goal) * 100));
  const color = pct >= 100 ? "#22c55e" : pct >= 50 ? "#2c6ecb" : "#f59e0b";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: "#202223" }}>
          {pct >= 100 ? "Goal reached!" : `${pct}% of goal`}
        </span>
        <span style={{ color: "#6d7175" }}>
          {visits.toLocaleString()} / {goal.toLocaleString()}
        </span>
      </div>
      <svg viewBox="0 0 300 12" style={{ width: "100%", height: 10 }}>
        <rect x="0" y="2" width="300" height="8" rx="4" fill="#e1e3e5" />
        <rect x="0" y="2" width={Math.max(6, (pct / 100) * 300)} height="8" rx="4" fill={color} />
      </svg>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignStatsPage() {
  const { campaign, stats } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const active = daysActive(campaign.startDate, campaign.createdAt);
  const goalPct =
    campaign.goalVisits > 0
      ? Math.min(100, Math.round((stats.visits / campaign.goalVisits) * 100))
      : null;

  const tone =
    campaign.status === "active" ? "success"
    : campaign.status === "paused" ? "warning"
    : "info";

  const hasUtm = campaign.source || campaign.medium || campaign.campaign || campaign.term || campaign.content;
  const tags = campaign.tags ? campaign.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <>
    <style>{`
        .cs-kpi   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e1e3e5; }
        .cs-kpi-cell { background: #fff; padding: 16px 20px; }
        .cs-kpi-label { font-size: 13px; color: #6d7175; margin-bottom: 6px; }
        .cs-kpi-value { font-size: 22px; font-weight: 700; color: #202223; line-height: 1.2; }
        .cs-kpi-sub   { font-size: 12px; color: #8c9196; margin-top: 4px; }

        .cs-detail-grid { display: grid; grid-template-columns: auto 1fr 1fr; gap: 20px; align-items: start; }
        .cs-label { font-size: 12px; color: #6d7175; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .cs-value { font-size: 14px; font-weight: 600; color: #202223; }

        .cs-utm-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .cs-utm-pill { display: inline-flex; align-items: center; gap: 5px; background: #f1f3f5; border: 1px solid #e1e3e5; border-radius: 20px; padding: 3px 10px; }
        .cs-utm-key  { font-size: 10px; color: #8c9196; text-transform: uppercase; letter-spacing: 0.04em; }
        .cs-utm-val  { font-size: 12px; font-weight: 600; color: #202223; }

        .cs-tag { display: inline-block; background: #e8f4f8; color: #2c6ecb; border: 1px solid #c9e2f5; border-radius: 20px; font-size: 12px; padding: 2px 10px; }

        .cs-divider { border: none; border-top: 1px solid #e1e3e5; margin: 16px 0; }

        .cs-page-bar { display: flex; align-items: center; gap: 8px; }
        .cs-page-bar-track { flex: 0 0 80px; height: 6px; background: #e1e3e5; border-radius: 3px; overflow: hidden; }
        .cs-page-bar-fill  { height: 100%; background: #2c6ecb; border-radius: 3px; }

        @media (max-width: 680px) {
          .cs-kpi { grid-template-columns: repeat(2, 1fr); }
          .cs-detail-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 420px) {
          .cs-kpi { grid-template-columns: 1fr; }
          .cs-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    <s-page heading={campaign.name} inline-size="full">
      <s-link
        slot="breadcrumb-actions"
        onClick={(e: any) => { e.preventDefault(); navigate("/app/campaigns"); }}
      >
        Campaigns
      </s-link>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <s-section padding="none">
        <div className="cs-kpi" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e1e3e5" }}>
          <div className="cs-kpi-cell">
            <div className="cs-kpi-label">Total Visits</div>
            <div className="cs-kpi-value">{stats.visits.toLocaleString()}</div>
          </div>
          <div className="cs-kpi-cell">
            <div className="cs-kpi-label">Unique Visitors</div>
            <div className="cs-kpi-value">{stats.uniques.toLocaleString()}</div>
          </div>
          <div className="cs-kpi-cell">
            <div className="cs-kpi-label">Days Active</div>
            <div className="cs-kpi-value">{active}</div>
            <div className="cs-kpi-sub">since {fmtDate(campaign.startDate ?? campaign.createdAt)}</div>
          </div>
          <div className="cs-kpi-cell">
            <div className="cs-kpi-label">Goal Progress</div>
            <div className="cs-kpi-value">{goalPct !== null ? `${goalPct}%` : "—"}</div>
            {goalPct !== null && (
              <div className="cs-kpi-sub">
                {stats.visits.toLocaleString()} / {campaign.goalVisits.toLocaleString()} visits
              </div>
            )}
          </div>
        </div>
      </s-section>

      {/* ── Campaign Details ────────────────────────────────────────────── */}
      <s-section heading="Campaign Details">
        <s-box padding="base">
          {/* Status + Dates row */}
          <div className="cs-detail-grid">
            <div>
              <div className="cs-label">Status</div>
              <s-badge tone={tone}>{campaign.status}</s-badge>
            </div>
            <div>
              <div className="cs-label">Start Date</div>
              <div className="cs-value">{fmtDate(campaign.startDate)}</div>
            </div>
            <div>
              <div className="cs-label">End Date</div>
              <div className="cs-value">{fmtDate(campaign.endDate)}</div>
            </div>
          </div>

          {/* UTM Parameters */}
          {hasUtm && (
            <>
              <hr className="cs-divider" />
              <div className="cs-label" style={{ marginBottom: 8 }}>UTM Parameters</div>
              <div className="cs-utm-row">
                {campaign.source   && <div className="cs-utm-pill"><span className="cs-utm-key">source</span><span className="cs-utm-val">{campaign.source}</span></div>}
                {campaign.medium   && <div className="cs-utm-pill"><span className="cs-utm-key">medium</span><span className="cs-utm-val">{campaign.medium}</span></div>}
                {campaign.campaign && <div className="cs-utm-pill"><span className="cs-utm-key">campaign</span><span className="cs-utm-val">{campaign.campaign}</span></div>}
                {campaign.term     && <div className="cs-utm-pill"><span className="cs-utm-key">term</span><span className="cs-utm-val">{campaign.term}</span></div>}
                {campaign.content  && <div className="cs-utm-pill"><span className="cs-utm-key">content</span><span className="cs-utm-val">{campaign.content}</span></div>}
              </div>
            </>
          )}

          {/* Goal progress bar */}
          {campaign.goalVisits > 0 && (
            <>
              <hr className="cs-divider" />
              <div className="cs-label" style={{ marginBottom: 8 }}>Visit Goal</div>
              <GoalProgress visits={stats.visits} goal={campaign.goalVisits} />
            </>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <hr className="cs-divider" />
              <div className="cs-label" style={{ marginBottom: 8 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag) => <span key={tag} className="cs-tag">{tag}</span>)}
              </div>
            </>
          )}

          {/* Notes */}
          {campaign.notes && (
            <>
              <hr className="cs-divider" />
              <div className="cs-label" style={{ marginBottom: 6 }}>Notes</div>
              <p style={{ margin: 0, fontSize: 14, color: "#202223", lineHeight: 1.5 }}>{campaign.notes}</p>
            </>
          )}
        </s-box>
      </s-section>

      {/* ── Daily Trend ─────────────────────────────────────────────────── */}
      <s-section heading="Daily Trend">
        <Sparkline data={stats.daily} />
      </s-section>

      {/* ── Top Landing Pages ────────────────────────────────────────────── */}
      <s-section heading="Top Landing Pages">
        {stats.topPages.length > 0 ? (
          <s-table variant="auto" accessibility-label="Top landing pages">
            <s-table-header-row>
              <s-table-header list-slot="primary">Page</s-table-header>
              <s-table-header list-slot="labeled" format="numeric">Visits</s-table-header>
              <s-table-header list-slot="labeled">Share</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {stats.topPages.map((row) => {
                const share = stats.visits > 0 ? Math.round((row.visits / stats.visits) * 100) : 0;
                return (
                  <s-table-row key={row.landingPage}>
                    <s-table-cell>
                      <span style={{ fontFamily: "monospace", fontSize: 13 }}>
                        {row.landingPage || "/"}
                      </span>
                    </s-table-cell>
                    <s-table-cell>{row.visits.toLocaleString()}</s-table-cell>
                    <s-table-cell>
                      <div className="cs-page-bar">
                        <div className="cs-page-bar-track">
                          <div className="cs-page-bar-fill" style={{ width: `${share}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#6d7175", minWidth: 30 }}>{share}%</span>
                      </div>
                    </s-table-cell>
                  </s-table-row>
                );
              })}
            </s-table-body>
          </s-table>
        ) : (
          <s-box padding="base">
            <s-text color="subdued">No page data yet for this campaign.</s-text>
          </s-box>
        )}
      </s-section>
    </s-page>
    </>
  );
}
