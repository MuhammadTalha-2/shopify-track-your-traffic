import type { LoaderFunctionArgs } from "react-router";
import { useState, useCallback } from "react";
import { useLoaderData, useLocation } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shopUrl: `https://${session.shop}` };
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Newsletter",  source: "newsletter", medium: "email"    },
  { label: "Twitter / X", source: "twitter",    medium: "social"   },
  { label: "LinkedIn",    source: "linkedin",   medium: "social"   },
  { label: "Facebook",    source: "facebook",   medium: "social"   },
  { label: "Affiliate",   source: "",           medium: "affiliate" },
  { label: "Guest Post",  source: "",           medium: "referral"  },
] as const;

const MEDIUM_GUIDE = [
  { medium: "email",       description: "Email newsletters & campaigns" },
  { medium: "social",      description: "Organic social media posts" },
  { medium: "cpc",         description: "Paid search (Google Ads, etc.)" },
  { medium: "paid_social", description: "Paid social media ads" },
  { medium: "referral",    description: "Guest posts, link partnerships" },
  { medium: "affiliate",   description: "Affiliate & partner links" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUtmUrl(baseUrl: string, params: Record<string, string>): string {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    for (const [key, value] of Object.entries(params)) {
      if (value.trim()) url.searchParams.set(key, value.trim());
    }
    return url.toString();
  } catch {
    return "";
  }
}

function titleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "Home";
    return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
}

function formatOutput(tagged: string, title: string, fmt: "plain" | "html" | "markdown"): string {
  if (fmt === "html")     return `<a href="${tagged}">${title}</a>`;
  if (fmt === "markdown") return `[${title}](${tagged})`;
  return tagged;
}

// ── Quick Presets strip ───────────────────────────────────────────────────────

interface PresetsProps {
  onSelect: (source: string, medium: string) => void;
}
function QuickPresets({ onSelect }: PresetsProps) {
  return (
    <s-box padding-block-end="base">
      <s-stack gap="small-200">
        <s-text color="subdued">Quick presets:</s-text>
        <s-stack direction="inline" gap="small-200">
          {PRESETS.map((p) => (
            <s-button key={p.label} variant="secondary" onClick={() => onSelect(p.source, p.medium)}>
              {p.label}
            </s-button>
          ))}
        </s-stack>
      </s-stack>
    </s-box>
  );
}

// ── Single URL Builder ────────────────────────────────────────────────────────

interface SingleBuilderProps {
  shopUrl: string;
}

