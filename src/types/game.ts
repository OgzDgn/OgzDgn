export type FacilityType = "farm" | "livestock" | "mine" | "factory";

export type ProductCategory = "agriculture" | "livestock" | "mining" | "industry";

export type ProductId =
  | "wheat"
  | "cotton"
  | "milk"
  | "beef"
  | "iron_ore"
  | "coal"
  | "flour"
  | "steel"
  | "textile";

export interface ProductRecipe {
  id: ProductId;
  displayName: string;
  category: ProductCategory;
  allowedIn: FacilityType[];
  basePrice: number;
  outputPerCycle: number;
  baseDurationSec: number;
  inputs: Partial<Record<ProductId, number>>;
}

export interface Facility {
  id: string;
  type: FacilityType;
  cityId: string;
  level: number;
  createdAt: string;
}

export type Inventory = Partial<Record<ProductId, number>>;

export interface PlayerState {
  userId: string;
  balance: number;
  inventory: Inventory;
  facilities: Facility[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketSale {
  id: string;
  userId: string;
  productId: ProductId;
  quantity: number;
  unitPrice: number;
  grossRevenue: number;
  netRevenue: number;
  taxRate: number;
  createdAt: string;
}

export interface Auction {
  id: string;
  sellerUserId: string;
  productId: ProductId;
  quantity: number;
  minBid: number;
  highestBid: number;
  highestBidderUserId: string | null;
  endsAt: string;
  settledAt: string | null;
  createdAt: string;
}

export const PRODUCT_CATALOG: Record<ProductId, ProductRecipe> = {
  wheat: {
    id: "wheat",
    displayName: "Wheat",
    category: "agriculture",
    allowedIn: ["farm"],
    basePrice: 12,
    outputPerCycle: 10,
    baseDurationSec: 60,
    inputs: {}
  },
  cotton: {
    id: "cotton",
    displayName: "Cotton",
    category: "agriculture",
    allowedIn: ["farm"],
    basePrice: 15,
    outputPerCycle: 8,
    baseDurationSec: 70,
    inputs: {}
  },
  milk: {
    id: "milk",
    displayName: "Milk",
    category: "livestock",
    allowedIn: ["livestock"],
    basePrice: 16,
    outputPerCycle: 8,
    baseDurationSec: 65,
    inputs: {}
  },
  beef: {
    id: "beef",
    displayName: "Beef",
    category: "livestock",
    allowedIn: ["livestock"],
    basePrice: 25,
    outputPerCycle: 5,
    baseDurationSec: 90,
    inputs: {}
  },
  iron_ore: {
    id: "iron_ore",
    displayName: "Iron Ore",
    category: "mining",
    allowedIn: ["mine"],
    basePrice: 22,
    outputPerCycle: 7,
    baseDurationSec: 80,
    inputs: {}
  },
  coal: {
    id: "coal",
    displayName: "Coal",
    category: "mining",
    allowedIn: ["mine"],
    basePrice: 18,
    outputPerCycle: 8,
    baseDurationSec: 75,
    inputs: {}
  },
  flour: {
    id: "flour",
    displayName: "Flour",
    category: "industry",
    allowedIn: ["factory"],
    basePrice: 30,
    outputPerCycle: 8,
    baseDurationSec: 95,
    inputs: {
      wheat: 12
    }
  },
  steel: {
    id: "steel",
    displayName: "Steel",
    category: "industry",
    allowedIn: ["factory"],
    basePrice: 42,
    outputPerCycle: 6,
    baseDurationSec: 120,
    inputs: {
      iron_ore: 10,
      coal: 6
    }
  },
  textile: {
    id: "textile",
    displayName: "Textile",
    category: "industry",
    allowedIn: ["factory"],
    basePrice: 37,
    outputPerCycle: 7,
    baseDurationSec: 110,
    inputs: {
      cotton: 10
    }
  }
};

export const FACILITY_BUILD_COST: Record<FacilityType, number> = {
  farm: 2500,
  livestock: 3200,
  mine: 4200,
  factory: 6000
};
