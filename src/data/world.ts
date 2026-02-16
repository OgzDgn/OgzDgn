import { City, Country, Port, RegionalCrisis, TradeRoute } from "../types/world";

export const COUNTRIES: Country[] = [
  { id: "tr", name: "Turkiye", iso2: "TR", region: "Europe/Asia" },
  { id: "de", name: "Germany", iso2: "DE", region: "Europe" },
  { id: "nl", name: "Netherlands", iso2: "NL", region: "Europe" },
  { id: "cn", name: "China", iso2: "CN", region: "Asia" },
  { id: "sg", name: "Singapore", iso2: "SG", region: "Asia" },
  { id: "us", name: "United States", iso2: "US", region: "North America" },
  { id: "br", name: "Brazil", iso2: "BR", region: "South America" },
  { id: "ae", name: "United Arab Emirates", iso2: "AE", region: "Middle East" }
];

export const CITIES: City[] = [
  { id: "istanbul", countryId: "tr", name: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { id: "izmir", countryId: "tr", name: "Izmir", lat: 38.4237, lon: 27.1428 },
  { id: "hamburg", countryId: "de", name: "Hamburg", lat: 53.5511, lon: 9.9937 },
  { id: "rotterdam", countryId: "nl", name: "Rotterdam", lat: 51.9244, lon: 4.4777 },
  { id: "shanghai", countryId: "cn", name: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { id: "singapore", countryId: "sg", name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { id: "los_angeles", countryId: "us", name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { id: "new_york", countryId: "us", name: "New York", lat: 40.7128, lon: -74.006 },
  { id: "santos", countryId: "br", name: "Santos", lat: -23.9608, lon: -46.3336 },
  { id: "dubai", countryId: "ae", name: "Dubai", lat: 25.2048, lon: 55.2708 }
];

export const PORTS: Port[] = [
  { id: "port_istanbul", cityId: "istanbul", name: "Port of Istanbul" },
  { id: "port_izmir", cityId: "izmir", name: "Port of Izmir" },
  { id: "port_hamburg", cityId: "hamburg", name: "Port of Hamburg" },
  { id: "port_rotterdam", cityId: "rotterdam", name: "Port of Rotterdam" },
  { id: "port_shanghai", cityId: "shanghai", name: "Port of Shanghai" },
  { id: "port_singapore", cityId: "singapore", name: "Port of Singapore" },
  { id: "port_los_angeles", cityId: "los_angeles", name: "Port of Los Angeles" },
  { id: "port_new_york", cityId: "new_york", name: "Port of New York and New Jersey" },
  { id: "port_santos", cityId: "santos", name: "Port of Santos" },
  { id: "port_jebel_ali", cityId: "dubai", name: "Jebel Ali Port" }
];

export const TRADE_ROUTES: TradeRoute[] = [
  {
    id: "rotterdam-singapore",
    fromPortId: "port_rotterdam",
    toPortId: "port_singapore",
    distanceKm: 15380,
    baselineRisk: 0.25
  },
  {
    id: "istanbul-rotterdam",
    fromPortId: "port_istanbul",
    toPortId: "port_rotterdam",
    distanceKm: 2600,
    baselineRisk: 0.16
  },
  {
    id: "izmir-dubai",
    fromPortId: "port_izmir",
    toPortId: "port_jebel_ali",
    distanceKm: 3200,
    baselineRisk: 0.2
  },
  {
    id: "shanghai-losangeles",
    fromPortId: "port_shanghai",
    toPortId: "port_los_angeles",
    distanceKm: 10400,
    baselineRisk: 0.21
  },
  {
    id: "santos-rotterdam",
    fromPortId: "port_santos",
    toPortId: "port_rotterdam",
    distanceKm: 9200,
    baselineRisk: 0.23
  },
  {
    id: "shanghai-singapore",
    fromPortId: "port_shanghai",
    toPortId: "port_singapore",
    distanceKm: 3800,
    baselineRisk: 0.14
  },
  {
    id: "hamburg-newyork",
    fromPortId: "port_hamburg",
    toPortId: "port_new_york",
    distanceKm: 6200,
    baselineRisk: 0.19
  }
];

export const REGIONAL_CRISES: RegionalCrisis[] = [
  {
    id: "middle-east-energy-spike",
    title: "Middle East Energy Price Spike",
    category: "energy",
    affectedRegions: ["Middle East", "Europe/Asia", "Europe"],
    startsAt: "2026-02-01T00:00:00.000Z",
    endsAt: "2026-03-10T00:00:00.000Z",
    impactMultiplier: 1.18
  },
  {
    id: "pacific-port-congestion",
    title: "Pacific Port Congestion",
    category: "logistics",
    affectedRegions: ["Asia", "North America"],
    startsAt: "2026-02-12T00:00:00.000Z",
    endsAt: "2026-04-01T00:00:00.000Z",
    impactMultiplier: 1.12
  },
  {
    id: "south-america-drought",
    title: "South America Drought Pressure",
    category: "climate",
    affectedRegions: ["South America"],
    startsAt: "2026-01-20T00:00:00.000Z",
    endsAt: "2026-03-20T00:00:00.000Z",
    impactMultiplier: 1.15
  }
];
