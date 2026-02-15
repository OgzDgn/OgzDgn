import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

type TabKey = 'Harita' | 'Operasyon' | 'Kooperatif' | 'Finans' | 'Kriz';
type TransportMode = 'Kara' | 'Deniz' | 'Hava';
type GameMode = 'Kuresel Lig' | 'Bolgesel Sunucular' | 'Hardcore Ekonomi' | 'Kriz Sezonu';
type CrisisKey =
  | 'Dengeli Piyasa'
  | 'Savas'
  | 'Petrol Krizi'
  | 'Pandemi'
  | 'Liman Grevi'
  | 'Sinir Krizi';

interface City {
  name: string;
  country: string;
  region: string;
  port: string;
  taxRate: number;
  risk: number;
  demand: number;
  politics: string;
}

interface TradeRoute {
  id: string;
  from: string;
  to: string;
  lane: string;
  mode: TransportMode;
  distanceKm: number;
  baseRisk: number;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  risk: number;
  illegal: boolean;
  demandTag: string;
}

interface CrisisProfile {
  key: CrisisKey;
  description: string;
  fuelDelta: number;
  inflationDelta: number;
  fxDelta: number;
  borderTaxDelta: number;
  modeRisk: Record<TransportMode, number>;
  demandBoost: Record<TransportMode, number>;
}

interface EconomyState {
  week: number;
  cash: number;
  debt: number;
  inflation: number;
  fx: number;
  fuelIndex: number;
  insuranceIndex: number;
  storageCost: number;
  payrollCost: number;
  maintenanceCost: number;
  investorPressure: number;
  shipments: number;
  failedShipments: number;
}

interface OperationResult {
  summary: string;
  netProfit: number;
  grossRevenue: number;
  totalCost: number;
  risk: number;
  incident: boolean;
}

interface LeaderboardRow {
  company: string;
  score: number;
}

const tabs: TabKey[] = ['Harita', 'Operasyon', 'Kooperatif', 'Finans', 'Kriz'];
const gameModes: GameMode[] = [
  'Kuresel Lig',
  'Bolgesel Sunucular',
  'Hardcore Ekonomi',
  'Kriz Sezonu',
];

const cities: City[] = [
  {
    name: 'New York',
    country: 'USA',
    region: 'Kuzey Amerika',
    port: 'Port of New York and New Jersey',
    taxRate: 0.18,
    risk: 0.17,
    demand: 1.3,
    politics: 'Istikrarli',
  },
  {
    name: 'Shanghai',
    country: 'China',
    region: 'Asya',
    port: 'Port of Shanghai',
    taxRate: 0.16,
    risk: 0.14,
    demand: 1.36,
    politics: 'Sik regule',
  },
  {
    name: 'Istanbul',
    country: 'Turkiye',
    region: 'Avrupa-Asya',
    port: 'Port of Ambarli',
    taxRate: 0.22,
    risk: 0.23,
    demand: 1.22,
    politics: 'Degisken',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    region: 'Orta Dogu',
    port: 'Port of Jebel Ali',
    taxRate: 0.13,
    risk: 0.19,
    demand: 1.2,
    politics: 'Lojistik odakli',
  },
  {
    name: 'Hamburg',
    country: 'Germany',
    region: 'Avrupa',
    port: 'Port of Hamburg',
    taxRate: 0.19,
    risk: 0.12,
    demand: 1.19,
    politics: 'Istikrarli',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asya',
    port: 'Port of Tokyo',
    taxRate: 0.17,
    risk: 0.13,
    demand: 1.28,
    politics: 'Teknoloji merkezli',
  },
];

