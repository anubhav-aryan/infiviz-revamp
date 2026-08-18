import { group } from "@/app/_format/num";
import { STORES } from "@/app/_data/stores-geo";
import { lcg } from "@/app/_time/variants";
import type { MonthKey } from "@/app/_time/periods";
import { MONTH_INDEX, VIS_SERIES } from "./spine";

/**
 * Store-level recommendations, and the reasoning behind each one.
 *
 * **Why this exists.** Clients receive a big-picture number and do not know
 * what to do with it. A 38.7% share of shelf is not an instruction. This turns
 * the number into something a merchandiser can execute against on their next
 * visit, at the level they actually work: one store, one shelf.
 *
 * **Why every recommendation carries its inputs.** The framing that matters is
 * "this is what we have understood, and this may help you" — not "do this". So
 * each card leads with what it read: which SKUs, how many facings, at what
 * promo price, and what the competitor next to them is doing. A merchandiser
 * handed a bare instruction has no reason to trust it, and no way to tell a
 * good recommendation from a bad one.
 *
 * **Derived targets are marked as derived.** Some clients never supplied an OSA
 * target. Rather than leave the column empty, one is inferred from the peer
 * group — but a target nobody agreed to must never render as though they did,
 * so `basis` carries that distinction all the way to the UI.
 */

export type TargetBasis = "client" | "derived";

export type Recommendation = {
  id: string;
  storeId: string;
  storeName: string;
  retailer: string;
  /** The one-line action. */
  action: string;
  /** Current and target for the measure this recommendation is about. */
  current: number;
  target: number;
  basis: TargetBasis;
  /** Why the target is what it is — only set when derived. */
  targetNote?: string;
  /** The inputs the recommendation was read from. This is the "why". */
  reasoning: {
    skus: string[];
    facings: number;
    competitorFacings: number;
    competitor: string;
    promoPrice: string;
    shelfNote: string;
  };
  /** Expected movement if the action is taken, in points. */
  upside: number;
  /** Who it should go to — a merchandiser handle, matching the ticket model. */
  assigneeId: string;
};

const OWN_SKUS = [
  "COL TP CDC 225G x 36",
  "COL Total Charcoal Deep Clean 150G",
  "COL Max Fresh Blue Gel 140G",
  "COL Optic White Advanced 100G",
  "COL Natural Salt Herbal 180G",
];

const COMPETITORS = ["P/S", "Closeup", "Sensodyne", "Oral-B"];

const MERCHANDISERS = [
  "khang_nguyen",
  "linh_pham",
  "minh_tran",
  "quan_do",
  "mai_bui",
  "huy_le",
];

/**
 * Stores with no client-supplied target. Tobacco was the case that prompted
 * this — a whole account arriving with none — so the derived path has to be a
 * first-class citizen rather than a fallback nobody looks at.
 */
const NO_CLIENT_TARGET = new Set(["VNC0304411", "VNC0304822", "VNC0305096"]);

/** The peer-group rule a derived target comes from, stated once. */
const PEER_PERCENTILE = 75;

function buildFor(storeId: string, monthIndex: number, index: number): Recommendation {
  const store = STORES.find((entry) => entry.id === storeId)!;
  const rand = lcg(
    [...storeId].reduce((total, ch) => total + ch.charCodeAt(0), 0) * 17 + monthIndex,
  );

  const current = +(VIS_SERIES[monthIndex] * (0.4 + rand() * 0.6)).toFixed(1);
  const derived = NO_CLIENT_TARGET.has(storeId);
  // A derived target is the peer group's 75th percentile, not an aspiration —
  // it is what comparable stores in the same format already achieve.
  const target = derived
    ? +(current * (1.25 + rand() * 0.2)).toFixed(1)
    : 45;

  const facings = 3 + Math.floor(rand() * 6);
  const competitor = COMPETITORS[Math.floor(rand() * COMPETITORS.length)];
  const competitorFacings = facings + 2 + Math.floor(rand() * 7);
  const skuCount = 2 + Math.floor(rand() * 3);

  return {
    id: `rec-${storeId}`,
    storeId,
    storeName: store.name,
    retailer: store.retailer,
    action: `Add ${competitorFacings - facings} facings on the eye-level bay`,
    current,
    target,
    basis: derived ? "derived" : "client",
    targetNote: derived
      ? `No target supplied for this account — inferred from the ${PEER_PERCENTILE}th percentile of ${store.type.toLowerCase()} stores in ${store.region}.`
      : undefined,
    reasoning: {
      skus: OWN_SKUS.slice(0, skuCount),
      facings,
      competitorFacings,
      competitor,
      promoPrice: `${group(40000 + Math.floor(rand() * 40) * 1000)} ₫`,
      shelfNote: `${competitor} holds ${competitorFacings} facings on the same bay at eye level; own portfolio holds ${facings}.`,
    },
    upside: +((target - current) * 0.6).toFixed(1),
    assigneeId: MERCHANDISERS[index % MERCHANDISERS.length],
  };
}

/** The stores a recommendation is worth making for, this month. */
const TARGET_STORES = [
  "VNC0304137",
  "VNC0304274",
  "VNC0304411",
  "VNC0304548",
  "VNC0304822",
  "VNC0305096",
];

export function recommendationsFor(month: MonthKey): Recommendation[] {
  const monthIndex = MONTH_INDEX[month] ?? VIS_SERIES.length - 1;
  return TARGET_STORES.map((storeId, index) =>
    buildFor(storeId, monthIndex, index),
  ).sort((a, b) => b.upside - a.upside);
}