function SingleBuilder({ shopUrl }: SingleBuilderProps) {
  const [baseUrl,  setBaseUrl]  = useState(shopUrl);
  const [source,   setSource]   = useState("");
  const [medium,   setMedium]   = useState("");
  const [campaign, setCampaign] = useState("");
  const [term,     setTerm]     = useState("");
  const [content,  setContent]  = useState("");
  const [copied,   setCopied]   = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const taggedUrl = buildUtmUrl(baseUrl, {
    utm_source:   source,
    utm_medium:   medium,
    utm_campaign: campaign,
    utm_term:     term,
    utm_content:  content,
  });

  // Show generated URL as soon as any UTM field has a value
  const hasAnyParam = !!(source || medium || campaign || term || content);

  const applyPreset = (s: string, m: string) => {
    if (s) setSource(s);
    setMedium(m);
  };

  const handleCopy = useCallback(() => {
    if (taggedUrl) {
      navigator.clipboard.writeText(taggedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [taggedUrl]);

  return (
    <s-section heading="Single URL Builder">
      <s-stack gap="base">
        <QuickPresets onSelect={applyPreset} />

        <s-url-field
          label="Destination URL"
          name="base_url"
          placeholder="https://your-store.myshopify.com/products/example"
          value={baseUrl}
          onChange={(e: any) => setBaseUrl(e.currentTarget.value)}
        />

        <s-grid
          grid-template-columns="@container (inline-size <= 500px) 1fr, 1fr 1fr"
          gap="base"
        >
          <s-text-field
            label="Source (utm_source)"
            name="source"
            placeholder="google, facebook, newsletter"
            value={source}
            onChange={(e: any) => setSource(e.currentTarget.value)}
          />
          <s-text-field
            label="Medium (utm_medium)"
            name="medium"
            placeholder="cpc, social, email"
            value={medium}
            onChange={(e: any) => setMedium(e.currentTarget.value)}
          />
        </s-grid>

        <s-text-field
          label="Campaign (utm_campaign)"
          name="campaign"
          placeholder="summer_sale_2026"
          value={campaign}
          onChange={(e: any) => setCampaign(e.currentTarget.value)}
        />

        <s-grid
          grid-template-columns="@container (inline-size <= 500px) 1fr, 1fr 1fr"
          gap="base"
        >
          <s-text-field
            label="Term (utm_term)"
            name="term"
            placeholder="running+shoes (optional)"
            value={term}
            onChange={(e: any) => setTerm(e.currentTarget.value)}
          />
          <s-text-field
            label="Content (utm_content)"
            name="content"
            placeholder="hero_banner (optional)"
            value={content}
            onChange={(e: any) => setContent(e.currentTarget.value)}
          />
        </s-grid>

        {/* Generated URL — shown as soon as any UTM param is filled */}
        {hasAnyParam && (
          <s-box padding="base" background="subdued" border-radius="base" border="base">
            <s-stack gap="small-400">
              <s-stack gap="small-100">
                <s-text type="strong">Generated URL</s-text>
                <div
                  style={{
                    background: "var(--s-color-bg, #fff)",
                    border: "1px solid var(--s-color-border-subdued, #e1e3e5)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 13,
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                    color: "var(--s-color-text, #202223)",
                    userSelect: "all",
                  }}
                >
                  {taggedUrl || baseUrl}
                </div>
              </s-stack>
              <s-button
                variant="primary"
                icon={copied ? "check" : "clipboard"}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy URL"}
              </s-button>
            </s-stack>
          </s-box>
        )}

        {/* Medium reference guide */}
        <s-box>
          <s-button variant="tertiary" onClick={() => setShowGuide((v) => !v)}>
            {showGuide ? "Hide" : "Show"} UTM medium reference guide
          </s-button>
          {showGuide && (
            <s-box padding-block-start="base">
              <s-table variant="auto" accessibility-label="UTM medium reference guide">
                <s-table-header-row>
                  <s-table-header list-slot="primary">Medium value</s-table-header>
                  <s-table-header list-slot="labeled">Use when…</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {MEDIUM_GUIDE.map((g) => (
                    <s-table-row key={g.medium}>
                      <s-table-cell>
                        <code style={{ fontFamily: "monospace", background: "#f1f2f3", padding: "2px 6px", borderRadius: 4 }}>
                          {g.medium}
                        </code>
                      </s-table-cell>
                      <s-table-cell>{g.description}</s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>
            </s-box>
          )}
        </s-box>
      </s-stack>
    </s-section>
  );
}

// ── Bulk UTM Tagger ───────────────────────────────────────────────────────────

interface FetchedItem {
  id: string;
  title: string;
  url: string;
  type: string;
  checked: boolean;
}

interface TaggedRow {
  original: string;
  tagged: string;
  title: string;
  valid: boolean;
}

type OutputFormat = "plain" | "html" | "markdown";

interface BulkTaggerProps {
  initialSource?:   string;
  initialMedium?:   string;
  initialCampaign?: string;
  initialTerm?:     string;
  initialContent?:  string;
}

function BulkTagger({
  initialSource   = "",
  initialMedium   = "",
  initialCampaign = "",
  initialTerm     = "",
  initialContent  = "",
}: BulkTaggerProps) {
  const [source,   setSource]   = useState(initialSource);
  const [medium,   setMedium]   = useState(initialMedium);
  const [campaign, setCampaign] = useState(initialCampaign);
  const [term,     setTerm]     = useState(initialTerm);
  const [content,  setContent]  = useState(initialContent);

  const [manualUrls, setManualUrls] = useState("");
  const [fetchedItems, setFetchedItems] = useState<FetchedItem[]>([]);
  const [fetching, setFetching] = useState<string | null>(null);

  const [tagged, setTagged] = useState<TaggedRow[]>([]);
  const [format, setFormat] = useState<OutputFormat>("plain");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const applyPreset = (s: string, m: string) => {
    if (s) setSource(s);
    setMedium(m);
  };

  // ── Fetch from store ────────────────────────────────────────────────────
  const fetchUrls = useCallback(async (type: string, label: string) => {
    setFetching(label);
    try {
      const res = await fetch(`/api/urls?type=${type}&limit=50`);
      const data = await res.json();
      const items: FetchedItem[] = (data.urls || []).map((u: any) => ({
        id:      u.id,
        title:   u.title,
        url:     u.url,
        type:    u.type,
        checked: true,
      }));
      setFetchedItems(items);
    } catch {
      // ignore
    } finally {
      setFetching(null);
    }
  }, []);

  const toggleItem = (id: string) =>
    setFetchedItems((items) => items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const selectAll   = () => setFetchedItems((items) => items.map((i) => ({ ...i, checked: true  })));
  const deselectAll = () => setFetchedItems((items) => items.map((i) => ({ ...i, checked: false })));

  const addSelectedToManual = () => {
    const selected = fetchedItems.filter((i) => i.checked).map((i) => i.url);
    if (!selected.length) return;
    setManualUrls((prev) =>
      prev ? prev.trimEnd() + "\n" + selected.join("\n") : selected.join("\n"),
    );
    setFetchedItems([]);
  };

  // ── Tag all URLs ────────────────────────────────────────────────────────
  const tagAll = useCallback(() => {
    if (!source) return;

    // Build title map from fetched items
    const titleMap: Record<string, string> = {};
    for (const item of fetchedItems) {
      titleMap[item.url] = item.title;
    }

    const lines = manualUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const rows: TaggedRow[] = lines.map((url) => {
      const tagged = buildUtmUrl(url, {
        utm_source:   source,
        utm_medium:   medium,
        utm_campaign: campaign,
        utm_term:     term,
        utm_content:  content,
      });
      return {
        original: url,
        tagged,
        title:   titleMap[url] ?? titleFromUrl(url),
        valid:   !!tagged,
      };
    });
    setTagged(rows);
  }, [source, medium, campaign, term, content, manualUrls, fetchedItems]);

  // ── Copy helpers ────────────────────────────────────────────────────────
  const copyRow = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = () => {
    const text = tagged
      .filter((r) => r.valid)
      .map((r) => formatOutput(r.tagged, r.title, format))
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const exportCsv = () => {
    const header = "Original URL,Tagged URL\n";
    const body = tagged
      .map((r) => `"${r.original.replace(/"/g, '""')}","${r.tagged.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `utm-tagged-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const FETCH_BUTTONS = [
    { type: "key_pages",   label: "Key Pages"   },
    { type: "products",    label: "Products"    },
    { type: "collections", label: "Collections" },
    { type: "pages",       label: "Blog Pages"  },
  ];

  const validCount = tagged.filter((r) => r.valid).length;

  return (
    <s-section heading="Bulk UTM Tagger">
      <s-stack gap="base">

        {/* ── Step 1: UTM Parameters ─────────────────────────────────── */}
        <s-box padding="base" border="base" border-radius="base">
          <s-stack gap="base">
            <s-heading>Step 1 — UTM Parameters</s-heading>
            <QuickPresets onSelect={applyPreset} />

            <s-grid
              grid-template-columns="@container (inline-size <= 500px) 1fr, 1fr 1fr"
              gap="base"
            >
              <s-text-field
                label="Source (required)"
                name="bulk_source"
                placeholder="google, newsletter, twitter"
                value={source}
                onChange={(e: any) => setSource(e.currentTarget.value)}
              />
              <s-text-field
                label="Medium (required)"
                name="bulk_medium"
                placeholder="cpc, social, email"
                value={medium}
                onChange={(e: any) => setMedium(e.currentTarget.value)}
              />
            </s-grid>

            <s-text-field
              label="Campaign"
              name="bulk_campaign"
              placeholder="summer_sale_2026 (optional)"
              value={campaign}
              onChange={(e: any) => setCampaign(e.currentTarget.value)}
            />

            <s-grid
              grid-template-columns="@container (inline-size <= 500px) 1fr, 1fr 1fr"
              gap="base"
            >
              <s-text-field
                label="Term (optional)"
                name="bulk_term"
                value={term}
                onChange={(e: any) => setTerm(e.currentTarget.value)}
              />
              <s-text-field
                label="Content (optional)"
                name="bulk_content"
                value={content}
                onChange={(e: any) => setContent(e.currentTarget.value)}
              />
            </s-grid>
          </s-stack>
        </s-box>

        {/* ── Step 2: URLs ───────────────────────────────────────────── */}
        <s-box padding="base" border="base" border-radius="base">
          <s-stack gap="base">
            <s-heading>Step 2 — Select URLs</s-heading>

            {/* Fetch from store */}
            <s-stack gap="small-200">
              <s-text color="subdued">Fetch from your store:</s-text>
              <s-stack direction="inline" gap="small-200">
                {FETCH_BUTTONS.map((btn) => (
                  <s-button
                    key={btn.type}
                    variant="secondary"
                    loading={fetching === btn.label ? true : undefined}
                    onClick={() => fetchUrls(btn.type, btn.label)}
                  >
                    {fetching === btn.label ? "Fetching…" : btn.label}
                  </s-button>
                ))}
              </s-stack>
            </s-stack>

            {/* Checkbox list */}
            {fetchedItems.length > 0 && (
              <s-box padding="base" background="subdued" border-radius="base">
                <s-stack gap="small-200">
                  <s-stack direction="inline" gap="small-200" align-items="center">
                    <s-text type="strong">{fetchedItems.length} URLs fetched</s-text>
                    <s-button variant="tertiary" onClick={selectAll}>Select all</s-button>
                    <s-text color="subdued">·</s-text>
                    <s-button variant="tertiary" onClick={deselectAll}>Deselect all</s-button>
                  </s-stack>

                  <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {fetchedItems.map((item) => (
                      <label
                        key={item.id}
                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 0" }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          style={{ width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 13 }}>
                          <strong>{item.title}</strong>{" "}
                          <span style={{ color: "#6d7175" }}>{item.url}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <s-button
                    variant="primary"
                    onClick={addSelectedToManual}
                    disabled={fetchedItems.filter((i) => i.checked).length === 0 ? true : undefined}
                  >
                    Add {fetchedItems.filter((i) => i.checked).length} selected to list
                  </s-button>
                </s-stack>
              </s-box>
            )}

            {/* Divider */}
            <s-stack direction="inline" align-items="center" gap="base">
              <div style={{ flex: 1, height: 1, background: "#e1e3e5" }} />
              <s-text color="subdued">or paste manually</s-text>
              <div style={{ flex: 1, height: 1, background: "#e1e3e5" }} />
            </s-stack>

            <s-text-area
              label="URLs to tag (one per line)"
              name="bulk_urls"
              rows={6}
              placeholder={"https://your-store.com/products/item-1\nhttps://your-store.com/collections/sale"}
              value={manualUrls}
              onChange={(e: any) => setManualUrls(e.currentTarget.value)}
            />

            <s-stack direction="inline" gap="small-200">
              <s-button
                variant="primary"
                disabled={(!source || !manualUrls.trim()) ? true : undefined}
                onClick={tagAll}
              >
                Tag {manualUrls.split("\n").filter((u) => u.trim()).length || ""} URLs
              </s-button>
              <s-button variant="secondary" onClick={() => { setManualUrls(""); setFetchedItems([]); setTagged([]); }}>
                Clear
              </s-button>
            </s-stack>
          </s-stack>
        </s-box>

        {/* ── Step 3: Results ────────────────────────────────────────── */}
        {tagged.length > 0 && (
          <s-box padding="base" border="base" border-radius="base">
            <s-stack gap="base">
              <s-stack direction="inline" align-items="center" gap="base">
                <s-heading>{validCount} URLs tagged</s-heading>
                {tagged.length - validCount > 0 && (
                  <s-badge tone="critical">{tagged.length - validCount} invalid</s-badge>
                )}
              </s-stack>

              {/* Output format toggle */}
              <s-stack gap="small-200">
                <s-text color="subdued">Output format:</s-text>
                <s-stack direction="inline" gap="small-200">
                  {(["plain", "html", "markdown"] as OutputFormat[]).map((f) => (
                    <s-button
                      key={f}
                      variant={format === f ? "primary" : "secondary"}
                      onClick={() => setFormat(f)}
                    >
                      {f === "plain" ? "Plain URL" : f === "html" ? "HTML Link" : "Markdown"}
                    </s-button>
                  ))}
                </s-stack>
              </s-stack>

              {/* Results table */}
              <s-table variant="auto" accessibility-label="Tagged URLs">
                <s-table-header-row>
                  <s-table-header list-slot="primary">Original URL</s-table-header>
                  <s-table-header list-slot="labeled">Output</s-table-header>
                  <s-table-header list-slot="labeled">Copy</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {tagged.map((row, i) => {
                    const out = row.valid ? formatOutput(row.tagged, row.title, format) : "— invalid URL —";
                    return (
                      <s-table-row key={i}>
                        <s-table-cell>
                          {/* @ts-ignore – "critical" is valid at runtime but missing from polaris-types */}
                          <s-text color={row.valid ? undefined : "critical"}>{row.original}</s-text>
                        </s-table-cell>
                        <s-table-cell>
                          <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", maxWidth: 360 }}>
                            {out}
                          </div>
                        </s-table-cell>
                        <s-table-cell>
                          {row.valid && (
                            <s-button
                              variant="secondary"
                              icon={copiedIdx === i ? "check" : "clipboard"}
                              onClick={() => copyRow(i, out)}
                            >
                              {copiedIdx === i ? "Copied" : "Copy"}
                            </s-button>
                          )}
                        </s-table-cell>
                      </s-table-row>
                    );
                  })}
                </s-table-body>
              </s-table>

              {/* Bulk actions */}
              <s-stack direction="inline" gap="small-200">
                <s-button variant="primary" icon={copiedAll ? "check" : "clipboard"} onClick={copyAll}>
                  {copiedAll ? "Copied!" : "Copy All"}
                </s-button>
                <s-button variant="secondary" icon="export" onClick={exportCsv}>
                  Export CSV
                </s-button>
              </s-stack>
            </s-stack>
          </s-box>
        )}
      </s-stack>
    </s-section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function UtmBuilderPage() {
  const { shopUrl } = useLoaderData<typeof loader>();
  const { search }  = useLocation();
  const params      = new URLSearchParams(search);

  const initialTab = params.get("tab") === "bulk" ? "bulk" : "single";
  const [tab, setTab] = useState<"single" | "bulk">(initialTab as "single" | "bulk");

  const bulkProps: BulkTaggerProps = {
    initialSource:   params.get("source")   ?? "",
    initialMedium:   params.get("medium")   ?? "",
    initialCampaign: params.get("campaign") ?? "",
    initialTerm:     params.get("term")     ?? "",
    initialContent:  params.get("content")  ?? "",
  };

  return (
    <s-page heading="UTM Link Builder">
      <s-section padding="none">
        <s-box padding="base">
          <s-stack direction="inline" gap="small-200">
            <s-button variant={tab === "single" ? "primary" : "secondary"} onClick={() => setTab("single")}>
              Single URL
            </s-button>
            <s-button variant={tab === "bulk" ? "primary" : "secondary"} onClick={() => setTab("bulk")}>
              Bulk Tagger
            </s-button>
          </s-stack>
        </s-box>
      </s-section>

      {tab === "single" ? <SingleBuilder shopUrl={shopUrl} /> : <BulkTagger {...bulkProps} />}
    </s-page>
  );
}