const routes: TradeRoute[] = [
  {
    id: 'land-istanbul-hamburg',
    from: 'Istanbul',
    to: 'Hamburg',
    lane: 'E80 - Avrupa Koridoru',
    mode: 'Kara',
    distanceKm: 2200,
    baseRisk: 0.16,
  },
  {
    id: 'land-dubai-istanbul',
    from: 'Dubai',
    to: 'Istanbul',
    lane: 'Orta Dogu - Anadolu Hatti',
    mode: 'Kara',
    distanceKm: 3100,
    baseRisk: 0.22,
  },
  {
    id: 'land-shanghai-hamburg',
    from: 'Shanghai',
    to: 'Hamburg',
    lane: 'Yeni Ipek Yolu Demiryolu',
    mode: 'Kara',
    distanceKm: 9600,
    baseRisk: 0.29,
  },
  {
    id: 'sea-shanghai-dubai',
    from: 'Shanghai',
    to: 'Dubai',
    lane: 'Hint Okyanusu Konteyner Rotasi',
    mode: 'Deniz',
    distanceKm: 6500,
    baseRisk: 0.24,
  },
  {
    id: 'sea-newyork-hamburg',
    from: 'New York',
    to: 'Hamburg',
    lane: 'Kuzey Atlantik Ticaret Rotasi',
    mode: 'Deniz',
    distanceKm: 6200,
    baseRisk: 0.2,
  },
  {
    id: 'sea-dubai-tokyo',
    from: 'Dubai',
    to: 'Tokyo',
    lane: 'Asya Enerji Sevkiyat Hatti',
    mode: 'Deniz',
    distanceKm: 8700,
    baseRisk: 0.27,
  },
  {
    id: 'air-tokyo-newyork',
    from: 'Tokyo',
    to: 'New York',
    lane: 'Trans-Pasifik Hava Koridoru',
    mode: 'Hava',
    distanceKm: 10800,
    baseRisk: 0.21,
  },
  {
    id: 'air-dubai-hamburg',
    from: 'Dubai',
    to: 'Hamburg',
    lane: 'MEA-EU Express',
    mode: 'Hava',
    distanceKm: 4850,
    baseRisk: 0.18,
  },
  {
    id: 'air-istanbul-shanghai',
    from: 'Istanbul',
    to: 'Shanghai',
    lane: 'Eurasia Cargo Bridge',
    mode: 'Hava',
    distanceKm: 8000,
    baseRisk: 0.24,
  },
];

const products: Product[] = [
  { id: 'petrol', name: 'Petrol', basePrice: 56000, risk: 0.2, illegal: false, demandTag: 'Enerji' },
  { id: 'electronics', name: 'Elektronik', basePrice: 39000, risk: 0.14, illegal: false, demandTag: 'Yuksek talep' },
  { id: 'lux-cars', name: 'Luks Arac', basePrice: 74000, risk: 0.22, illegal: false, demandTag: 'Premium' },
  { id: 'grain', name: 'Tahil', basePrice: 22000, risk: 0.09, illegal: false, demandTag: 'Temel gida' },
  { id: 'arms', name: 'Silah (ozel mod)', basePrice: 91000, risk: 0.36, illegal: true, demandTag: 'Yuksek risk' },
  { id: 'medical', name: 'Tibbi Malzeme', basePrice: 47000, risk: 0.11, illegal: false, demandTag: 'Kritik' },
  { id: 'rare-minerals', name: 'Nadir Maden', basePrice: 68000, risk: 0.27, illegal: false, demandTag: 'Endustri' },
];

const modeVehicles: Record<TransportMode, string[]> = {
  Kara: ['Tir', 'Tren', 'Soguk Zincir Araci', 'Petrol Tankeri'],
  Deniz: ['Konteyner Gemisi', 'Petrol Tankeri', 'LNG Gemisi', 'Askeri Eskortlu Gemi'],
  Hava: ['Kargo Ucagi', 'Hizli Teslimat Jeti', 'Degerli Esya Ucagi'],
};

const modeRisks: Record<TransportMode, string[]> = {
  Kara: ['Sinir vergileri', 'Yol kapanmalari', 'Siyasi krizler', 'Yakit fiyat artisi'],
  Deniz: ['Korsan saldirilari', 'Firtinalar', 'Liman grevleri', 'Deniz sigortasi'],
  Hava: ['Hava sahasi yasaklari', 'Yakit krizi', 'Bakim masraflari', 'Savas bolgeleri'],
};

const modeEconomy = {
  Kara: { fuelCoef: 12, laborCoef: 1.1, maintenanceCoef: 1.0, baseRisk: 0.14 },
  Deniz: { fuelCoef: 9, laborCoef: 1.3, maintenanceCoef: 1.4, baseRisk: 0.18 },
  Hava: { fuelCoef: 16, laborCoef: 1.7, maintenanceCoef: 1.9, baseRisk: 0.16 },
} as const;

