import { describe, it, expect } from "vitest";
import { prisma, SHOP_A, SHOP_B } from "./setup";
import {
  getTotals,
  getByChannel,
  getTopSources,
  getDaily,
  getTopPages,
  getTopCampaigns,
  getTodayCount,
  getYesterdayCount,
  getDashboardStats,
  listCampaigns,
  getCampaignStats,
  cleanupOldVisits,
} from "~/lib/queries.server";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Create a visit with sensible defaults. */
function visit(
  shop: string,
  overrides: Partial<{
    source: string;
    medium: string;
    campaign: string;
    channel: string;
    landingPage: string;
    referrer: string;
    clickIdType: string;
    visitorHash: string;
    createdAt: Date;
  }> = {},
) {
  return {
    shop,
    source: overrides.source ?? "google",
    medium: overrides.medium ?? "organic",
    campaign: overrides.campaign ?? "",
    channel: overrides.channel ?? "Organic",
    landingPage: overrides.landingPage ?? "/",
    referrer: overrides.referrer ?? "",
    clickIdType: overrides.clickIdType ?? "",
    visitorHash: overrides.visitorHash ?? `hash_${Math.random().toString(36).slice(2)}`,
    createdAt: overrides.createdAt ?? new Date(),
  };
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0); // noon so it's clearly within that day
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function todayNoon(): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

