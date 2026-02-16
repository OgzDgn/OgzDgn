export interface Country {
  id: string;
  name: string;
  iso2: string;
  region: string;
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  lat: number;
  lon: number;
}

export interface Port {
  id: string;
  cityId: string;
  name: string;
}

export interface TradeRoute {
  id: string;
  fromPortId: string;
  toPortId: string;
  distanceKm: number;
  baselineRisk: number;
}

export type CrisisCategory = "political" | "climate" | "energy" | "logistics";

export interface RegionalCrisis {
  id: string;
  title: string;
  category: CrisisCategory;
  affectedRegions: string[];
  startsAt: string;
  endsAt: string;
  impactMultiplier: number;
}

export interface EconomySnapshot {
  generatedAt: string;
  agricultureMultiplier: number;
  miningMultiplier: number;
  industryMultiplier: number;
  logisticsMultiplier: number;
}