const crisisCatalog: CrisisProfile[] = [
  {
    key: 'Dengeli Piyasa',
    description: 'Talep dengeli, lojistik zincirinde buyuk bir kirilim yok.',
    fuelDelta: 0,
    inflationDelta: 0,
    fxDelta: 0,
    borderTaxDelta: 0,
    modeRisk: { Kara: 0, Deniz: 0, Hava: 0 },
    demandBoost: { Kara: 1, Deniz: 1, Hava: 1 },
  },
  {
    key: 'Savas',
    description: 'Sicak catisma deniz rotalarini riskli hale getiriyor.',
    fuelDelta: 0.06,
    inflationDelta: 0.012,
    fxDelta: 0.09,
    borderTaxDelta: 0.03,
    modeRisk: { Kara: 0.06, Deniz: 0.14, Hava: 0.08 },
    demandBoost: { Kara: 1.04, Deniz: 0.88, Hava: 0.9 },
  },
  {
    key: 'Petrol Krizi',
    description: 'Ham petrol yukseliyor, kara ve hava tasimasi pahalaniyor.',
    fuelDelta: 0.16,
    inflationDelta: 0.018,
    fxDelta: 0.05,
    borderTaxDelta: 0.01,
    modeRisk: { Kara: 0.04, Deniz: 0.03, Hava: 0.08 },
    demandBoost: { Kara: 0.95, Deniz: 1.02, Hava: 0.9 },
  },
  {
    key: 'Pandemi',
    description: 'Hava tasimasi dusuyor, tibbi urun talebi artiyor.',
    fuelDelta: -0.03,
    inflationDelta: 0.02,
    fxDelta: 0.02,
    borderTaxDelta: 0.02,
    modeRisk: { Kara: 0.07, Deniz: 0.05, Hava: 0.12 },
    demandBoost: { Kara: 1.05, Deniz: 1.03, Hava: 0.72 },
  },
  {
    key: 'Liman Grevi',
    description: 'Kritik limanlarin kapasitesi dusuyor, deniz teslimatlari yavasliyor.',
    fuelDelta: 0.04,
    inflationDelta: 0.01,
    fxDelta: 0.03,
    borderTaxDelta: 0,
    modeRisk: { Kara: 0.02, Deniz: 0.15, Hava: 0.04 },
    demandBoost: { Kara: 1.06, Deniz: 0.84, Hava: 1.01 },
  },
  {
    key: 'Sinir Krizi',
    description: 'Sinir gecisleri zorlasiyor, kara tarifeleri artiyor.',
    fuelDelta: 0.08,
    inflationDelta: 0.014,
    fxDelta: 0.04,
    borderTaxDelta: 0.05,
    modeRisk: { Kara: 0.16, Deniz: 0.02, Hava: 0.05 },
    demandBoost: { Kara: 0.86, Deniz: 1.03, Hava: 1 },
  },
];

