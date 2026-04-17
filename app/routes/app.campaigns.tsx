import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate, useRevalidator, useOutlet } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { listCampaigns } from "../lib/queries.server";
import prisma from "../db.server";

// ── Loader ───────────────────────────────────────────────────────────────────

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;

  const campaigns = await listCampaigns(session.shop, {
    status,
    orderby: "created_at",
    order: "DESC",
  });

  return { campaigns, currentStatus: status || "all" };
};

// ── Action ───────────────────────────────────────────────────────────────────

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.json();
  const intent = formData.intent as string;

  if (intent === "create" || intent === "update") {
    const name = (formData.name || "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
    const source = (formData.source || "").trim();
    if (!source) return Response.json({ error: "Source is required" }, { status: 400 });

    let slug = (formData.slug || name)
      .toLowerCase().trim()
      .replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-").replace(/^-+|-+$/g, "");

    const data = {
      name, slug, source,
      medium: (formData.medium || "").trim(),
      campaign: (formData.campaign || name).trim(),
      term: (formData.term || "").trim(),
      content: (formData.content || "").trim(),
      status: formData.status || "active",
      goalVisits: parseInt(formData.goalVisits, 10) || 0,
      tags: (formData.tags || "").trim(),
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      notes: (formData.notes || "").trim(),
    };

    if (intent === "create") {
      const existing = await prisma.campaign.findUnique({ where: { shop_slug: { shop, slug } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      await prisma.campaign.create({ data: { shop, ...data, slug } });
      return Response.json({ ok: true });
    }

    const id = parseInt(formData.id, 10);
    const campaign = await prisma.campaign.findFirst({ where: { id, shop } });
    if (!campaign) return Response.json({ error: "Not found" }, { status: 404 });
    if (slug !== campaign.slug) {
      const conflict = await prisma.campaign.findUnique({ where: { shop_slug: { shop, slug } } });
      if (conflict) return Response.json({ error: "Slug already exists" }, { status: 409 });
    }
    await prisma.campaign.update({ where: { id }, data: { ...data, slug } });
    return Response.json({ ok: true });
  }

  if (intent === "delete") {
    const id = parseInt(formData.id, 10);
    const campaign = await prisma.campaign.findFirst({ where: { id, shop } });
    if (!campaign) return Response.json({ error: "Not found" }, { status: 404 });
    await prisma.visit.updateMany({ where: { campaignId: id }, data: { campaignId: null } });
    await prisma.campaign.delete({ where: { id } });
    return Response.json({ ok: true });
  }

  if (intent === "duplicate") {
    const id = parseInt(formData.id, 10);
    const original = await prisma.campaign.findFirst({ where: { id, shop } });
    if (!original) return Response.json({ error: "Not found" }, { status: 404 });
    await prisma.campaign.create({
      data: {
        shop, name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        source: original.source, medium: original.medium,
        campaign: original.campaign, term: original.term,
        content: original.content, status: "active",
        goalVisits: original.goalVisits, tags: original.tags,
        startDate: original.startDate, endDate: original.endDate,
        notes: original.notes,
      },
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown intent" }, { status: 400 });
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignRow {
  id: number;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  status: string;
  goalVisits: number;
  tags: string;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  totalVisits: number;
  uniqueVisitors: number;
}

interface CampaignFormData {
  id?: number;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  status: string;
  goalVisits: string;
  tags: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const EMPTY_FORM: CampaignFormData = {
  name: "", source: "", medium: "", campaign: "",
  term: "", content: "", status: "active",
  goalVisits: "0", tags: "", startDate: "", endDate: "", notes: "",
};

const STATUS_TONE: Record<string, string> = {
  active: "success",
  paused: "warning",
  completed: "info",
};

// ── Modal helpers — Polaris s-modal API uses showOverlay() / hideOverlay() ────

function modalShow(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id) as any;
  if (!el) return;
  // Polaris web component imperative API
  if (typeof el.showOverlay === "function") {
    el.showOverlay();
  } else if (typeof (window as any).shopify?.modal?.show === "function") {
    // App Bridge Modal API fallback
    (window as any).shopify.modal.show(id);
  }
}

function modalHide(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id) as any;
  if (!el) return;
  if (typeof el.hideOverlay === "function") {
    el.hideOverlay();
  } else if (typeof (window as any).shopify?.modal?.hide === "function") {
    (window as any).shopify.modal.hide(id);
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  // ── ALL hooks must be at the top — no hooks after an early return ──────────
  const outlet      = useOutlet();
  const loaderData  = useLoaderData<typeof loader>();
  const navigate    = useNavigate();
  const revalidator = useRevalidator();

  const [formData, setFormData]       = useState<CampaignFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [pendingModal, setPendingModal] = useState<"form" | "delete" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  const set = (field: keyof CampaignFormData) => (e: any) => {
    // s-number-field and s-date-field dispatch CustomEvent with value in e.detail;
    // s-text-field / s-select / s-text-area use the standard e.target.value path.
    const val = e.detail?.value ?? e.detail ?? e.currentTarget?.value ?? e.target?.value ?? "";
    setFormData((f) => ({ ...f, [field]: String(val) }));
  };

  useEffect(() => {
    if (pendingModal === "form") {
      modalShow("campaign-form-modal");
      setPendingModal(null);
    } else if (pendingModal === "delete") {
      modalShow("delete-confirm-modal");
      setPendingModal(null);
    }
  }, [pendingModal, formData, deleteTarget]);

  const handleCreate = useCallback(() => {
    setFormData(EMPTY_FORM);
    setPendingModal("form");
  }, []);

  const handleEdit = useCallback((c: CampaignRow) => {
    setFormData({
      id: c.id,
      name: c.name, source: c.source, medium: c.medium,
      campaign: c.campaign, term: c.term, content: c.content,
      status: c.status, goalVisits: String(c.goalVisits), tags: c.tags,
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "",
      notes: c.notes,
    });
    setPendingModal("form");
  }, []);

  const handleSubmit = useCallback(async () => {
    const intent = formData.id ? "update" : "create";
    setIsSubmitting(true);
    try {
      await fetch("/app/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, intent }),
      });
      modalHide("campaign-form-modal");
      setFormData(EMPTY_FORM);
      revalidator.revalidate();
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, revalidator]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetch("/app/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "delete", id: deleteTarget.id }),
      });
      modalHide("delete-confirm-modal");
      setDeleteTarget(null);
      revalidator.revalidate();
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, revalidator]);

  const handleDuplicate = useCallback(async (id: number) => {
    setDuplicatingId(id);
    try {
      await fetch("/app/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "duplicate", id }),
      });
      revalidator.revalidate();
    } finally {
      setDuplicatingId(null);
    }
  }, [revalidator]);

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  // When navigating to /app/campaigns/:id, React Router renders this component
  // as the parent layout and injects the child (campaign stats page) via outlet.
  if (outlet) return outlet;

  const { campaigns, currentStatus } = loaderData;

  const filterTab = (status: string) => {
    navigate(`/app/campaigns${status === "all" ? "" : `?status=${status}`}`);
  };

  const isEdit = !!formData.id;

  const tabs = [
    { key: "all", label: `All (${campaigns.length})` },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <s-page heading="Campaigns" inline-size="full">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        /* Filter tabs scroll horizontally on small screens */
        .tyt-filter-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
        /* Table scrolls inside its container */
        .tyt-camp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
        /* Compact action buttons on mobile */
        @media (max-width: 600px) {
          .tyt-camp-actions s-button { --s-button-padding-inline: 6px; }
        }
      `}</style>

      {/* Primary action */}
      <s-button
        slot="primary-action"
        variant="primary"
        icon="plus"
        onClick={handleCreate}
      >
        Create Campaign
      </s-button>

      {/* ── Status filter tabs ─────────────────────────────────────────── */}
      <s-section padding="none">
        <s-box padding="base">
          <div className="tyt-filter-wrap">
          <s-stack direction="inline" gap="small-200">
            {tabs.map(({ key, label }) => (
              <s-button
                key={key}
                variant={currentStatus === key ? "primary" : "secondary"}
                onClick={() => filterTab(key)}

              >
                {label}
              </s-button>
            ))}
          </s-stack>
          </div>
        </s-box>
      </s-section>

      {/* ── Campaign table ─────────────────────────────────────────────── */}
      {campaigns.length > 0 ? (
        <s-section padding="none">
          <div className="tyt-camp-table-wrap">
          <s-table variant="auto" accessibility-label="Campaign list">
            <s-table-header-row>
              <s-table-header list-slot="primary">Campaign</s-table-header>
              <s-table-header list-slot="labeled">Status</s-table-header>
              <s-table-header list-slot="labeled">Source</s-table-header>
              <s-table-header list-slot="labeled" format="numeric">
                Visits
              </s-table-header>
              <s-table-header list-slot="labeled" format="numeric">
                Uniques
              </s-table-header>
              <s-table-header list-slot="inline">Actions</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {campaigns.map((c) => (
                <s-table-row key={c.id}>
                  {/* Name + tags */}
                  <s-table-cell>
                    <s-stack gap="small-100">
                      <s-text type="strong">{c.name}</s-text>
                      {c.tags && (
                        <s-stack direction="inline" gap="small-100">
                          {c.tags
                            .split(",")
                            .filter(Boolean)
                            .map((t: string) => (
                              <s-chip key={t.trim()} color="base">
                                {t.trim()}
                              </s-chip>
                            ))}
                        </s-stack>
                      )}
                    </s-stack>
                  </s-table-cell>

                  {/* Status badge */}
                  <s-table-cell>
                    <s-badge tone={(STATUS_TONE[c.status] ?? "neutral") as any}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </s-badge>
                  </s-table-cell>

                  {/* Source / medium */}
                  <s-table-cell>
                    <s-stack gap="small-100">
                      <s-text>{c.source}</s-text>
                      {c.medium && (
                        <s-text color="subdued">{c.medium}</s-text>
                      )}
                    </s-stack>
                  </s-table-cell>

                  <s-table-cell>{c.totalVisits.toLocaleString()}</s-table-cell>
                  <s-table-cell>
                    {c.uniqueVisitors.toLocaleString()}
                  </s-table-cell>

                  {/* Row action menu */}
                  <s-table-cell>
                    <s-stack direction="inline" gap="small-100" className="tyt-camp-actions">
                      <s-button
                        variant="tertiary"
                        icon="view"
                        onClick={() => navigate(`/app/campaigns/${c.id}`)}
                        accessibility-label="View stats"
                      />
                      <s-button
                        variant="tertiary"
                        icon="edit"
                        onClick={() => handleEdit(c as CampaignRow)}
                        accessibility-label="Edit campaign"
                      />
                      <s-button
                        variant="tertiary"
                        icon="link"
                        onClick={() => {
                          const p = new URLSearchParams({ tab: "bulk" });
                          if (c.source)   p.set("source",   c.source);
                          if (c.medium)   p.set("medium",   c.medium);
                          if (c.campaign) p.set("campaign", c.campaign);
                          if (c.term)     p.set("term",     c.term);
                          if (c.content)  p.set("content",  c.content);
                          navigate(`/app/utm-builder?${p}`);
                        }}
                        accessibility-label="Tag URLs in UTM Builder"
                      />
                      <s-button
                        variant="tertiary"
                        icon="duplicate"
                        loading={duplicatingId === c.id ? true : undefined}
                        onClick={() => handleDuplicate(c.id)}
                        accessibility-label="Duplicate campaign"
                      />
                      <s-button
                        variant="tertiary"
                        tone="critical"
                        icon="delete"
                        onClick={() => {
                          setDeleteTarget({ id: c.id, name: c.name });
                          setPendingModal("delete");
                        }}
                        accessibility-label="Delete campaign"
                      />
                    </s-stack>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
          </div>
        </s-section>
      ) : (
        /* ── Empty state ────────────────────────────────────────────────── */
        <s-section>
          <s-box padding="base">
            <s-stack gap="base" align-items="center">
              {/* @ts-expect-error – "campaign" type and "large" size are valid at runtime but missing from polaris-types */}
              <s-icon type="campaign" color="subdued" size="large" />
              <s-stack gap="small-200" align-items="center">
                <s-heading>
                  {currentStatus === "all"
                    ? "No campaigns yet"
                    : `No ${currentStatus} campaigns`}
                </s-heading>
                <s-text color="subdued">
                  {currentStatus === "all"
                    ? "Create your first campaign to start tracking UTM performance."
                    : `There are no campaigns with "${currentStatus}" status.`}
                </s-text>
              </s-stack>
              {currentStatus === "all" && (
                <s-button variant="primary" icon="plus" onClick={handleCreate}>
                  Create Campaign
                </s-button>
              )}
            </s-stack>
          </s-box>
        </s-section>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <s-modal
        id="campaign-form-modal"
        heading={isEdit ? "Edit Campaign" : "Create Campaign"}
      >
        <s-stack gap="base">
          <s-text-field
            label="Campaign Name"
            name="name"
            required
            value={formData.name}
            onChange={set("name")}
            placeholder="e.g. Summer Sale 2026"
          />

          <s-grid
            grid-template-columns="@container (inline-size <= 400px) 1fr, 1fr 1fr"
            gap="base"
          >
            <s-text-field
              label="UTM Source"
              name="source"
              required
              placeholder="google, facebook, newsletter"
              value={formData.source}
              onChange={set("source")}
            />
            <s-text-field
              label="UTM Medium"
              name="medium"
              placeholder="cpc, social, email"
              value={formData.medium}
              onChange={set("medium")}
            />
          </s-grid>

          <s-text-field
            label="UTM Campaign"
            name="campaign"
            placeholder="Defaults to campaign name"
            value={formData.campaign}
            onChange={set("campaign")}
          />

          <s-grid
            grid-template-columns="@container (inline-size <= 400px) 1fr, 1fr 1fr"
            gap="base"
          >
            <s-text-field
              label="UTM Term"
              name="term"
              placeholder="Paid keyword"
              value={formData.term}
              onChange={set("term")}
            />
            <s-text-field
              label="UTM Content"
              name="content"
              placeholder="Ad variant / creative"
              value={formData.content}
              onChange={set("content")}
            />
          </s-grid>

          <s-grid
            grid-template-columns="@container (inline-size <= 400px) 1fr, 1fr 1fr"
            gap="base"
          >
            <s-select
              label="Status"
              name="status"
              value={formData.status}
              onChange={set("status")}
            >
              <s-option value="active">Active</s-option>
              <s-option value="paused">Paused</s-option>
              <s-option value="completed">Completed</s-option>
            </s-select>
            <s-number-field
              label="Goal Visits"
              name="goalVisits"
              min={0}
              value={formData.goalVisits}
              onChange={set("goalVisits")}
            />
          </s-grid>

          <s-grid
            grid-template-columns="@container (inline-size <= 400px) 1fr, 1fr 1fr"
            gap="base"
          >
            <s-date-field
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={set("startDate")}
            />
            <s-date-field
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={set("endDate")}
            />
          </s-grid>

          <s-text-field
            label="Tags"
            name="tags"
            placeholder="brand, retargeting (comma-separated)"
            value={formData.tags}
            onChange={set("tags")}
          />
          <s-text-area
            label="Notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={set("notes")}
          />
        </s-stack>

        <s-button
          slot="primary-action"
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting ? true : undefined}
          icon={isSubmitting ? "spinner" : undefined}
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Campaign"}
        </s-button>
        <s-button
          slot="secondary-actions"
          commandFor="campaign-form-modal"
          command="--hide"
        >
          Cancel
        </s-button>
      </s-modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <s-modal id="delete-confirm-modal" heading="Delete Campaign">
        <s-stack gap="base">
          <s-banner tone="warning" heading="This action cannot be undone" />
          <s-text>
            Are you sure you want to delete{" "}
            <s-text type="strong">{deleteTarget?.name}</s-text>? Linked visit
            data will be preserved but unlinked from this campaign.
          </s-text>
        </s-stack>

        <s-button
          slot="primary-action"
          variant="primary"
          tone="critical"
          onClick={handleDelete}
          disabled={isDeleting ? true : undefined}
          icon={isDeleting ? "spinner" : undefined}
        >
          {isDeleting ? "Deleting…" : "Delete Campaign"}
        </s-button>
        <s-button
          slot="secondary-actions"
          commandFor="delete-confirm-modal"
          command="--hide"
        >
          Cancel
        </s-button>
      </s-modal>
    </s-page>
  );
}
