import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { getAllSettings, setSettings } from "../lib/settings.server";
import prisma from "../db.server";

function modalShow(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id) as any;
  if (!el) return;
  if (typeof el.showOverlay === "function") el.showOverlay();
  else if (typeof (window as any).shopify?.modal?.show === "function")
    (window as any).shopify.modal.show(id);
}
function modalHide(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id) as any;
  if (!el) return;
  if (typeof el.hideOverlay === "function") el.hideOverlay();
  else if (typeof (window as any).shopify?.modal?.hide === "function")
    (window as any).shopify.modal.hide(id);
}

// ── Loader ───────────────────────────────────────────────────────────────────

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const settings  = await getAllSettings(shop);
  const visitCount = await prisma.visit.count({ where: { shop } });

  // DB size (PostgreSQL-specific; falls back gracefully)
  let dbSizeBytes = 0;
  try {
    const sizeRows = await prisma.$queryRaw<{ size_bytes: bigint }[]>`
      SELECT pg_total_relation_size('"tyt_visits"') AS size_bytes
    `;
    dbSizeBytes = Number(sizeRows[0]?.size_bytes ?? 0);
  } catch { /* ignore on non-PG or restricted instances */ }

  return { settings, visitCount, shop, dbSizeBytes };
};

// ── Action ───────────────────────────────────────────────────────────────────

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const body = await request.json();
  const intent = body.intent as string;

  if (intent === "save") {
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.settings as Record<string, string>)) {
      updates[key] = String(value);
    }
    await setSettings(shop, updates);
    return Response.json({ ok: true });
  }

  if (intent === "purge") {
    const deleted = await prisma.visit.deleteMany({ where: { shop } });
    return Response.json({ ok: true, deleted: deleted.count });
  }

  if (intent === "export") {
    const count = await prisma.visit.count({ where: { shop } });
    return Response.json({ ok: true, count });
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

const RETENTION_OPTIONS = [
  { value: "0",   label: "Keep forever" },
  { value: "30",  label: "30 days" },
  { value: "60",  label: "60 days" },
  { value: "90",  label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = "tracking" | "privacy" | "retention" | "data";

export default function SettingsPage() {
  const { settings, visitCount, dbSizeBytes } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [tab,    setTab]    = useState<Tab>("tracking");
  const [form,   setForm]   = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // IP auto-detect (fetched client-side to get the real browser IP)
  const [detectedIp, setDetectedIp] = useState<string>("");
  const [ipLoading,  setIpLoading]  = useState(false);

  const fetchMyIp = useCallback(async () => {
    setIpLoading(true);
    try {
      const res = await fetch("/api/my-ip");
      const data = await res.json();
      setDetectedIp(data.ip || "");
    } catch { setDetectedIp(""); }
    finally  { setIpLoading(false); }
  }, []);

  // Fetch IP when Privacy tab is opened
  useEffect(() => {
    if (tab === "privacy" && !detectedIp) fetchMyIp();
  }, [tab, detectedIp, fetchMyIp]);

  const set = (key: string) => (e: any) => {
    const val = e.currentTarget.value ?? e.currentTarget.checked;
    setForm((f) => ({ ...f, [key]: typeof val === "boolean" ? (val ? "true" : "false") : String(val) }));
  };

  const toggle = (key: string) => () =>
    setForm((f) => ({ ...f, [key]: f[key] === "true" ? "false" : "true" }));

  // Add detected IP to excluded_ips list
  const addMyIp = () => {
    if (!detectedIp) return;
    const existing = (form.excluded_ips || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!existing.includes(detectedIp)) {
      setForm((f) => ({
        ...f,
        excluded_ips: [...existing, detectedIp].join(", "),
      }));
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    await fetch("/app/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "save", settings: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    revalidator.revalidate();
  }, [form, revalidator]);

  // ── Purge ─────────────────────────────────────────────────────────────────
  const handlePurge = useCallback(async () => {
    await fetch("/app/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "purge" }),
    });
    modalHide("purge-confirm-modal");
    revalidator.revalidate();
  }, [revalidator]);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const [exportDays,      setExportDays]      = useState("0");
  const [exportEventType, setExportEventType] = useState("all");

  const handleExport = useCallback(() => {
    const params = new URLSearchParams({ days: exportDays, event_type: exportEventType });
    window.location.href = `/api/export?${params}`;
  }, [exportDays, exportEventType]);

  // Snap retention dropdown — if stored value isn't in list, add a "Custom" option
  const retentionOptions = RETENTION_OPTIONS.some((o) => o.value === form.retention_days)
    ? RETENTION_OPTIONS
    : [...RETENTION_OPTIONS, { value: form.retention_days, label: `Custom (${form.retention_days} days)` }];

  return (
    <s-page heading="Settings">
      <s-button
        slot="primary-action"
        variant="primary"
        icon={saved ? "check" : "save"}
        onClick={handleSave}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </s-button>

      {/* Tab navigation */}
      <s-section padding="none">
        <s-box padding="base">
          <s-stack direction="inline" gap="small-200">
            {([ ["tracking", "Tracking"], ["privacy", "Privacy & Filtering"],
                 ["retention", "Data Retention"], ["data", "Data Management"] ] as [Tab, string][])
              .map(([key, label]) => (
                <s-button key={key} variant={tab === key ? "primary" : "secondary"} onClick={() => setTab(key)}>
                  {label}
                </s-button>
              ))}
          </s-stack>
        </s-box>
      </s-section>

      {/* ── Tracking Tab ─────────────────────────────────────────────────── */}
      {tab === "tracking" && (
        <s-section heading="Tracking Settings">
          <s-stack gap="base">
            <s-switch
              label="Enable tracking"
              name="enabled"
              checked={form.enabled === "true" ? true : undefined}
              onChange={toggle("enabled")}
            />

            <s-number-field
              label="Cookie duration (days)"
              name="cookie_duration"
              min={1}
              max={730}
              value={form.cookie_duration}
              onChange={set("cookie_duration")}
            />

            <s-text-field
              label="Cookie domain"
              name="cookie_domain"
              placeholder="Leave blank for automatic (recommended)"
              value={form.cookie_domain}
              onChange={set("cookie_domain")}
            />

            <s-switch
              label="Debug mode (logs to browser console)"
              name="debug_mode"
              checked={form.debug_mode === "true" ? true : undefined}
              onChange={toggle("debug_mode")}
            />
          </s-stack>
        </s-section>
      )}

      {/* ── Privacy & Filtering Tab ───────────────────────────────────────── */}
      {tab === "privacy" && (
        <s-section heading="Privacy & Filtering">
          <s-stack gap="base">

            <s-switch
              label="Exclude logged-in admins"
              name="exclude_admins"
              checked={form.exclude_admins === "true" ? true : undefined}
              onChange={toggle("exclude_admins")}
            />

            <s-switch
              label="Filter known bots"
              name="exclude_bots"
              checked={form.exclude_bots === "true" ? true : undefined}
              onChange={toggle("exclude_bots")}
            />

            {/* ── IP exclusion ─────────────────────────────────────────── */}
            <s-box padding="base" border="base" border-radius="base">
              <s-stack gap="small-300">
                <s-stack gap="small-100">
                  <s-heading>Excluded IP addresses</s-heading>
                  <s-text color="subdued">
                    Visits from these IPs will not be tracked. Separate multiple IPs with commas.
                  </s-text>
                </s-stack>

                {/* Detected IP + Add shortcut */}
                <s-stack direction="inline" align-items="center" gap="small-200">
                  <s-text color="subdued">
                    Your current IP:{" "}
                    <strong>{ipLoading ? "detecting…" : detectedIp || "—"}</strong>
                  </s-text>
                  {detectedIp && (
                    <s-button variant="tertiary" onClick={addMyIp}>
                      + Add to list
                    </s-button>
                  )}
                  <s-button variant="tertiary" onClick={fetchMyIp} disabled={ipLoading ? true : undefined}>
                    {ipLoading ? "Detecting…" : "Re-detect"}
                  </s-button>
                </s-stack>

                <s-text-area
                  label="Excluded IPs (comma-separated)"
                  name="excluded_ips"
                  rows={3}
                  placeholder="192.168.1.1, 10.0.0.5"
                  value={form.excluded_ips}
                  onChange={set("excluded_ips")}
                />
              </s-stack>
            </s-box>

            <s-text-area
              label="Custom bot patterns (one per line, case-insensitive regex)"
              name="custom_bot_patterns"
              rows={4}
              placeholder={"MyCustomBot\nInternalCrawler\nMyMonitor"}
              value={form.custom_bot_patterns}
              onChange={set("custom_bot_patterns")}
            />

            {/* ── Referrer spam filtering ────────────────────────────── */}
            <s-box padding="base" border="base" border-radius="base">
              <s-stack gap="small-300">
                <s-stack gap="small-100">
                  <s-heading>Blocked referrers</s-heading>
                  <s-text color="subdued">
                    Visits from these referrer hostnames will not be recorded.
                    One entry per line (e.g. <code style={{ fontFamily: "monospace" }}>semalt.com</code>).
                    Partial matches are supported — e.g. <code style={{ fontFamily: "monospace" }}>semalt</code> blocks all semalt subdomains.
                  </s-text>
                </s-stack>
                <s-text-area
                  label="Blocked referrers (one per line)"
                  name="excluded_referrers"
                  rows={5}
                  placeholder={"semalt.com\nbuttons-for-website.com\nfree-share-buttons.com\nfab-traffic.com"}
                  value={form.excluded_referrers}
                  onChange={set("excluded_referrers")}
                />
              </s-stack>
            </s-box>

            <s-number-field
              label="Rate limit (requests per minute per IP)"
              name="rate_limit"
              min={1}
              max={60}
              value={form.rate_limit}
              onChange={set("rate_limit")}
            />
          </s-stack>
        </s-section>
      )}

      {/* ── Data Retention Tab ────────────────────────────────────────────── */}
      {tab === "retention" && (
        <s-section heading="Data Retention">
          <s-stack gap="base">

            {/* DB overview cards */}
            <s-grid
              grid-template-columns="@container (inline-size <= 480px) 1fr, 1fr 1fr 1fr"
              gap="base"
            >
              <s-box padding="base" border="base" border-radius="base" background="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Total visit records</s-text>
                  <s-heading>{visitCount.toLocaleString()}</s-heading>
                </s-stack>
              </s-box>
              <s-box padding="base" border="base" border-radius="base" background="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Database size</s-text>
                  <s-heading>{formatBytes(dbSizeBytes)}</s-heading>
                </s-stack>
              </s-box>
              <s-box padding="base" border="base" border-radius="base" background="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Retention period</s-text>
                  <s-heading>
                    {form.retention_days === "0" ? "∞ Forever"
                      : retentionOptions.find((o) => o.value === form.retention_days)?.label
                        ?? `${form.retention_days} days`}
                  </s-heading>
                </s-stack>
              </s-box>
            </s-grid>

            {/* Retention dropdown */}
            <s-select
              label="Auto-delete old visits"
              name="retention_days"
              value={form.retention_days}
              onChange={set("retention_days")}
            >
              {retentionOptions.map((o) => (
                <s-option key={o.value} value={o.value}>{o.label}</s-option>
              ))}
            </s-select>
            <s-text color="subdued">
              When set, visits older than the selected period are automatically deleted
              each day by the cleanup cron job. Choose "Keep forever" to disable auto-deletion.
            </s-text>
          </s-stack>
        </s-section>
      )}

      {/* ── Data Management Tab ───────────────────────────────────────────── */}
      {tab === "data" && (
        <s-section heading="Data Management">
          <s-stack gap="base">
            {/* Export */}
            <s-box padding="base" border="base" border-radius="base">
              <s-stack gap="base">
                <s-heading>Export Visit Data</s-heading>
                <s-text color="subdued">
                  Download a full CSV of all individual visit records including source,
                  medium, campaign, channel, landing page, referrer, and event type.
                </s-text>
                <s-grid
                  grid-template-columns="@container (inline-size <= 400px) 1fr, 1fr 1fr"
                  gap="base"
                >
                  <s-select
                    label="Date range"
                    value={exportDays}
                    onChange={(e: any) => setExportDays(e.currentTarget.value)}
                  >
                    <s-option value="0">All time</s-option>
                    <s-option value="7">Last 7 days</s-option>
                    <s-option value="30">Last 30 days</s-option>
                    <s-option value="90">Last 90 days</s-option>
                    <s-option value="365">Last year</s-option>
                  </s-select>
                  <s-select
                    label="Event type"
                    value={exportEventType}
                    onChange={(e: any) => setExportEventType(e.currentTarget.value)}
                  >
                    <s-option value="all">All events</s-option>
                    <s-option value="pageview">Page views</s-option>
                    <s-option value="add_to_cart">Add to cart</s-option>
                    <s-option value="checkout">Checkout</s-option>
                    <s-option value="purchase">Purchase</s-option>
                  </s-select>
                </s-grid>
                <s-button variant="secondary" icon="export" onClick={handleExport}>
                  Download CSV
                </s-button>
              </s-stack>
            </s-box>

            {/* Purge */}
            <s-box padding="base" border="base" border-radius="base">
              <s-stack gap="base">
                <s-heading>Purge All Visit Data</s-heading>
                <s-text color="subdued">
                  Permanently delete all {visitCount.toLocaleString()} visit records for this shop.
                  Campaigns and settings will be preserved.
                </s-text>
                <s-button
                  variant="primary"
                  tone="critical"
                  icon="delete"
                  onClick={() => modalShow("purge-confirm-modal")}
                >
                  Purge All Visits
                </s-button>
              </s-stack>
            </s-box>
          </s-stack>
        </s-section>
      )}

      {/* Purge confirmation modal */}
      <s-modal id="purge-confirm-modal" heading="Purge All Visit Data">
        <s-stack gap="base">
          <s-banner tone="warning" heading="This action cannot be undone" />
          <s-text>
            This will permanently delete all{" "}
            <s-text type="strong">{visitCount.toLocaleString()}</s-text> visit records.
            Campaigns and settings will be preserved.
          </s-text>
        </s-stack>
        <s-button slot="primary-action" variant="primary" tone="critical" onClick={handlePurge}>
          Purge All Data
        </s-button>
        <s-button slot="secondary-actions" commandFor="purge-confirm-modal" command="--hide">
          Cancel
        </s-button>
      </s-modal>
    </s-page>
  );
}