const coopMembers = [
  { name: 'Dragon Freight', specialty: 'Cin cikis operasyonu', share: 0.28 },
  { name: 'Anatolia Hub', specialty: 'Istanbul transfer merkezi', share: 0.24 },
  { name: 'Baltic Road', specialty: 'Avrupa kara dagitimi', share: 0.21 },
  { name: 'Gulf Shield', specialty: 'Korsan savunma ve eskort', share: 0.17 },
  { name: 'North Star Air', specialty: 'Hizli hava teslimati', share: 0.1 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

const toMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const toPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('Harita');
  const [selectedMode, setSelectedMode] = useState<TransportMode>('Deniz');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('sea-shanghai-dubai');
  const [selectedProductId, setSelectedProductId] = useState<string>('electronics');
  const [gameMode, setGameMode] = useState<GameMode>('Hardcore Ekonomi');
  const [activeCrisis, setActiveCrisis] = useState<CrisisProfile>(crisisCatalog[0]);
  const [insured, setInsured] = useState<boolean>(true);
  const [escorted, setEscorted] = useState<boolean>(false);
  const [taxEvasion, setTaxEvasion] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<OperationResult | null>(null);
  const [coopFund, setCoopFund] = useState<number>(180000);
  const [fleet, setFleet] = useState<Record<TransportMode, number>>({
    Kara: 12,
    Deniz: 7,
    Hava: 4,
  });
  const [economy, setEconomy] = useState<EconomyState>({
    week: 1,
    cash: 1250000,
    debt: 420000,
    inflation: 0.09,
    fx: 1.04,
    fuelIndex: 1,
    insuranceIndex: 1,
    storageCost: 9000,
    payrollCost: 12500,
    maintenanceCost: 10000,
    investorPressure: 0.44,
    shipments: 0,
    failedShipments: 0,
  });
  const [eventFeed, setEventFeed] = useState<string[]>([
    'Hafta 1: Kuresel pazar acildi. Ilk ihaleler yayinlandi.',
  ]);

  const routesByMode = useMemo(
    () => routes.filter((route) => route.mode === selectedMode),
    [selectedMode],
  );

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routesByMode[0],
    [selectedRouteId, routesByMode],
  );

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];

  const playerScore =
    economy.cash - economy.debt * 0.52 + economy.shipments * 28000 - economy.investorPressure * 170000;

  const leaderboard = useMemo(() => {
    const rows: LeaderboardRow[] = [
      { company: 'Nexus Maritime', score: 1640000 },
      { company: 'Aurora Freight', score: 1520000 },
      { company: 'Helios Global', score: 1450000 },
      { company: 'Senin Kooperatifin', score: Math.round(playerScore) },
      { company: 'Blue Dune Cargo', score: 1330000 },
    ];
    return rows.sort((a, b) => b.score - a.score);
  }, [playerScore]);

  const playerRank =
    leaderboard.findIndex((row) => row.company === 'Senin Kooperatifin') + 1;

  const tenderProgress = clamp(
    economy.shipments * 7 - economy.failedShipments * 5 + coopFund / 65000,
    0,
    100,
  );

  const setModeWithFallbackRoute = (mode: TransportMode) => {
    setSelectedMode(mode);
    const firstRoute = routes.find((route) => route.mode === mode);
    if (firstRoute) {
      setSelectedRouteId(firstRoute.id);
    }
  };

  const addFeedEntry = (entry: string) => {
    setEventFeed((prev) => [entry, ...prev].slice(0, 12));
  };

  const applyMacroShift = (state: EconomyState, includeCrisisImpact: boolean): EconomyState => {
    const crisisInflation = includeCrisisImpact ? activeCrisis.inflationDelta : 0;
    const crisisFx = includeCrisisImpact ? activeCrisis.fxDelta : 0;
    const crisisFuel = includeCrisisImpact ? activeCrisis.fuelDelta : 0;

    const inflation = clamp(state.inflation + randomInRange(-0.006, 0.009) + crisisInflation, 0.02, 0.48);
    const fx = clamp(state.fx + randomInRange(-0.08, 0.11) + crisisFx, 0.6, 3.7);
    const fuelIndex = clamp(state.fuelIndex + randomInRange(-0.05, 0.08) + crisisFuel, 0.62, 2.8);
    const insuranceIndex = clamp(state.insuranceIndex + randomInRange(-0.04, 0.06), 0.72, 2.7);

    return {
      ...state,
      week: state.week + 1,
      inflation,
      fx,
      fuelIndex,
      insuranceIndex,
      storageCost: clamp(state.storageCost * (1 + inflation * 0.02), 4500, 26000),
      payrollCost: clamp(state.payrollCost * (1 + inflation * 0.018), 7000, 32000),
      maintenanceCost: clamp(state.maintenanceCost * (1 + inflation * 0.016), 6500, 36000),
    };
  };

  const runShipment = () => {
    if (!selectedRoute) {
      return;
    }

    const fromCity = cities.find((city) => city.name === selectedRoute.from);
    const toCity = cities.find((city) => city.name === selectedRoute.to);

    if (!fromCity || !toCity) {
      return;
    }

    const modeEconomyConfig = modeEconomy[selectedMode];
    const routeScale = selectedRoute.distanceKm / 1000;
    const demandFactor = (fromCity.demand + toCity.demand) / 2;
    const crisisDemand = activeCrisis.demandBoost[selectedMode];
    const illegalBonus = selectedProduct.illegal ? 1.42 : 1;
    const productBias = selectedProduct.name === 'Tibbi Malzeme' && activeCrisis.key === 'Pandemi' ? 1.22 : 1;

    const grossRevenue =
      selectedProduct.basePrice * routeScale * demandFactor * crisisDemand * illegalBonus * productBias * economy.fx;

    const distanceUnit = selectedRoute.distanceKm / 100;
    const fuelCost =
      distanceUnit *
      modeEconomyConfig.fuelCoef *
      economy.fuelIndex *
      (1 + activeCrisis.fuelDelta);
    const payrollCost = economy.payrollCost * modeEconomyConfig.laborCoef;
    const maintenanceCost = economy.maintenanceCost * modeEconomyConfig.maintenanceCoef;
    const storageCost = economy.storageCost * (selectedProduct.illegal ? 1.3 : 1);
    const tariffRate =
      (fromCity.taxRate + toCity.taxRate) / 2 +
      activeCrisis.borderTaxDelta +
      (selectedMode === 'Kara' ? 0.02 : 0);
    const tariffCost = grossRevenue * tariffRate;
    const insuranceCost = insured ? grossRevenue * 0.06 * economy.insuranceIndex : 0;
    const escortCost = escorted && selectedMode === 'Deniz' ? grossRevenue * 0.05 : 0;
    const interestCost = economy.debt * 0.012;

    const totalCost =
      fuelCost +
      payrollCost +
      maintenanceCost +
      storageCost +
      tariffCost +
      insuranceCost +
      escortCost +
      interestCost;

    let risk =
      selectedRoute.baseRisk +
      selectedProduct.risk +
      modeEconomyConfig.baseRisk +
      (fromCity.risk + toCity.risk) / 2 +
      activeCrisis.modeRisk[selectedMode];

    if (insured) risk -= 0.05;
    if (escorted && selectedMode === 'Deniz') risk -= 0.09;
    if (taxEvasion) risk += 0.08;

    risk = clamp(risk, 0.05, 0.93);

    const incident = Math.random() < risk;
    let netProfit = grossRevenue - totalCost;
    let summary = 'Sevkiyat basarili, gelir hedefi tutturuldu.';

    if (incident) {
      const operationLoss = grossRevenue * (selectedProduct.illegal ? 0.82 : 0.56);
      const insurancePayout = insured ? grossRevenue * 0.22 : 0;
      const taxFine = taxEvasion ? grossRevenue * 0.14 + 18000 : 0;

      netProfit = netProfit - operationLoss + insurancePayout - taxFine;
      summary = taxFine > 0 ? 'Vergi kacirma cezasi geldi, operasyon zarar yazdi.' : 'Risk gerceklesti, operasyon hasar aldi.';
    }

    const coopShare = netProfit > 0 ? netProfit * 0.12 : 0;
    const playerNet = netProfit - coopShare;
    const nextCoopFund = coopFund + coopShare + (escorted && selectedMode === 'Deniz' ? 2200 : 0);
    setCoopFund(nextCoopFund);

    const nextInvestorPressure = clamp(
      economy.investorPressure +
        (playerNet < 0 ? 0.06 : -0.035) +
        economy.debt / Math.max(1, economy.cash + 550000) * 0.02,
      0.08,
      0.99,
    );

    const baseEconomyAfterTrade: EconomyState = {
      ...economy,
      cash: economy.cash + playerNet,
      investorPressure: nextInvestorPressure,
      shipments: economy.shipments + 1,
      failedShipments: economy.failedShipments + (incident ? 1 : 0),
    };

    const nextEconomy = applyMacroShift(baseEconomyAfterTrade, true);
    setEconomy(nextEconomy);

    setLastResult({
      summary,
      netProfit: playerNet,
      grossRevenue,
      totalCost,
      risk,
      incident,
    });

    const incidentText = incident ? 'Risk olayi gerceklesti.' : 'Teslimat sorunsuz tamamladi.';
    addFeedEntry(
      `Hafta ${nextEconomy.week}: ${selectedRoute.from} -> ${selectedRoute.to} (${selectedMode}) | ${selectedProduct.name} | Net ${toMoney(
        playerNet,
      )}. ${incidentText}`,
    );
  };

  const buyFleetUnit = () => {
    const unitCost = selectedMode === 'Hava' ? 180000 : selectedMode === 'Deniz' ? 140000 : 90000;
    if (economy.cash < unitCost) {
      addFeedEntry(`Hafta ${economy.week}: Yetersiz bakiye, ${selectedMode} filosu buyutulemedi.`);
      return;
    }

    setFleet((prev) => ({ ...prev, [selectedMode]: prev[selectedMode] + 1 }));
    setEconomy((prev) => ({ ...prev, cash: prev.cash - unitCost }));
    addFeedEntry(
      `Hafta ${economy.week}: ${selectedMode} filosuna 1 yeni arac eklendi. Maliyet ${toMoney(unitCost)}.`,
    );
  };

  const takeLoan = () => {
    const amount = 250000;
    setEconomy((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      debt: prev.debt + amount,
      investorPressure: clamp(prev.investorPressure + 0.07, 0.08, 0.99),
    }));
    addFeedEntry(`Hafta ${economy.week}: Bankadan ${toMoney(amount)} kredi alindi.`);
  };

  const payDebt = () => {
    if (economy.debt <= 0 || economy.cash < 120000) {
      addFeedEntry(`Hafta ${economy.week}: Borc odemesi icin kosullar uygun degil.`);
      return;
    }

    const amount = Math.min(100000, economy.debt, economy.cash * 0.5);
    setEconomy((prev) => ({
      ...prev,
      cash: prev.cash - amount,
      debt: prev.debt - amount,
      investorPressure: clamp(prev.investorPressure - 0.05, 0.08, 0.99),
    }));
    addFeedEntry(`Hafta ${economy.week}: ${toMoney(amount)} borc geri odendi.`);
  };

  const transferToDefenseFund = () => {
    const amount = 20000;
    if (economy.cash < amount) {
      addFeedEntry(`Hafta ${economy.week}: Savunma fonuna aktarim yapilamadi.`);
      return;
    }

    setEconomy((prev) => ({ ...prev, cash: prev.cash - amount }));
    setCoopFund((prev) => prev + amount);
    addFeedEntry(`Hafta ${economy.week}: Kooperatif savunma fonuna ${toMoney(amount)} aktarildi.`);
  };

  const nextWeek = () => {
    setEconomy((prev) => {
      const updated = applyMacroShift(prev, true);
      addFeedEntry(
        `Hafta ${updated.week}: Piyasa dongusu bitti. Enflasyon ${toPercent(updated.inflation)}, kur ${updated.fx.toFixed(2)}.`,
      );
      return updated;
    });
  };

  const selectCrisis = (crisis: CrisisProfile) => {
    setActiveCrisis(crisis);
    addFeedEntry(`Hafta ${economy.week}: Aktif sezon krizi -> ${crisis.key}.`);
  };

  const randomCrisis = () => {
    const randomIndex = Math.floor(Math.random() * crisisCatalog.length);
    selectCrisis(crisisCatalog[randomIndex]);
  };

  const portCapacityScore = clamp(100 - activeCrisis.modeRisk.Deniz * 210 - economy.shipments * 0.6, 35, 100);
  const monopolyRisk = clamp(economy.investorPressure * 0.65 + economy.shipments / 120, 0.1, 0.95);
  const sharePrice = clamp(
    32 +
      economy.shipments * 1.8 +
      economy.cash / 220000 -
      economy.investorPressure * 22 -
      economy.failedShipments * 2,
    8,
    240,
  );

  const renderMapTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gercek sehirler ve limanlar</Text>
        {cities.map((city) => (
          <View key={city.name} style={styles.rowCard}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>
                {city.name} - {city.country}
              </Text>
              <Text style={styles.rowMeta}>{city.region}</Text>
              <Text style={styles.rowMeta}>{city.port}</Text>
              <Text style={styles.rowMeta}>Politik durum: {city.politics}</Text>
            </View>
            <View style={styles.metricBadgeColumn}>
              <Text style={styles.badgeText}>Vergi {toPercent(city.taxRate)}</Text>
              <Text style={styles.badgeText}>Risk {toPercent(city.risk)}</Text>
              <Text style={styles.badgeText}>Talep x{city.demand.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gercek ticaret yollari</Text>
        <Text style={styles.cardHint}>
          Bir rotaya dokununca operasyon sekmesinde ayni rota secilir.
        </Text>
        {routes.map((route) => (
          <Pressable
            key={route.id}
            onPress={() => {
              setModeWithFallbackRoute(route.mode);
              setSelectedRouteId(route.id);
              setActiveTab('Operasyon');
            }}
            style={styles.routeButton}
          >
            <Text style={styles.routeTitle}>
              {route.from}
              {' -> '}
              {route.to} ({route.mode})
            </Text>
            <Text style={styles.routeMeta}>
              {route.lane} | {route.distanceKm} km | Risk {toPercent(route.baseRisk)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderOperationTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ticaret sistemleri</Text>
        <View style={styles.chipWrap}>
          {(['Kara', 'Deniz', 'Hava'] as TransportMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[styles.chip, selectedMode === mode && styles.chipActive]}
              onPress={() => setModeWithFallbackRoute(mode)}
            >
              <Text style={[styles.chipText, selectedMode === mode && styles.chipTextActive]}>
                {mode}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.cardHint}>Araclar: {modeVehicles[selectedMode].join(', ')}</Text>
        <Text style={styles.cardHint}>Riskler: {modeRisks[selectedMode].join(', ')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rota secimi</Text>
        {routesByMode.map((route) => (
          <Pressable
            key={route.id}
            onPress={() => setSelectedRouteId(route.id)}
            style={[styles.optionRow, selectedRoute?.id === route.id && styles.optionRowActive]}
          >
            <Text style={styles.rowTitle}>
              {route.from}
              {' -> '}
              {route.to}
            </Text>
            <Text style={styles.rowMeta}>
              {route.lane} | {route.distanceKm} km
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Urun secimi</Text>
        <View style={styles.chipWrap}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={[styles.chip, selectedProduct.id === product.id && styles.chipActive]}
              onPress={() => setSelectedProductId(product.id)}
            >
              <Text style={[styles.chipText, selectedProduct.id === product.id && styles.chipTextActive]}>
                {product.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.cardHint}>
          Secili urun: {selectedProduct.name} ({selectedProduct.demandTag}) | Risk {toPercent(selectedProduct.risk)}
          {selectedProduct.illegal ? ' | Yasal durum: ozel riskli' : ''}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Operasyon ayarlari</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Sigorta aktif</Text>
          <Switch value={insured} onValueChange={setInsured} trackColor={{ true: '#16a34a', false: '#64748b' }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Askeri eskort (sadece deniz)</Text>
          <Switch
            value={escorted}
            onValueChange={setEscorted}
            trackColor={{ true: '#16a34a', false: '#64748b' }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vergi kacirma (ceza riski var)</Text>
          <Switch
            value={taxEvasion}
            onValueChange={setTaxEvasion}
            trackColor={{ true: '#dc2626', false: '#64748b' }}
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.primaryButton} onPress={runShipment}>
            <Text style={styles.primaryButtonText}>Sevkiyat baslat</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={buyFleetUnit}>
            <Text style={styles.secondaryButtonText}>Filo yatirimi</Text>
          </Pressable>
        </View>
      </View>

      {lastResult ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Son operasyon sonucu</Text>
          <Text style={styles.rowMeta}>{lastResult.summary}</Text>
          <Text style={[styles.financialValue, lastResult.netProfit >= 0 ? styles.positive : styles.negative]}>
            Net: {toMoney(lastResult.netProfit)}
          </Text>
          <Text style={styles.rowMeta}>Gelir: {toMoney(lastResult.grossRevenue)}</Text>
          <Text style={styles.rowMeta}>Maliyet: {toMoney(lastResult.totalCost)}</Text>
          <Text style={styles.rowMeta}>Risk skoru: {toPercent(lastResult.risk)}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderCoopTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kooperatif sirketler birligi</Text>
        {coopMembers.map((member) => (
          <View key={member.name} style={styles.optionRow}>
            <Text style={styles.rowTitle}>{member.name}</Text>
            <Text style={styles.rowMeta}>
              {member.specialty} | Gelir payi {toPercent(member.share)}
            </Text>
          </View>
        ))}
        <Text style={styles.cardHint}>Ortak savunma fonu: {toMoney(coopFund)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ortak varliklar</Text>
        <Text style={styles.rowMeta}>Ortak filo (demo):</Text>
        <Text style={styles.rowMeta}>Kara: {fleet.Kara + 22} | Deniz: {fleet.Deniz + 11} | Hava: {fleet.Hava + 7}</Text>
        <Text style={styles.rowMeta}>Ortak depo kapasitesi: {Math.round(coopFund / 90)} ton</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${tenderProgress}%` }]} />
        </View>
        <Text style={styles.rowMeta}>Buyuk ihale ilerlemesi: {Math.round(tenderProgress)}%</Text>
        <Pressable style={styles.secondaryButton} onPress={transferToDefenseFund}>
          <Text style={styles.secondaryButtonText}>Savunma fonuna 20k aktar</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kuresel siralama</Text>
        {leaderboard.map((row, index) => (
          <View key={row.company} style={styles.rankRow}>
            <Text style={styles.rowTitle}>
              #{index + 1} {row.company}
            </Text>
            <Text style={styles.rowMeta}>{toMoney(row.score)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFinanceTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Zor ekonomi paneli</Text>
        <View style={styles.financialGrid}>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Nakit</Text>
            <Text style={styles.financialValue}>{toMoney(economy.cash)}</Text>
          </View>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Borc</Text>
            <Text style={styles.financialValue}>{toMoney(economy.debt)}</Text>
          </View>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Enflasyon</Text>
            <Text style={styles.financialValue}>{toPercent(economy.inflation)}</Text>
          </View>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Doviz kuru</Text>
            <Text style={styles.financialValue}>{economy.fx.toFixed(2)}</Text>
          </View>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Yakit endeksi</Text>
            <Text style={styles.financialValue}>{economy.fuelIndex.toFixed(2)}</Text>
          </View>
          <View style={styles.finCell}>
            <Text style={styles.finLabel}>Yatirimci baskisi</Text>
            <Text style={styles.financialValue}>{toPercent(economy.investorPressure)}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryButton} onPress={takeLoan}>
            <Text style={styles.secondaryButtonText}>250k kredi al</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={payDebt}>
            <Text style={styles.secondaryButtonText}>100k borc ode</Text>
          </Pressable>
        </View>
        <Pressable style={styles.primaryButton} onPress={nextWeek}>
          <Text style={styles.primaryButtonText}>Hafta atlat</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kuresel borsa ve hisseler</Text>
        <Text style={styles.rowMeta}>Sirket hisse fiyati: {toMoney(sharePrice)}</Text>
        <Text style={styles.rowMeta}>Halka arz skoru: {toPercent(clamp((economy.shipments + 5) / 40, 0.1, 0.95))}</Text>
        <Text style={styles.rowMeta}>Port kapasite baskisi: {toPercent((100 - portCapacityScore) / 100)}</Text>
        <Text style={styles.rowMeta}>Tekellesme riski: {toPercent(monopolyRisk)}</Text>
      </View>

      {economy.cash < 0 || economy.investorPressure > 0.85 ? (
        <View style={[styles.card, styles.alertCard]}>
          <Text style={styles.alertTitle}>Iflas riski yukseliyor!</Text>
          <Text style={styles.rowMeta}>
            Nakit negatif veya yatirimci baskisi kritik seviyede. Acil maliyet dusurme gerekiyor.
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderCrisisTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oyun modlari</Text>
        <View style={styles.chipWrap}>
          {gameModes.map((mode) => (
            <Pressable
              key={mode}
              style={[styles.chip, gameMode === mode && styles.chipActive]}
              onPress={() => setGameMode(mode)}
            >
              <Text style={[styles.chipText, gameMode === mode && styles.chipTextActive]}>{mode}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kriz sezonu secimi</Text>
        {crisisCatalog.map((crisis) => (
          <Pressable
            key={crisis.key}
            style={[styles.optionRow, activeCrisis.key === crisis.key && styles.optionRowActive]}
            onPress={() => selectCrisis(crisis)}
          >
            <Text style={styles.rowTitle}>{crisis.key}</Text>
            <Text style={styles.rowMeta}>{crisis.description}</Text>
            <Text style={styles.rowMeta}>
              Etki
              {' -> '}
              Yakit {toPercent(crisis.fuelDelta)} | Kara risk +{toPercent(crisis.modeRisk.Kara)} | Deniz risk +{toPercent(
                crisis.modeRisk.Deniz,
              )} | Hava risk +{toPercent(crisis.modeRisk.Hava)}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.primaryButton} onPress={randomCrisis}>
          <Text style={styles.primaryButtonText}>Rastgele kuresel olay</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Canli olay akisi</Text>
        {eventFeed.map((entry, index) => (
          <Text key={`${entry}-${index}`} style={styles.feedLine}>
            - {entry}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Ticarium Online - Mobil Frontend Demo</Text>
        <Text style={styles.subtitle}>
          Hafta {economy.week} | Aktif kriz: {activeCrisis.key} | Siralaman: #{playerRank}
        </Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>Nakit</Text>
          <Text style={styles.kpiValue}>{toMoney(economy.cash)}</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>Sevkiyat</Text>
          <Text style={styles.kpiValue}>{economy.shipments}</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>Koop Fonu</Text>
          <Text style={styles.kpiValue}>{toMoney(coopFund)}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {activeTab === 'Harita' && renderMapTab()}
        {activeTab === 'Operasyon' && renderOperationTab()}
        {activeTab === 'Kooperatif' && renderCoopTab()}
        {activeTab === 'Finans' && renderFinanceTab()}
        {activeTab === 'Kriz' && renderCrisisTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  kpiRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  kpiLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  kpiValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  tabButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#eff6ff',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  sectionStack: {
    gap: 12,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 17,
  },
  rowCard: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  rowMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  metricBadgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badgeText: {
    color: '#bfdbfe',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: '#1e3a8a',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  routeButton: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  routeTitle: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '700',
  },
  routeMeta: {
    color: '#93c5fd',
    marginTop: 4,
    fontSize: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#eff6ff',
  },
  optionRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    padding: 10,
    marginBottom: 8,
  },
  optionRowActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#0b1d45',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  secondaryButtonText: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '700',
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  finCell: {
    width: '48%',
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  finLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  financialValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  positive: {
    color: '#4ade80',
  },
  negative: {
    color: '#f87171',
  },
  alertCard: {
    borderColor: '#dc2626',
    backgroundColor: '#2b1111',
  },
  alertTitle: {
    color: '#fecaca',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  rankRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  feedLine: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 17,
  },
});
