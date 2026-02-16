import { CITIES, COUNTRIES, PORTS, REGIONAL_CRISES, TRADE_ROUTES } from "../data/world";
import { EconomySnapshot, RegionalCrisis } from "../types/world";

function round(value: number): number {
  return Number(value.toFixed(4));
}

export function getEconomySnapshot(referenceDate = new Date()): EconomySnapshot {
  const dayFactor = Math.floor(referenceDate.getTime() / (1000 * 60 * 60 * 24));

  const agricultureMultiplier = 1 + 0.12 * Math.sin(dayFactor * 0.08);
  const miningMultiplier = 1 + 0.1 * Math.sin(dayFactor * 0.11 + 1.5);
  const industryMultiplier = 1 + 0.09 * Math.sin(dayFactor * 0.07 + 2.1);
  const logisticsMultiplier = 1 + 0.08 * Math.sin(dayFactor * 0.09 + 0.7);

  return {
    generatedAt: referenceDate.toISOString(),
    agricultureMultiplier: round(agricultureMultiplier),
    miningMultiplier: round(miningMultiplier),
    industryMultiplier: round(industryMultiplier),
    logisticsMultiplier: round(logisticsMultiplier)
  };
}

export function getActiveCrises(referenceDate = new Date()): RegionalCrisis[] {
  return REGIONAL_CRISES.filter((crisis) => {
    const start = new Date(crisis.startsAt).getTime();
    const end = new Date(crisis.endsAt).getTime();
    const now = referenceDate.getTime();
    return now >= start && now <= end;
  });
}

export function getWorldSnapshot(referenceDate = new Date()): {
  countries: typeof COUNTRIES;
  cities: typeof CITIES;
  ports: typeof PORTS;
  tradeRoutes: typeof TRADE_ROUTES;
  activeCrises: RegionalCrisis[];
  economy: EconomySnapshot;
} {
  return {
    countries: COUNTRIES,
    cities: CITIES,
    ports: PORTS,
    tradeRoutes: TRADE_ROUTES,
    activeCrises: getActiveCrises(referenceDate),
    economy: getEconomySnapshot(referenceDate)
  };
}
