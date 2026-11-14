const UNIT_SUFFIX: Record<string, string> = {
  item: "UnitItem",
  kg: "UnitKg",
  g: "UnitG",
  gram: "UnitG",
  l: "UnitL",
  litre: "UnitL",
  ml: "UnitMl",
  millilitre: "UnitMl",
  pack: "UnitPack",
  box: "UnitBox",
  bottle: "UnitBottle",
  dozen: "UnitDozen",
  tray: "UnitTray",
};

const PARTNER_STATUS_KEYS: Record<string, string> = {
  active: "gpActive",
  in_stock: "gpInStock",
  out_of_stock: "gpOutOfStock",
  low_stock: "gpLowStockStatus",
  draft: "gpDraft",
  pending_approval: "gpPendingApproval",
  inactive: "gpInactive",
};

const ORDER_STATUS_KEYS: Record<string, string> = {
  new: "gpStatusNew",
  accepted: "gpStatusAccepted",
  preparing: "gpStatusPreparing",
  ready: "gpStatusReady",
  packed: "gpStatusPacked",
  picked_up: "gpStatusPickedUp",
  handed_to_driver: "gpStatusHandedToDriver",
  courier_assigned: "gpStatusCourierAssigned",
  out_for_delivery: "gpStatusOutForDelivery",
  delivered: "gpStatusDelivered",
  completed: "gpStatusCompleted",
  cancelled: "gpStatusCancelled",
  refunded: "gpStatusRefunded",
};

const STOCK_REASON_KEYS: Record<string, string> = {
  received: "gpReasonReceived",
  sale: "gpReasonSale",
  manual: "gpReasonManual",
  damaged: "gpReasonDamaged",
  expired: "gpReasonExpired",
  returned: "gpReasonReturned",
  correction: "gpReasonCorrection",
};

export function sellingUnitTranslationKey(
  unit?: string | null,
  scope: "gp" | "grocery" = "grocery",
): string {
  const suffix = UNIT_SUFFIX[(unit || "item").toLowerCase()] ?? "UnitItem";
  return `${scope}${suffix}`;
}

export function partnerStatusTranslationKey(status?: string | null): string {
  return PARTNER_STATUS_KEYS[(status || "").toLowerCase()] ?? "gpActive";
}

export function groceryOrderStatusTranslationKey(status?: string | null): string {
  return ORDER_STATUS_KEYS[(status || "").toLowerCase()] ?? "gpStatusNew";
}

export function stockReasonTranslationKey(reason?: string | null): string {
  return STOCK_REASON_KEYS[(reason || "").toLowerCase()] ?? "gpReasonManual";
}

const PAYMENT_STATUS_KEYS: Record<string, string> = {
  unpaid: "gpPaymentUnpaid",
  paid: "gpPaymentPaid",
};

const DISCOUNT_TYPE_KEYS: Record<string, string> = {
  percent: "gpDiscountPercent",
  percentage: "gpDiscountPercent",
  fixed: "gpDiscountFixed",
  bogo: "gpDiscountBogo",
  multi: "gpDiscountMulti",
  multibuy: "gpDiscountMulti",
  weekly: "gpDiscountWeekly",
};

const CATEGORY_KEYS: Record<string, string> = {
  "fresh-produce": "gpCatFreshProduce",
  "dairy-eggs": "gpCatDairyEggs",
  "meat-seafood": "gpCatMeatSeafood",
  pantry: "gpCatPantry",
  beverages: "gpCatBeverages",
  household: "gpCatHousehold",
  "personal-care": "gpCatPersonalCare",
  baby: "gpCatBaby",
};

const SUBCATEGORY_KEYS: Record<string, string> = {
  fruits: "gpSubFruits",
  vegetables: "gpSubVegetables",
  herbs: "gpSubHerbs",
  milk: "gpSubMilk",
  cheese: "gpSubCheese",
  yoghurt: "gpSubYoghurt",
  yogurt: "gpSubYoghurt",
  eggs: "gpSubEggs",
  chicken: "gpSubChicken",
  beef: "gpSubBeef",
  pork: "gpSubPork",
  fish: "gpSubFish",
  seafood: "gpSubSeafood",
  "rice & grains": "gpSubRiceGrains",
  oils: "gpSubOils",
  bread: "gpSubBread",
  canned: "gpSubCanned",
  "soft drinks": "gpSubSoftDrinks",
  juice: "gpSubJuice",
  water: "gpSubWater",
  "tea & coffee": "gpSubTeaCoffee",
  cleaning: "gpSubCleaning",
  paper: "gpSubPaper",
  laundry: "gpSubLaundry",
  hair: "gpSubHair",
  body: "gpSubBody",
  oral: "gpSubOral",
  nappies: "gpSubNappies",
  wipes: "gpSubWipes",
  "baby food": "gpSubBabyFood",
};

export function groceryPaymentStatusTranslationKey(status?: string | null): string {
  return PAYMENT_STATUS_KEYS[(status || "").toLowerCase()] ?? "gpPayment";
}

export function groceryDiscountTypeTranslationKey(kind?: string | null): string {
  return DISCOUNT_TYPE_KEYS[(kind || "").toLowerCase()] ?? "gpPromotions";
}

export function groceryCategoryTranslationKey(slug?: string | null): string {
  return CATEGORY_KEYS[(slug || "").toLowerCase()] ?? "gpCategory";
}

export function grocerySubcategoryTranslationKey(name?: string | null): string {
  return SUBCATEGORY_KEYS[(name || "").trim().toLowerCase()] ?? "gpSubcategory";
}

type Translate = (key: string, fallback?: string) => string;

/** Translated category name, or the API name when there is no translation for it. */
export function groceryCategoryLabel(t: Translate, slug: string | null | undefined, name: string): string {
  const key = CATEGORY_KEYS[(slug || "").toLowerCase()];
  return key ? t(key, name) : name;
}

export function grocerySubcategoryLabel(t: Translate, name: string): string {
  const key = SUBCATEGORY_KEYS[name.trim().toLowerCase()];
  return key ? t(key, name) : name;
}