function yesterdayNoon(): Date {
  return daysAgo(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════

describe("Dashboard query helpers", () => {
  // ── getTotals ───────────────────────────────────────────────────────────

  describe("getTotals", () => {
    it("returns zeros when no visits exist", async () => {
      const result = await getTotals(SHOP_A, 30);
      expect(result).toEqual({ totalVisits: 0, uniqueVisitors: 0 });
    });

    it("counts total visits and unique visitors", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { visitorHash: "aaa" }),
          visit(SHOP_A, { visitorHash: "aaa" }), // same visitor
          visit(SHOP_A, { visitorHash: "bbb" }),
        ],
      });
      const result = await getTotals(SHOP_A, 30);
      expect(result.totalVisits).toBe(3);
      expect(result.uniqueVisitors).toBe(2);
    });

    it("is shop-scoped", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { visitorHash: "a1" }),
          visit(SHOP_B, { visitorHash: "b1" }),
          visit(SHOP_B, { visitorHash: "b2" }),
        ],
      });
      const a = await getTotals(SHOP_A, 30);
      const b = await getTotals(SHOP_B, 30);
      expect(a.totalVisits).toBe(1);
      expect(b.totalVisits).toBe(2);
    });

    it("respects the days parameter", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_A, { createdAt: daysAgo(10) }),
          visit(SHOP_A, { createdAt: daysAgo(40) }), // outside 30-day window
        ],
      });
      const result = await getTotals(SHOP_A, 30);
      expect(result.totalVisits).toBe(2);
    });
  });

  // ── getByChannel ──────────────────────────────────────────────────────

  describe("getByChannel", () => {
    it("returns empty array when no visits", async () => {
      const result = await getByChannel(SHOP_A, 30);
      expect(result).toEqual([]);
    });

    it("groups by channel with correct counts", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { channel: "Paid", visitorHash: "p1" }),
          visit(SHOP_A, { channel: "Paid", visitorHash: "p1" }),
          visit(SHOP_A, { channel: "Paid", visitorHash: "p2" }),
          visit(SHOP_A, { channel: "Organic", visitorHash: "o1" }),
          visit(SHOP_A, { channel: "Social", visitorHash: "s1" }),
        ],
      });
      const result = await getByChannel(SHOP_A, 30);

      // Sorted by visits DESC
      expect(result[0].channel).toBe("Paid");
      expect(result[0].visits).toBe(3);
      expect(result[0].uniques).toBe(2);

      expect(result.find((r) => r.channel === "Organic")?.visits).toBe(1);
      expect(result.find((r) => r.channel === "Social")?.visits).toBe(1);
    });

    it("is shop-scoped", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { channel: "Paid" }),
          visit(SHOP_B, { channel: "Paid" }),
          visit(SHOP_B, { channel: "Organic" }),
        ],
      });
      const a = await getByChannel(SHOP_A, 30);
      const b = await getByChannel(SHOP_B, 30);
      expect(a).toHaveLength(1);
      expect(b).toHaveLength(2);
    });
  });

  // ── getTopSources ─────────────────────────────────────────────────────

  describe("getTopSources", () => {
    it("groups by source + medium pair", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { source: "google", medium: "cpc" }),
          visit(SHOP_A, { source: "google", medium: "cpc" }),
          visit(SHOP_A, { source: "google", medium: "organic" }),
          visit(SHOP_A, { source: "facebook", medium: "social" }),
        ],
      });
      const result = await getTopSources(SHOP_A, 30);

      expect(result[0].source).toBe("google");
      expect(result[0].medium).toBe("cpc");
      expect(result[0].visits).toBe(2);

      expect(result).toHaveLength(3);
    });

    it("respects the limit parameter", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { source: "src1", medium: "m1" }),
          visit(SHOP_A, { source: "src2", medium: "m2" }),
          visit(SHOP_A, { source: "src3", medium: "m3" }),
        ],
      });
      const result = await getTopSources(SHOP_A, 30, 2);
      expect(result).toHaveLength(2);
    });
  });

  // ── getDaily ──────────────────────────────────────────────────────────

  describe("getDaily", () => {
    it("returns daily breakdown sorted ASC", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: daysAgo(2), visitorHash: "d2a" }),
          visit(SHOP_A, { createdAt: daysAgo(2), visitorHash: "d2a" }),
          visit(SHOP_A, { createdAt: daysAgo(1), visitorHash: "d1a" }),
          visit(SHOP_A, { createdAt: todayNoon(), visitorHash: "d0a" }),
        ],
      });
      const result = await getDaily(SHOP_A, 30);

      expect(result).toHaveLength(3);
      // Should be sorted by date ASC
      expect(result[0].date < result[1].date).toBe(true);
      expect(result[1].date < result[2].date).toBe(true);

      // 2 days ago: 2 visits, 1 unique
      const twoDaysAgo = result[0];
      expect(twoDaysAgo.visits).toBe(2);
      expect(twoDaysAgo.uniques).toBe(1);
    });

    it("returns dates as YYYY-MM-DD strings", async () => {
      await prisma.visit.create({ data: visit(SHOP_A) });
      const result = await getDaily(SHOP_A, 30);
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ── getTopPages ───────────────────────────────────────────────────────

  describe("getTopPages", () => {
    it("groups by landing page with counts", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { landingPage: "/products/shoes", visitorHash: "p1" }),
          visit(SHOP_A, { landingPage: "/products/shoes", visitorHash: "p2" }),
          visit(SHOP_A, { landingPage: "/collections/sale", visitorHash: "c1" }),
        ],
      });
      const result = await getTopPages(SHOP_A, 30);

      expect(result[0].landingPage).toBe("/products/shoes");
      expect(result[0].visits).toBe(2);
      expect(result[0].uniques).toBe(2);

      expect(result[1].landingPage).toBe("/collections/sale");
      expect(result[1].visits).toBe(1);
    });

    it("respects the limit parameter", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { landingPage: "/page1" }),
          visit(SHOP_A, { landingPage: "/page2" }),
          visit(SHOP_A, { landingPage: "/page3" }),
        ],
      });
      const result = await getTopPages(SHOP_A, 30, 2);
      expect(result).toHaveLength(2);
    });
  });

  // ── getTopCampaigns ───────────────────────────────────────────────────

  describe("getTopCampaigns", () => {
    it("groups by campaign name, excludes empty/auto-tagged", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { campaign: "summer_sale" }),
          visit(SHOP_A, { campaign: "summer_sale" }),
          visit(SHOP_A, { campaign: "winter_promo" }),
          visit(SHOP_A, { campaign: "" }), // excluded
          visit(SHOP_A, { campaign: "(not set)" }), // excluded
          visit(SHOP_A, { campaign: "(auto-tagged)" }), // excluded
        ],
      });
      const result = await getTopCampaigns(SHOP_A, 30);

      expect(result).toHaveLength(2);
      expect(result[0].campaign).toBe("summer_sale");
      expect(result[0].visits).toBe(2);
      expect(result[1].campaign).toBe("winter_promo");
      expect(result[1].visits).toBe(1);
    });

    it("respects the limit parameter", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { campaign: "c1" }),
          visit(SHOP_A, { campaign: "c2" }),
          visit(SHOP_A, { campaign: "c3" }),
        ],
      });
      const result = await getTopCampaigns(SHOP_A, 30, 2);
      expect(result).toHaveLength(2);
    });
  });

  // ── getTodayCount / getYesterdayCount ─────────────────────────────────

  describe("getTodayCount", () => {
    it("counts only today's visits", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_A, { createdAt: yesterdayNoon() }),
        ],
      });
      expect(await getTodayCount(SHOP_A)).toBe(2);
    });

    it("returns 0 when no visits today", async () => {
      await prisma.visit.create({
        data: visit(SHOP_A, { createdAt: daysAgo(5) }),
      });
      expect(await getTodayCount(SHOP_A)).toBe(0);
    });

    it("is shop-scoped", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_B, { createdAt: todayNoon() }),
          visit(SHOP_B, { createdAt: todayNoon() }),
        ],
      });
      expect(await getTodayCount(SHOP_A)).toBe(1);
      expect(await getTodayCount(SHOP_B)).toBe(2);
    });
  });

  describe("getYesterdayCount", () => {
    it("counts only yesterday's visits", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: yesterdayNoon() }),
          visit(SHOP_A, { createdAt: yesterdayNoon() }),
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_A, { createdAt: daysAgo(3) }),
        ],
      });
      expect(await getYesterdayCount(SHOP_A)).toBe(2);
    });
  });

  // ── getDashboardStats ─────────────────────────────────────────────────

  describe("getDashboardStats", () => {
    it("returns complete stats bundle with all fields", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, {
            channel: "Paid",
            source: "google",
            medium: "cpc",
            campaign: "summer_sale",
            landingPage: "/products/shoes",
            visitorHash: "v1",
            createdAt: todayNoon(),
          }),
          visit(SHOP_A, {
            channel: "Organic",
            source: "google",
            medium: "organic",
            campaign: "",
            landingPage: "/",
            visitorHash: "v2",
            createdAt: yesterdayNoon(),
          }),
        ],
      });

      const stats = await getDashboardStats(SHOP_A, 30);

      expect(stats.period).toBe(30);
      expect(stats.totalVisits).toBe(2);
      expect(stats.uniqueVisitors).toBe(2);
      expect(stats.today).toBe(1);
      expect(stats.yesterday).toBe(1);
      expect(stats.byChannel).toHaveLength(2);
      expect(stats.topSources).toHaveLength(2);
      expect(stats.daily).toHaveLength(2);
      expect(stats.topPages).toHaveLength(2);
      expect(stats.topCampaigns).toHaveLength(1); // empty campaign excluded
    });

    it("returns zeros/empty arrays for a shop with no data", async () => {
      const stats = await getDashboardStats(SHOP_A, 30);

      expect(stats.totalVisits).toBe(0);
      expect(stats.uniqueVisitors).toBe(0);
      expect(stats.today).toBe(0);
      expect(stats.yesterday).toBe(0);
      expect(stats.byChannel).toEqual([]);
      expect(stats.topSources).toEqual([]);
      expect(stats.daily).toEqual([]);
      expect(stats.topPages).toEqual([]);
      expect(stats.topCampaigns).toEqual([]);
    });

    it("clamps days between 1 and 365", async () => {
      const stats0 = await getDashboardStats(SHOP_A, 0);
      expect(stats0.period).toBe(1);

      const stats999 = await getDashboardStats(SHOP_A, 999);
      expect(stats999.period).toBe(365);
    });

    it("is shop-scoped — Shop B data not in Shop A stats", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { createdAt: todayNoon() }),
          visit(SHOP_B, { createdAt: todayNoon() }),
          visit(SHOP_B, { createdAt: todayNoon() }),
        ],
      });
      const statsA = await getDashboardStats(SHOP_A, 30);
      const statsB = await getDashboardStats(SHOP_B, 30);

      expect(statsA.totalVisits).toBe(1);
      expect(statsB.totalVisits).toBe(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN QUERIES
// ═══════════════════════════════════════════════════════════════════════════

describe("Campaign query helpers", () => {
  // ── listCampaigns ─────────────────────────────────────────────────────

  describe("listCampaigns", () => {
    it("returns campaigns with visit counts via LEFT JOIN", async () => {
      // Create a campaign
      await prisma.campaign.create({
        data: {
          shop: SHOP_A,
          name: "Summer Sale",
          slug: "summer-sale",
          source: "google",
          medium: "cpc",
          campaign: "summer_sale",
        },
      });
      // Create visits matching that campaign slug
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { campaign: "summer_sale", visitorHash: "v1" }),
          visit(SHOP_A, { campaign: "summer_sale", visitorHash: "v1" }),
          visit(SHOP_A, { campaign: "summer_sale", visitorHash: "v2" }),
        ],
      });

      const result = await listCampaigns(SHOP_A);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Summer Sale");
      expect(result[0].totalVisits).toBe(3);
      expect(result[0].uniqueVisitors).toBe(2);
    });

    it("returns 0 counts for campaigns with no visits", async () => {
      await prisma.campaign.create({
        data: {
          shop: SHOP_A,
          name: "No Traffic",
          slug: "no-traffic",
          source: "x",
          medium: "y",
          campaign: "no_traffic",
        },
      });

      const result = await listCampaigns(SHOP_A);
      expect(result[0].totalVisits).toBe(0);
      expect(result[0].uniqueVisitors).toBe(0);
    });

    it("filters by status", async () => {
      await prisma.campaign.createMany({
        data: [
          { shop: SHOP_A, name: "Active", slug: "active", source: "g", medium: "c", campaign: "a", status: "active" },
          { shop: SHOP_A, name: "Paused", slug: "paused", source: "g", medium: "c", campaign: "p", status: "paused" },
          { shop: SHOP_A, name: "Ended", slug: "ended", source: "g", medium: "c", campaign: "e", status: "ended" },
        ],
      });

      const active = await listCampaigns(SHOP_A, { status: "active" });
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe("Active");

      const paused = await listCampaigns(SHOP_A, { status: "paused" });
      expect(paused).toHaveLength(1);
      expect(paused[0].name).toBe("Paused");

      const all = await listCampaigns(SHOP_A);
      expect(all).toHaveLength(3);
    });

    it("sorts by specified column and order", async () => {
      await prisma.campaign.createMany({
        data: [
          { shop: SHOP_A, name: "Bravo", slug: "bravo", source: "g", medium: "c", campaign: "b" },
          { shop: SHOP_A, name: "Alpha", slug: "alpha", source: "g", medium: "c", campaign: "a" },
          { shop: SHOP_A, name: "Charlie", slug: "charlie", source: "g", medium: "c", campaign: "c" },
        ],
      });

      const asc = await listCampaigns(SHOP_A, { orderby: "name", order: "ASC" });
      expect(asc.map((c) => c.name)).toEqual(["Alpha", "Bravo", "Charlie"]);

      const desc = await listCampaigns(SHOP_A, { orderby: "name", order: "DESC" });
      expect(desc.map((c) => c.name)).toEqual(["Charlie", "Bravo", "Alpha"]);
    });

    it("falls back to created_at for invalid orderby", async () => {
      await prisma.campaign.create({
        data: { shop: SHOP_A, name: "Test", slug: "test", source: "g", medium: "c", campaign: "t" },
      });

      // Should not throw with invalid orderby
      const result = await listCampaigns(SHOP_A, { orderby: "DROP TABLE; --" as any });
      expect(result).toHaveLength(1);
    });

    it("is shop-scoped", async () => {
      await prisma.campaign.createMany({
        data: [
          { shop: SHOP_A, name: "A Camp", slug: "a-camp", source: "g", medium: "c", campaign: "a" },
          { shop: SHOP_B, name: "B Camp", slug: "b-camp", source: "g", medium: "c", campaign: "b" },
        ],
      });

      const a = await listCampaigns(SHOP_A);
      const b = await listCampaigns(SHOP_B);
      expect(a).toHaveLength(1);
      expect(a[0].name).toBe("A Camp");
      expect(b).toHaveLength(1);
      expect(b[0].name).toBe("B Camp");
    });
  });

  // ── getCampaignStats ──────────────────────────────────────────────────

  describe("getCampaignStats", () => {
    it("returns totals, daily, and top pages for a campaign", async () => {
      const campaignSlug = "summer_sale";
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, {
            campaign: campaignSlug,
            landingPage: "/products/shoes",
            visitorHash: "v1",
            createdAt: todayNoon(),
          }),
          visit(SHOP_A, {
            campaign: campaignSlug,
            landingPage: "/products/shoes",
            visitorHash: "v2",
            createdAt: todayNoon(),
          }),
          visit(SHOP_A, {
            campaign: campaignSlug,
            landingPage: "/collections/sale",
            visitorHash: "v1",
            createdAt: yesterdayNoon(),
          }),
        ],
      });

      const stats = await getCampaignStats(SHOP_A, campaignSlug);

      expect(stats.visits).toBe(3);
      expect(stats.uniques).toBe(2);
      expect(stats.daily).toHaveLength(2);
      expect(stats.topPages).toHaveLength(2);
      expect(stats.topPages[0].landingPage).toBe("/products/shoes");
      expect(stats.topPages[0].visits).toBe(2);
    });

    it("returns zeros for a campaign with no visits", async () => {
      const stats = await getCampaignStats(SHOP_A, "nonexistent_campaign");

      expect(stats.visits).toBe(0);
      expect(stats.uniques).toBe(0);
      expect(stats.daily).toEqual([]);
      expect(stats.topPages).toEqual([]);
    });

    it("is shop-scoped", async () => {
      await prisma.visit.createMany({
        data: [
          visit(SHOP_A, { campaign: "shared_name" }),
          visit(SHOP_B, { campaign: "shared_name" }),
          visit(SHOP_B, { campaign: "shared_name" }),
        ],
      });

      const a = await getCampaignStats(SHOP_A, "shared_name");
      const b = await getCampaignStats(SHOP_B, "shared_name");

      expect(a.visits).toBe(1);
      expect(b.visits).toBe(2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA RETENTION CLEANUP
// ═══════════════════════════════════════════════════════════════════════════

describe("cleanupOldVisits", () => {
  it("deletes visits older than retention period", async () => {
    await prisma.visit.createMany({
      data: [
        visit(SHOP_A, { createdAt: todayNoon() }),
        visit(SHOP_A, { createdAt: daysAgo(5) }),
        visit(SHOP_A, { createdAt: daysAgo(30) }),
        visit(SHOP_A, { createdAt: daysAgo(60) }),
        visit(SHOP_A, { createdAt: daysAgo(90) }),
      ],
    });

    const deleted = await cleanupOldVisits(SHOP_A, 30);

    expect(deleted).toBe(2); // 60 and 90 days ago
    const remaining = await prisma.visit.count({ where: { shop: SHOP_A } });
    expect(remaining).toBe(3);
  });

  it("returns 0 and does nothing when retentionDays is 0 (keep forever)", async () => {
    await prisma.visit.createMany({
      data: [
        visit(SHOP_A, { createdAt: daysAgo(365) }),
        visit(SHOP_A, { createdAt: daysAgo(730) }),
      ],
    });

    const deleted = await cleanupOldVisits(SHOP_A, 0);
    expect(deleted).toBe(0);
    expect(await prisma.visit.count({ where: { shop: SHOP_A } })).toBe(2);
  });

  it("returns 0 when retentionDays is negative", async () => {
    await prisma.visit.create({ data: visit(SHOP_A, { createdAt: daysAgo(999) }) });

    const deleted = await cleanupOldVisits(SHOP_A, -1);
    expect(deleted).toBe(0);
    expect(await prisma.visit.count({ where: { shop: SHOP_A } })).toBe(1);
  });

  it("is shop-scoped — does not delete other shop's data", async () => {
    await prisma.visit.createMany({
      data: [
        visit(SHOP_A, { createdAt: daysAgo(60) }),
        visit(SHOP_B, { createdAt: daysAgo(60) }),
      ],
    });

    await cleanupOldVisits(SHOP_A, 30);

    expect(await prisma.visit.count({ where: { shop: SHOP_A } })).toBe(0);
    expect(await prisma.visit.count({ where: { shop: SHOP_B } })).toBe(1);
  });

  it("returns 0 when no visits are old enough", async () => {
    await prisma.visit.createMany({
      data: [
        visit(SHOP_A, { createdAt: todayNoon() }),
        visit(SHOP_A, { createdAt: daysAgo(5) }),
      ],
    });

    const deleted = await cleanupOldVisits(SHOP_A, 30);
    expect(deleted).toBe(0);
  });
});
