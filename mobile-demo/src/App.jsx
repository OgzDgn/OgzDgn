import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import worldMapImg from './assets/world-map.svg'
import landVehicleImg from './assets/vehicle-land.svg'
import seaVehicleImg from './assets/vehicle-sea.svg'
import airVehicleImg from './assets/vehicle-air.svg'
import playerAvatarImg from './assets/profile-player.svg'
import coopAvatarImg from './assets/profile-coop.svg'

const tabs = [
  { id: 'dashboard', label: 'Komuta' },
  { id: 'trade', label: 'Ticaret' },
  { id: 'lobby', label: 'Lobi' },
  { id: 'coop', label: 'Koop' },
  { id: 'profiles', label: 'Profiller' },
  { id: 'finance', label: 'Finans' },
  { id: 'league', label: 'Lig' },
]

const cityCatalog = [
  {
    id: 'new-york',
    name: 'New York',
    country: 'ABD',
    port: 'Port of New York and New Jersey',
    taxRate: 0.18,
    risk: 0.14,
    demand: ['Elektronik', 'Tibbi Malzeme', 'Luks Arac'],
    policy: 'Denetim yogun',
    mapX: 19,
    mapY: 41,
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'ABD',
    port: 'Port of Los Angeles',
    taxRate: 0.19,
    risk: 0.16,
    demand: ['Elektronik', 'Luks Arac', 'Tibbi Malzeme'],
    policy: 'Pasifik giris kapisi',
    mapX: 11,
    mapY: 43,
  },
  {
    id: 'santos',
    name: 'Santos',
    country: 'Brezilya',
    port: 'Port of Santos',
    taxRate: 0.12,
    risk: 0.21,
    demand: ['Tahil', 'Petrol', 'Luks Arac'],
    policy: 'Tarim ihracat merkezi',
    mapX: 31,
    mapY: 68,
  },
  {
    id: 'lagos',
    name: 'Lagos',
    country: 'Nijerya',
    port: 'Port of Lagos',
    taxRate: 0.11,
    risk: 0.23,
    demand: ['Tahil', 'Petrol', 'Tibbi Malzeme'],
    policy: 'Hizli buyuyen pazar',
    mapX: 50,
    mapY: 56,
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    country: 'Cin',
    port: 'Shanghai Port',
    taxRate: 0.13,
    risk: 0.2,
    demand: ['Petrol', 'Nadir Madenler', 'Elektronik'],
    policy: 'Ihracat odakli',
    mapX: 78,
    mapY: 43,
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkiye',
    port: 'Port of Ambarli',
    taxRate: 0.17,
    risk: 0.24,
    demand: ['Tahil', 'Tibbi Malzeme', 'Elektronik'],
    policy: 'Kopru pazar',
    mapX: 60,
    mapY: 40,
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'BAE',
    port: 'Jebel Ali Port',
    taxRate: 0.09,
    risk: 0.18,
    demand: ['Luks Arac', 'Petrol', 'Silah'],
    policy: 'Serbest bolge',
    mapX: 66,
    mapY: 52,
  },
  {
    id: 'hamburg',
    name: 'Hamburg',
    country: 'Almanya',
    port: 'Port of Hamburg',
    taxRate: 0.16,
    risk: 0.12,
    demand: ['Tahil', 'Elektronik', 'Tibbi Malzeme'],
    policy: 'Yesil lojistik',
    mapX: 58,
    mapY: 32,
  },
  {
    id: 'rotterdam',
    name: 'Rotterdam',
    country: 'Hollanda',
    port: 'Port of Rotterdam',
    taxRate: 0.17,
    risk: 0.11,
    demand: ['Tahil', 'Elektronik', 'Tibbi Malzeme'],
    policy: 'AB lojistik merkezi',
    mapX: 56,
    mapY: 31,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'Hindistan',
    port: 'Jawaharlal Nehru Port',
    taxRate: 0.14,
    risk: 0.19,
    demand: ['Petrol', 'Tibbi Malzeme', 'Tahil'],
    policy: 'Yuksek tuketim bolgesi',
    mapX: 68,
    mapY: 51,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapur',
    port: 'Port of Singapore',
    taxRate: 0.12,
    risk: 0.13,
    demand: ['Elektronik', 'Nadir Madenler', 'Tibbi Malzeme'],
    policy: 'Asya dagitim hatti',
    mapX: 74,
    mapY: 59,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japonya',
    port: 'Port of Tokyo',
    taxRate: 0.2,
    risk: 0.15,
    demand: ['Nadir Madenler', 'Elektronik', 'Luks Arac'],
    policy: 'Yuksek standart',
    mapX: 85,
    mapY: 39,
  },
]

const routeCatalog = [
  {
    id: 'istanbul-hamburg',
    from: 'istanbul',
    to: 'hamburg',
    distanceKm: 2200,
    baseRisk: 0.16,
    modes: ['land', 'sea', 'air'],
  },
  {
    id: 'shanghai-istanbul',
    from: 'shanghai',
    to: 'istanbul',
    distanceKm: 15800,
    baseRisk: 0.26,
    modes: ['sea', 'air'],
  },
  {
    id: 'dubai-istanbul',
    from: 'dubai',
    to: 'istanbul',
    distanceKm: 4500,
    baseRisk: 0.22,
    modes: ['land', 'sea', 'air'],
  },
  {
    id: 'new-york-hamburg',
    from: 'new-york',
    to: 'hamburg',
    distanceKm: 6200,
    baseRisk: 0.19,
    modes: ['sea', 'air'],
  },
  {
    id: 'tokyo-shanghai',
    from: 'tokyo',
    to: 'shanghai',
    distanceKm: 1800,
    baseRisk: 0.15,
    modes: ['sea', 'air'],
  },
  {
    id: 'dubai-shanghai',
    from: 'dubai',
    to: 'shanghai',
    distanceKm: 6500,
    baseRisk: 0.2,
    modes: ['sea', 'air'],
  },
  {
    id: 'singapore-dubai',
    from: 'singapore',
    to: 'dubai',
    distanceKm: 5840,
    baseRisk: 0.18,
    modes: ['sea', 'air'],
  },
  {
    id: 'singapore-shanghai',
    from: 'singapore',
    to: 'shanghai',
    distanceKm: 3800,
    baseRisk: 0.16,
    modes: ['sea', 'air'],
  },
  {
    id: 'mumbai-dubai',
    from: 'mumbai',
    to: 'dubai',
    distanceKm: 1930,
    baseRisk: 0.17,
    modes: ['sea', 'air'],
  },
  {
    id: 'mumbai-singapore',
    from: 'mumbai',
    to: 'singapore',
    distanceKm: 3900,
    baseRisk: 0.16,
    modes: ['sea', 'air'],
  },
  {
    id: 'lagos-istanbul',
    from: 'lagos',
    to: 'istanbul',
    distanceKm: 4600,
    baseRisk: 0.24,
    modes: ['sea', 'air'],
  },
  {
    id: 'rotterdam-istanbul',
    from: 'rotterdam',
    to: 'istanbul',
    distanceKm: 2700,
    baseRisk: 0.15,
    modes: ['land', 'sea', 'air'],
  },
  {
    id: 'santos-new-york',
    from: 'santos',
    to: 'new-york',
    distanceKm: 7700,
    baseRisk: 0.23,
    modes: ['sea', 'air'],
  },
  {
    id: 'los-angeles-shanghai',
    from: 'los-angeles',
    to: 'shanghai',
    distanceKm: 10400,
    baseRisk: 0.22,
    modes: ['sea', 'air'],
  },
]

const fleetByMode = {
  land: [
    {
      id: 'truck',
      name: 'TIR',
      capacity: 110,
      fuelPerKm: 5.4,
      crewCost: 58,
      maintenanceCost: 14000,
      priceMultiplier: 1.02,
      riskMitigation: 0.02,
    },
    {
      id: 'rail',
      name: 'Yuk Treni',
      capacity: 260,
      fuelPerKm: 4.1,
      crewCost: 42,
      maintenanceCost: 21000,
      priceMultiplier: 1.06,
      riskMitigation: 0.05,
    },
    {
      id: 'cold-chain',
      name: 'Soguk Zincir Araci',
      capacity: 95,
      fuelPerKm: 5.8,
      crewCost: 72,
      maintenanceCost: 26000,
      priceMultiplier: 1.14,
      riskMitigation: 0.03,
    },
    {
      id: 'land-oil',
      name: 'Petrol Tankeri',
      capacity: 180,
      fuelPerKm: 6.3,
      crewCost: 60,
      maintenanceCost: 24000,
      priceMultiplier: 1.1,
      riskMitigation: 0.02,
    },
  ],
  sea: [
    {
      id: 'container-ship',
      name: 'Konteyner Gemisi',
      capacity: 900,
      fuelPerKm: 9.1,
      crewCost: 90,
      maintenanceCost: 65000,
      priceMultiplier: 1.08,
      riskMitigation: 0.03,
    },
    {
      id: 'oil-tanker',
      name: 'Petrol Tankeri',
      capacity: 780,
      fuelPerKm: 10.8,
      crewCost: 110,
      maintenanceCost: 74000,
      priceMultiplier: 1.12,
      riskMitigation: 0.02,
    },
    {
      id: 'lng-ship',
      name: 'LNG Gemisi',
      capacity: 640,
      fuelPerKm: 9.8,
      crewCost: 120,
      maintenanceCost: 86000,
      priceMultiplier: 1.16,
      riskMitigation: 0.04,
    },
    {
      id: 'escort-ship',
      name: 'Askeri Eskortlu Gemi',
      capacity: 560,
      fuelPerKm: 12.2,
      crewCost: 160,
      maintenanceCost: 120000,
      priceMultiplier: 1.22,
      riskMitigation: 0.12,
    },
  ],
  air: [
    {
      id: 'cargo-plane',
      name: 'Kargo Ucagi',
      capacity: 140,
      fuelPerKm: 13.4,
      crewCost: 180,
      maintenanceCost: 98000,
      priceMultiplier: 1.2,
      riskMitigation: 0.02,
    },
    {
      id: 'fast-jet',
      name: 'Hizli Teslimat Jeti',
      capacity: 90,
      fuelPerKm: 15.2,
      crewCost: 210,
      maintenanceCost: 124000,
      priceMultiplier: 1.35,
      riskMitigation: 0.01,
    },
    {
      id: 'secure-air',
      name: 'Degerli Esya Tasiyici',
      capacity: 65,
      fuelPerKm: 16.6,
      crewCost: 260,
      maintenanceCost: 140000,
      priceMultiplier: 1.42,
      riskMitigation: 0.06,
    },
  ],
}

const productCatalog = [
  { id: 'petrol', name: 'Petrol', basePrice: 2100, risk: 0.12, illegal: false },
  { id: 'electronics', name: 'Elektronik', basePrice: 5600, risk: 0.1, illegal: false },
  { id: 'luxury-cars', name: 'Luks Arac', basePrice: 9800, risk: 0.14, illegal: false },
  { id: 'grain', name: 'Tahil', basePrice: 1200, risk: 0.05, illegal: false },
  { id: 'weapons', name: 'Silah', basePrice: 14500, risk: 0.3, illegal: true },
  { id: 'medical', name: 'Tibbi Malzeme', basePrice: 6100, risk: 0.12, illegal: false },
  { id: 'rare-minerals', name: 'Nadir Madenler', basePrice: 13000, risk: 0.22, illegal: false },
]

const scenarioCatalog = [
  {
    id: 'normal',
    name: 'Dengeli Donem',
    summary: 'Piyasalar normal ama marjlar dusuk. Kredi faizi hala yuksek.',
    inflationShock: 0.04,
    fuelMultiplier: 1,
    taxPressure: 0.01,
    fxVolatility: 0.08,
    investorStress: 0.18,
    seaRisk: 0.03,
    landRisk: 0.02,
    airRisk: 0.03,
    insuranceDelta: 0.002,
    incidentLabel: 'kucuk lojistik gecikme',
  },
  {
    id: 'oil-crisis',
    name: 'Petrol Krizi',
    summary: 'Ham petrol sert yukseldi. Kara ve hava tasimasi pahalandi.',
    inflationShock: 0.1,
    fuelMultiplier: 1.45,
    taxPressure: 0.015,
    fxVolatility: 0.16,
    investorStress: 0.3,
    seaRisk: 0.07,
    landRisk: 0.06,
    airRisk: 0.08,
    insuranceDelta: 0.01,
    incidentLabel: 'yakit tuketim sapmasi',
  },
  {
    id: 'regional-war',
    name: 'Bolgesel Savas',
    summary: 'Deniz rotalarinda saldiri riski buyudu. Sigorta masraflari artti.',
    inflationShock: 0.12,
    fuelMultiplier: 1.25,
    taxPressure: 0.02,
    fxVolatility: 0.22,
    investorStress: 0.44,
    seaRisk: 0.18,
    landRisk: 0.09,
    airRisk: 0.12,
    insuranceDelta: 0.018,
    incidentLabel: 'guvenlik ihlali',
  },
  {
    id: 'pandemic',
    name: 'Kuresel Pandemi',
    summary: 'Hava tasimasi talebi sert dustu, limanlarda operasyon yavasladi.',
    inflationShock: 0.08,
    fuelMultiplier: 1.08,
    taxPressure: 0.012,
    fxVolatility: 0.2,
    investorStress: 0.36,
    seaRisk: 0.09,
    landRisk: 0.05,
    airRisk: 0.2,
    insuranceDelta: 0.014,
    incidentLabel: 'karantina bekleme suresi',
  },
  {
    id: 'financial-crash',
    name: 'Finans Cokusu',
    summary: 'Likidite daraldi, kredi pahali. Iflas riski hizla yukseliyor.',
    inflationShock: 0.16,
    fuelMultiplier: 1.16,
    taxPressure: 0.03,
    fxVolatility: 0.34,
    investorStress: 0.58,
    seaRisk: 0.1,
    landRisk: 0.08,
    airRisk: 0.11,
    insuranceDelta: 0.02,
    incidentLabel: 'finansman kirilmasi',
  },
]

const cooperativeMembers = [
  {
    id: 'm1',
    company: 'Anatolia Logistics',
    mission: 'Cin yuklerini Istanbul limaninda teslim aliyor',
    incomeShare: 0.3,
  },
  {
    id: 'm2',
    company: 'Bosphorus Rail',
    mission: 'Istanbul dan Avrupa kara dagitimi yapiyor',
    incomeShare: 0.26,
  },
  {
    id: 'm3',
    company: 'Nordic Port Ops',
    mission: 'Hamburg depolama ve gumruk gecislerini yonetiyor',
    incomeShare: 0.22,
  },
  {
    id: 'm4',
    company: 'Desert Air Cargo',
    mission: 'Dubai acil hava teslimatlarini ustleniyor',
    incomeShare: 0.22,
  },
]

const leagueOpponents = [
  { name: 'Baltic Crown', points: 1565, style: 'Fiyat kirma uzmani' },
  { name: 'Atlas Meridian', points: 1480, style: 'Liman tekellesmesi' },
  { name: 'Sino Harbor Union', points: 1432, style: 'Deniz ihale dominasyonu' },
  { name: 'Gulf Frontier', points: 1370, style: 'Petrol kontrati odakli' },
]

const baseStocks = [
  { name: 'GlobalFuel ETF', base: 112 },
  { name: 'PortChain Index', base: 78 },
  { name: 'AeroFast Cargo', base: 94 },
  { name: 'MedSupply Trust', base: 61 },
]

const playerProfiles = [
  {
    id: 'you',
    name: 'NOVA Freight Holdings',
    role: 'Oyuncu CEO',
    focus: 'Kara + deniz hibrit zincir',
    riskStyle: 'Dengeli',
  },
  {
    id: 'p2',
    name: 'Mina Yildiz',
    role: 'Atlas Meridian CFO',
    focus: 'Agresif fiyat kirma',
    riskStyle: 'Yuksek',
  },
  {
    id: 'p3',
    name: 'Kenji Sato',
    role: 'Sino Harbor Captain',
    focus: 'Liman rotasyon optimizasyonu',
    riskStyle: 'Dengeli',
  },
  {
    id: 'p4',
    name: 'Lara Demir',
    role: 'Baltic Crown COO',
    focus: 'Ihale sure baskisi',
    riskStyle: 'Dusuk',
  },
]

const cooperativeProfiles = [
  {
    id: 'c1',
    name: 'Mavi Hat Koop Birligi',
    region: 'EMEA',
    specialty: 'Konteyner + demiryolu terminali',
    members: 24,
  },
  {
    id: 'c2',
    name: 'TransPacific Unity',
    region: 'APAC',
    specialty: 'LNG ve yuksek hacimli deniz hattlari',
    members: 31,
  },
  {
    id: 'c3',
    name: 'Atlas Frontier Guild',
    region: 'Americas',
    specialty: 'Hizli hava teslimat agi',
    members: 17,
  },
]

const lobbyRegions = [
  'Kuresel Lig',
  'Avrupa Sunucusu',
  'Asya Pasifik Sunucusu',
  'Amerika Sunucusu',
  'Hardcore Ekonomi',
]

const lobbyRosterSeed = [
  {
    id: 'you',
    company: 'KureTrade Collective',
    captain: 'Sen',
    leagueMmr: 1432,
    pingMs: 38,
    ready: false,
    isYou: true,
  },
  {
    id: 'rival-1',
    company: 'Baltic Crown',
    captain: 'Lara Demir',
    leagueMmr: 1565,
    pingMs: 44,
    ready: true,
    isYou: false,
  },
  {
    id: 'rival-2',
    company: 'Atlas Meridian',
    captain: 'Mina Yildiz',
    leagueMmr: 1480,
    pingMs: 63,
    ready: false,
    isYou: false,
  },
  {
    id: 'rival-3',
    company: 'Sino Harbor Union',
    captain: 'Kenji Sato',
    leagueMmr: 1432,
    pingMs: 82,
    ready: true,
    isYou: false,
  },
  {
    id: 'rival-4',
    company: 'Gulf Frontier',
    captain: 'Noor Al Fahim',
    leagueMmr: 1370,
    pingMs: 57,
    ready: false,
    isYou: false,
  },
]

const tenderCatalog = [
  {
    id: 'tender-1',
    title: 'Dubai Petrol Tedarik Ihalesi',
    routeId: 'dubai-istanbul',
    mode: 'sea',
    productId: 'petrol',
    tons: 520,
    minBid: 1750000,
    durationSec: 130,
    deliveryWindowSec: 110,
    minCollateralRate: 0.12,
    bidStepRate: 0.018,
    latePenaltyRate: 0.34,
  },
  {
    id: 'tender-2',
    title: 'Hamburg Medikal Acil Kontrat',
    routeId: 'istanbul-hamburg',
    mode: 'land',
    productId: 'medical',
    tons: 180,
    minBid: 860000,
    durationSec: 120,
    deliveryWindowSec: 75,
    minCollateralRate: 0.1,
    bidStepRate: 0.016,
    latePenaltyRate: 0.3,
  },
  {
    id: 'tender-3',
    title: 'Singapore Nadir Maden Kontrati',
    routeId: 'singapore-shanghai',
    mode: 'sea',
    productId: 'rare-minerals',
    tons: 210,
    minBid: 1480000,
    durationSec: 150,
    deliveryWindowSec: 95,
    minCollateralRate: 0.14,
    bidStepRate: 0.021,
    latePenaltyRate: 0.36,
  },
  {
    id: 'tender-4',
    title: 'Rotterdam Tahil Koridoru',
    routeId: 'rotterdam-istanbul',
    mode: 'land',
    productId: 'grain',
    tons: 280,
    minBid: 940000,
    durationSec: 125,
    deliveryWindowSec: 85,
    minCollateralRate: 0.09,
    bidStepRate: 0.014,
    latePenaltyRate: 0.28,
  },
  {
    id: 'tender-5',
    title: 'Mumbai Medikal Hava Ekseni',
    routeId: 'mumbai-dubai',
    mode: 'air',
    productId: 'medical',
    tons: 120,
    minBid: 1210000,
    durationSec: 118,
    deliveryWindowSec: 70,
    minCollateralRate: 0.11,
    bidStepRate: 0.017,
    latePenaltyRate: 0.32,
  },
]

const modeRiskBase = {
  land: 0.2,
  sea: 0.26,
  air: 0.24,
}

const modeLabels = {
  land: 'Kara Ticareti',
  sea: 'Deniz Ticareti',
  air: 'Hava Ticareti',
}

const speedByMode = {
  land: 145,
  sea: 205,
  air: 320,
}

const vehicleVisualByMode = {
  land: landVehicleImg,
  sea: seaVehicleImg,
  air: airVehicleImg,
}

const allVehicles = Object.values(fleetByMode).flat()

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const formatMoney = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value) => `%${(value * 100).toFixed(1)}`

const formatCountdown = (seconds) => {
  const safeValue = Math.max(0, Math.floor(seconds))
  const mins = String(Math.floor(safeValue / 60)).padStart(2, '0')
  const secs = String(safeValue % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

const formatGameClock = (seconds) => {
  const safeValue = Math.max(0, Math.floor(seconds))
  const hours = String(Math.floor(safeValue / 3600)).padStart(2, '0')
  const mins = String(Math.floor((safeValue % 3600) / 60)).padStart(2, '0')
  const secs = String(safeValue % 60).padStart(2, '0')
  return `${hours}:${mins}:${secs}`
}

const deterministicNoise = (seedValue) => {
  const seed = String(seedValue)
  let hash = 0

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000
  }

  return (Math.sin(hash) + 1) / 2
}

const buildInitialTenderBoard = () =>
  tenderCatalog.map((tender, index) => {
    const rivalBid = Math.round(
      tender.minBid * (1.01 + deterministicNoise(`${tender.id}-rival-initial`) * 0.025),
    )

    return {
      ...tender,
      status: 'open',
      winner: null,
      awardedAt: null,
      penaltyPaid: 0,
      playerBid: tender.minBid,
      rivalBid,
      bondLocked: 0,
      hasPlayerBid: false,
      closeAt: tender.durationSec + index * 28,
    }
  })

function App() {
  const cityById = useMemo(
    () => Object.fromEntries(cityCatalog.map((city) => [city.id, city])),
    [],
  )
  const routeById = useMemo(
    () => Object.fromEntries(routeCatalog.map((route) => [route.id, route])),
    [],
  )
  const vehicleById = useMemo(
    () => Object.fromEntries(allVehicles.map((vehicle) => [vehicle.id, vehicle])),
    [],
  )

  const [activeTab, setActiveTab] = useState('dashboard')
  const [scenarioId, setScenarioId] = useState('normal')
  const [mode, setMode] = useState('land')
  const [routeId, setRouteId] = useState('istanbul-hamburg')
  const [vehicleId, setVehicleId] = useState('truck')
  const [productId, setProductId] = useState('electronics')
  const [cargoTons, setCargoTons] = useState(120)
  const [insuranceEnabled, setInsuranceEnabled] = useState(true)
  const [escortEnabled, setEscortEnabled] = useState(false)
  const [cash, setCash] = useState(2200000)
  const [debt, setDebt] = useState(1450000)
  const [reputation, setReputation] = useState(58)
  const [leaguePoints, setLeaguePoints] = useState(1310)
  const [portfolio, setPortfolio] = useState(780000)
  const [escrowedBond, setEscrowedBond] = useState(0)
  const [wsConnected, setWsConnected] = useState(true)
  const [wsLatencyMs, setWsLatencyMs] = useState(42)
  const [socketFeed, setSocketFeed] = useState([
    {
      id: 'ws-1',
      type: 'system',
      text: 'WebSocket baglandi. Ihale akisi ve lobi verisi canli.',
      at: '00:00:00',
    },
  ])
  const [lobbyRegion, setLobbyRegion] = useState(lobbyRegions[0])
  const [lobbyPlayers, setLobbyPlayers] = useState(lobbyRosterSeed)
  const [lobbyChatInput, setLobbyChatInput] = useState('')
  const [lobbyChat, setLobbyChat] = useState([
    {
      id: 'chat-1',
      author: 'Lobi Botu',
      text: 'Lobi acildi. Hazir oldugunda durumunu guncelle.',
      at: '00:00:00',
    },
  ])
  const [gameTime, setGameTime] = useState(0)
  const [tenderBoard, setTenderBoard] = useState(() => buildInitialTenderBoard())
  const [inTransitJobs, setInTransitJobs] = useState([])
  const [vehicleCondition, setVehicleCondition] = useState(() =>
    Object.fromEntries(allVehicles.map((vehicle) => [vehicle.id, 100])),
  )
  const [vehicleFailures, setVehicleFailures] = useState(() =>
    Object.fromEntries(allVehicles.map((vehicle) => [vehicle.id, false])),
  )
  const [operations, setOperations] = useState([
    {
      id: 1,
      title: 'Istanbul -> Hamburg',
      note: 'Demiryolu teslimati transit sonrasinda basariyla kapandi.',
      delta: 163000,
    },
    {
      id: 2,
      title: 'Dubai -> Istanbul',
      note: 'Bakim gecikmesi nedeniyle sefer suresi uzadi.',
      delta: -42000,
    },
    {
      id: 3,
      title: 'Shanghai -> Istanbul',
      note: 'Ihale kontrati sure dolmadan kazanildi.',
      delta: 88000,
    },
  ])
  const idCounter = useRef(1000)
  const wsEventCounterRef = useRef(2)
  const wsTickRef = useRef(0)
  const lobbyChatCounterRef = useRef(2)
  const gameTimeRef = useRef(0)
  const settleDueEventsRef = useRef(null)

  const nextId = () => {
    idCounter.current += 1
    return idCounter.current
  }

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setGameTime((prev) => {
        const next = prev + 1
        gameTimeRef.current = next
        settleDueEventsRef.current?.(next)
        return next
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  const scenario = useMemo(
    () => scenarioCatalog.find((item) => item.id === scenarioId) ?? scenarioCatalog[0],
    [scenarioId],
  )

  const availableRoutes = useMemo(
    () => routeCatalog.filter((route) => route.modes.includes(mode)),
    [mode],
  )

  const normalizedRouteId = availableRoutes.some((route) => route.id === routeId)
    ? routeId
    : (availableRoutes[0]?.id ?? '')

  const availableVehicles = fleetByMode[mode]

  const normalizedVehicleId = availableVehicles.some((vehicle) => vehicle.id === vehicleId)
    ? vehicleId
    : (availableVehicles[0]?.id ?? '')

  const selectedRoute =
    routeCatalog.find((route) => route.id === normalizedRouteId) ?? availableRoutes[0] ?? null
  const selectedVehicle =
    availableVehicles.find((vehicle) => vehicle.id === normalizedVehicleId) ?? availableVehicles[0]
  const selectedProduct =
    productCatalog.find((product) => product.id === productId) ?? productCatalog[0]

  const origin = selectedRoute ? cityById[selectedRoute.from] : null
  const destination = selectedRoute ? cityById[selectedRoute.to] : null

  const inflation = clamp(0.09 + scenario.inflationShock, 0.04, 0.48)
  const usdTry = 38.4 * (1 + scenario.fxVolatility * 0.55)
  const eurUsd = 1.08 * (1 - scenario.fxVolatility * 0.2)
  const loanRate = clamp(0.16 + inflation * 0.85 + scenario.fxVolatility * 0.2, 0.1, 0.58)
  const investorPressure = clamp(
    (debt / Math.max(cash, 1)) * 35 + scenario.investorStress * 100 - reputation * 0.25,
    5,
    100,
  )

  const demandMultiplier =
    destination && destination.demand.includes(selectedProduct.name) ? 1.18 : 0.92
  const illegalPenalty = selectedProduct.illegal ? 0.16 : 0
  const distanceKm = selectedRoute?.distanceKm ?? 0
  const selectedVehicleHealth = vehicleCondition[selectedVehicle.id] ?? 100
  const selectedVehicleFault = vehicleFailures[selectedVehicle.id] ?? false
  const maintenanceRiskPenalty = clamp((100 - selectedVehicleHealth) / 260, 0, 0.32)
  const maintenanceBacklogCost = selectedVehicle.maintenanceCost * (1 - selectedVehicleHealth / 100) * 0.2

  const grossRevenue =
    selectedProduct.basePrice * cargoTons * demandMultiplier * selectedVehicle.priceMultiplier
  const fuelCost = distanceKm * selectedVehicle.fuelPerKm * scenario.fuelMultiplier
  const laborCost = cargoTons * selectedVehicle.crewCost
  const maintenanceCost = selectedVehicle.maintenanceCost + distanceKm * 0.22
  const storageCost = cargoTons * 34 * (1 + inflation)
  const insuranceCost = insuranceEnabled
    ? grossRevenue * (0.032 + scenario.insuranceDelta)
    : 0
  const taxRate = origin && destination ? (origin.taxRate + destination.taxRate) / 2 : 0
  const taxCost = grossRevenue * (taxRate + scenario.taxPressure)

  const scenarioRiskByMode =
    mode === 'sea' ? scenario.seaRisk : mode === 'air' ? scenario.airRisk : scenario.landRisk
  let riskScore =
    (selectedRoute?.baseRisk ?? 0) +
    modeRiskBase[mode] +
    (origin?.risk ?? 0) / 2 +
    (destination?.risk ?? 0) / 2 +
    selectedProduct.risk +
    illegalPenalty +
    scenarioRiskByMode -
    selectedVehicle.riskMitigation +
    maintenanceRiskPenalty

  if (insuranceEnabled) {
    riskScore -= 0.07
  }

  if (escortEnabled && mode === 'sea') {
    riskScore -= 0.11
  }

  riskScore = clamp(riskScore, 0.05, 0.95)

  const expectedIncidentLoss = grossRevenue * riskScore * 0.28
  const totalCost =
    fuelCost +
    laborCost +
    maintenanceCost +
    maintenanceBacklogCost +
    storageCost +
    insuranceCost +
    taxCost +
    expectedIncidentLoss
  const projectedProfit = grossRevenue - totalCost
  const bookingCost = Math.round((fuelCost + laborCost + storageCost * 0.4) * 0.28)
  const deliveryEtaSec = clamp(
    Math.round(
      distanceKm / speedByMode[mode] +
        cargoTons / 26 +
        scenarioRiskByMode * 65 +
        (100 - selectedVehicleHealth) * 0.45,
    ),
    20,
    240,
  )
  const bankruptcyRisk = clamp(
    (debt / Math.max(cash, 1)) * 30 +
      inflation * 60 +
      Math.max(0, -projectedProfit) / 50000 +
      scenario.investorStress * 20,
    3,
    99,
  )

  const stockBoard = useMemo(
    () =>
      baseStocks.map((item) => {
        const drift =
          1 +
          scenario.fxVolatility * 0.7 +
          (item.name.includes('Fuel') ? scenario.fuelMultiplier - 1 : 0) +
          (item.name.includes('Aero') ? scenario.airRisk * 0.2 : 0)
        const value = item.base * drift
        const change = (drift - 1) * 100

        return { ...item, value, change }
      }),
    [scenario],
  )

  const leagueTable = useMemo(() => {
    const combined = [
      ...leagueOpponents.map((player) => ({
        ...player,
        reputation: 62,
      })),
      {
        name: 'Senin Koop Birligin',
        points: leaguePoints,
        style: 'Hibrit kara deniz hava',
        reputation,
      },
    ]

    return combined
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [leaguePoints, reputation])

  const profileCards = useMemo(
    () =>
      playerProfiles.map((profile) => {
        if (profile.id === 'you') {
          return {
            ...profile,
            currentRank: leagueTable.find((entry) => entry.name === 'Senin Koop Birligin')?.rank ?? '-',
            rating: reputation,
            valuation: cash,
          }
        }

        return {
          ...profile,
          currentRank: '-',
          rating: 52 + Math.round(deterministicNoise(profile.id) * 30),
          valuation: 850000 + Math.round(deterministicNoise(`${profile.id}-valuation`) * 650000),
        }
      }),
    [cash, leagueTable, reputation],
  )

  const cooperativeCards = useMemo(
    () =>
      cooperativeProfiles.map((coop, index) => ({
        ...coop,
        score: 1400 + index * 45 + Math.round(deterministicNoise(`${coop.id}-score`) * 18),
      })),
    [],
  )

  const mapRoutes = useMemo(
    () =>
      routeCatalog
        .slice(0, 18)
        .map((route) => ({
          ...route,
          fromCity: cityById[route.from],
          toCity: cityById[route.to],
        }))
        .filter((route) => route.fromCity && route.toCity),
    [cityById],
  )

  const faultedVehicleCount = useMemo(
    () => Object.values(vehicleFailures).filter(Boolean).length,
    [vehicleFailures],
  )
  const readyPlayerCount = useMemo(
    () => lobbyPlayers.filter((player) => player.ready).length,
    [lobbyPlayers],
  )
  const youAreReady = useMemo(
    () => lobbyPlayers.find((player) => player.isYou)?.ready ?? false,
    [lobbyPlayers],
  )

  const tenderRows = useMemo(
    () =>
      tenderBoard.map((tender) => ({
        ...tender,
        timeLeftSec: Math.max(0, tender.closeAt - gameTime),
        isOpen: tender.status === 'open' && tender.closeAt > gameTime,
        minCollateral: Math.round(tender.minBid * tender.minCollateralRate),
        playerLeading: tender.playerBid >= tender.rivalBid,
        spread: tender.playerBid - tender.rivalBid,
      })),
    [tenderBoard, gameTime],
  )

  const transitRows = useMemo(
    () =>
      [...inTransitJobs]
        .map((job) => ({
          ...job,
          timeLeftSec: Math.max(0, job.etaAt - gameTime),
        }))
        .sort((a, b) => a.timeLeftSec - b.timeLeftSec),
    [inTransitJobs, gameTime],
  )

  const fleetRows = useMemo(
    () =>
      allVehicles.map((vehicle) => {
        const health = vehicleCondition[vehicle.id] ?? 100
        const serviceCost = Math.round(
          vehicle.maintenanceCost * (0.22 + (1 - health / 100) * 0.62),
        )

        return {
          ...vehicle,
          health,
          serviceCost,
          hasFailure: vehicleFailures[vehicle.id] ?? false,
        }
      }),
    [vehicleCondition, vehicleFailures],
  )

  const wearVehicle = (vehicleId, wearAmount, riskContext = 0.15, source = 'operasyon') => {
    const vehicleMeta = vehicleById[vehicleId]
    const currentHealth = vehicleCondition[vehicleId] ?? 100
    const nextHealth = clamp(currentHealth - wearAmount, 8, 100)

    setVehicleCondition((prev) => ({
      ...prev,
      [vehicleId]: clamp((prev[vehicleId] ?? 100) - wearAmount, 8, 100),
    }))

    const faultRisk = clamp((44 - nextHealth) / 100 + riskContext * 0.36, 0, 0.72)
    const faultRoll = deterministicNoise(`${vehicleId}-${gameTime}-${source}-fault`)
    const shouldFault = nextHealth < 44 && faultRoll < faultRisk

    if (shouldFault && !(vehicleFailures[vehicleId] ?? false)) {
      const failureCost = Math.round((vehicleMeta?.maintenanceCost ?? 25000) * 0.12)
      setVehicleFailures((prev) => ({
        ...prev,
        [vehicleId]: true,
      }))
      setCash((prev) => Math.max(0, prev - failureCost))
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${vehicleMeta?.name ?? 'Arac'} ariza verdi`,
            note: 'Bakim arizasi olustu. Arac bakim merkezine alinmadan tekrar sefere cikamaz.',
            delta: -failureCost,
          },
          ...prev,
        ].slice(0, 18),
      )
    }
  }

  const settleDueEvents = (targetTime = gameTime) => {
    const dueJobs = inTransitJobs.filter((job) => job.etaAt <= targetTime)
    const activeJobs = inTransitJobs.filter((job) => job.etaAt > targetTime)
    const closedOpenTenders = tenderBoard.filter(
      (tender) => tender.status === 'open' && tender.closeAt <= targetTime,
    )

    if (dueJobs.length === 0 && closedOpenTenders.length === 0) {
      return
    }

    let cashDelta = 0
    let escrowDelta = 0
    let debtAdjustment = 0
    let repAdjustment = 0
    let pointsAdjustment = 0
    let portfolioFactor = 1
    const logEntries = []
    const awardedTransitJobs = []
    const wearQueue = []

    const resolvedTenders = tenderBoard.map((tender, index) => {
      if (tender.status !== 'open' || tender.closeAt > targetTime) {
        return tender
      }

      const route = routeById[tender.routeId]
      const vehicle = fleetByMode[tender.mode][0]
      const product = productCatalog.find((entry) => entry.id === tender.productId) ?? productCatalog[0]
      const opponent = leagueOpponents[index % leagueOpponents.length].name
      const playerWon = tender.playerBid >= tender.rivalBid && tender.hasPlayerBid && tender.bondLocked > 0

      if (!playerWon || !route || !vehicle) {
        const penalty = Math.round(tender.bondLocked * 0.33)
        const refund = Math.max(0, tender.bondLocked - penalty)

        cashDelta += refund
        escrowDelta -= tender.bondLocked
        repAdjustment += tender.bondLocked > 0 ? -2 : 0
        pointsAdjustment += tender.bondLocked > 0 ? -5 : 0

        logEntries.push({
          id: nextId(),
          title: `Ihale kaybedildi: ${tender.title}`,
          note: tender.bondLocked > 0
            ? `Kazanan ${opponent}. Teminattan ${formatMoney(penalty)} otomatik ceza kesildi.`
            : `Kazanan ${opponent}. Asgari teminat yatirilmadigi icin teklif gecersiz sayildi.`,
          delta: refund,
        })

        return {
          ...tender,
          status: 'expired',
          winner: opponent,
          penaltyPaid: penalty,
          bondLocked: 0,
        }
      }

      const vehicleHealth = vehicleCondition[vehicle.id] ?? 100
      const isVehicleFaulted = vehicleFailures[vehicle.id] ?? false
      const tenderScenarioRisk =
        tender.mode === 'sea'
          ? scenario.seaRisk
          : tender.mode === 'air'
            ? scenario.airRisk
            : scenario.landRisk
      const tenderRisk = clamp(
        route.baseRisk +
          modeRiskBase[tender.mode] +
          tenderScenarioRisk +
          product.risk +
          (100 - vehicleHealth) / 260,
        0.08,
        0.95,
      )
      const dispatchCost = Math.round(tender.playerBid * 0.075 + route.distanceKm * 3.4)
      const projectedGain = Math.round(tender.playerBid * (0.12 + deterministicNoise(`${tender.id}-gain`) * 0.08))
      const etaSec = clamp(
        Math.round(
          route.distanceKm / speedByMode[tender.mode] +
            tender.tons / 40 +
            tenderScenarioRisk * 52 +
            (100 - vehicleHealth) * 0.48,
        ),
        30,
        300,
      )
      const hasCapacity = activeJobs.length + awardedTransitJobs.length < 12
      const hasLiquidity = cash + cashDelta >= dispatchCost

      if (!hasCapacity || !hasLiquidity || isVehicleFaulted) {
        const penalty = Math.round(tender.bondLocked * 0.45)
        const refund = Math.max(0, tender.bondLocked - penalty)

        cashDelta += refund
        escrowDelta -= tender.bondLocked
        repAdjustment -= 3
        pointsAdjustment -= 10

        logEntries.push({
          id: nextId(),
          title: `Ihale otomatik ceza: ${tender.title}`,
          note: isVehicleFaulted
            ? `${vehicle.name} arizali oldugu icin sevkiyat acilamadi. Teminat kesintisi uygulandi.`
            : 'Likidite veya filo kapasitesi yetersiz oldugu icin kontrat bozuldu ve ceza kesildi.',
          delta: refund,
        })

        return {
          ...tender,
          status: 'failed',
          winner: 'Kontrat iptali',
          penaltyPaid: penalty,
          bondLocked: 0,
        }
      }

      cashDelta -= dispatchCost
      pointsAdjustment += 18
      repAdjustment += 2
      awardedTransitJobs.push({
        id: `job-${nextId()}`,
        title: tender.title,
        source: 'tender',
        routeLabel: `${cityById[route.from]?.name ?? route.from} -> ${cityById[route.to]?.name ?? route.to}`,
        etaAt: targetTime + etaSec,
        deadlineAt: targetTime + tender.deliveryWindowSec,
        riskScore: tenderRisk,
        projectedProfit: projectedGain,
        grossRevenue: tender.playerBid,
        fuelCost: route.distanceKm * vehicle.fuelPerKm * scenario.fuelMultiplier,
        maintenanceCost: vehicle.maintenanceCost * 0.44,
        bookingCost: dispatchCost,
        incidentLabel: scenario.incidentLabel,
        vehicleName: vehicle.name,
        vehicleId: vehicle.id,
        collateralLocked: tender.bondLocked,
        penaltyRate: tender.latePenaltyRate,
      })
      wearQueue.push({
        vehicleId: vehicle.id,
        wearAmount: clamp(route.distanceKm / 620 + tender.tons / 140 + tenderScenarioRisk * 18, 6, 22),
        riskContext: tenderScenarioRisk,
        source: `tender-${tender.id}`,
      })

      logEntries.push({
        id: nextId(),
        title: `Ihale kazanildi: ${tender.title}`,
        note: `Kontrat acildi, teslimat suresi ${formatCountdown(etaSec)}. Teminat teslimat sonuna kadar kilitli.`,
        delta: -dispatchCost,
      })

      return {
        ...tender,
        status: 'awarded',
        winner: 'Senin Koop Birligin',
        awardedAt: targetTime,
        bondLocked: 0,
      }
    })

    const completionEntries = dueJobs.map((job) => {
      const incidentRoll = deterministicNoise(`${job.id}-${targetTime}-incident`)
      const incident = incidentRoll < job.riskScore
      const variance = 0.9 + deterministicNoise(`${job.id}-${targetTime}-variance`) * 0.2
      const isLate = typeof job.deadlineAt === 'number' && job.etaAt > job.deadlineAt
      let delta = Math.round(job.projectedProfit * variance + job.bookingCost)
      let note = `${job.routeLabel} teslimati tamamlandi.`

      if (incident) {
        const emergencyLoss =
          job.grossRevenue * (0.2 + deterministicNoise(`${job.id}-${targetTime}-loss`) * 0.27)
        delta = -Math.round(Math.abs(job.fuelCost + job.maintenanceCost * 0.6 + emergencyLoss))
        note = `${job.routeLabel} seferinde ${job.incidentLabel} nedeniyle ciddi hasar olustu.`
      }

      if (isLate) {
        const lateFine = Math.round(job.bookingCost * 0.18 + job.grossRevenue * 0.02)
        delta -= lateFine
        note += ` Teslimat penceresi asildi, ${formatMoney(lateFine)} otomatik ceza uygulandi.`
        repAdjustment -= 4
        pointsAdjustment -= 7
      }

      if (job.collateralLocked > 0) {
        const collateralPenalty = isLate ? Math.round(job.collateralLocked * (job.penaltyRate ?? 0.3)) : 0
        const collateralRefund = Math.max(0, job.collateralLocked - collateralPenalty)
        cashDelta += collateralRefund
        escrowDelta -= job.collateralLocked

        note += isLate
          ? ` Teminat iadesinde ${formatMoney(collateralPenalty)} kesildi.`
          : ' Teminat iadesi eksiksiz yapildi.'
      }

      cashDelta += delta
      debtAdjustment += incident ? 9500 : -5000
      repAdjustment += incident ? -5 : 3
      pointsAdjustment += incident ? -10 : 18
      portfolioFactor *= 1 + (incident ? -0.008 : 0.011)

      if (incident && deterministicNoise(`${job.id}-post-fault`) < 0.52) {
        const faultVehicle = job.vehicleId
        if (faultVehicle && !(vehicleFailures[faultVehicle] ?? false)) {
          const failureCost = Math.round((vehicleById[faultVehicle]?.maintenanceCost ?? 30000) * 0.11)
          cashDelta -= failureCost
          setVehicleFailures((prev) => ({
            ...prev,
            [faultVehicle]: true,
          }))
          note += ` ${vehicleById[faultVehicle]?.name ?? 'Arac'} bakim arizasina dustu.`
        }
      }

      return {
        id: nextId(),
        title: `Teslimat Tamamlandi: ${job.title}`,
        note,
        delta,
      }
    })

    setTenderBoard(resolvedTenders)
    setInTransitJobs([...awardedTransitJobs, ...activeJobs].slice(0, 12))
    if (cashDelta !== 0) {
      setCash((prev) => Math.max(0, Math.round(prev + cashDelta)))
    }
    if (escrowDelta !== 0) {
      setEscrowedBond((prev) => Math.max(0, Math.round(prev + escrowDelta)))
    }
    if (debtAdjustment !== 0) {
      setDebt((prev) => Math.max(0, Math.round(prev * (1 + (loanRate * dueJobs.length) / 5100) + debtAdjustment)))
    }
    if (repAdjustment !== 0) {
      setReputation((prev) => clamp(prev + repAdjustment, 0, 100))
    }
    if (pointsAdjustment !== 0) {
      setLeaguePoints((prev) => Math.max(0, Math.round(prev + pointsAdjustment)))
    }
    if (portfolioFactor !== 1) {
      setPortfolio((prev) => Math.max(0, Math.round(prev * portfolioFactor)))
    }
    if (logEntries.length > 0 || completionEntries.length > 0) {
      setOperations((prev) => [...logEntries, ...completionEntries, ...prev].slice(0, 18))
    }

    wearQueue.forEach((wearItem) => {
      wearVehicle(wearItem.vehicleId, wearItem.wearAmount, wearItem.riskContext, wearItem.source)
    })
  }
  useEffect(() => {
    settleDueEventsRef.current = settleDueEvents
  })

  useEffect(() => {
    if (!wsConnected) {
      return undefined
    }

    const wsIntervalId = window.setInterval(() => {
      wsTickRef.current += 1
      const tick = wsTickRef.current
      const now = gameTimeRef.current

      const pushSocketEvent = (type, text, atTime = now) => {
        const eventId = `ws-${wsEventCounterRef.current}`
        wsEventCounterRef.current += 1

        setSocketFeed((prev) =>
          [
            {
              id: eventId,
              type,
              text,
              at: formatGameClock(atTime),
            },
            ...prev,
          ].slice(0, 24),
        )
      }

      const simulatedLatency = 24 + Math.round(deterministicNoise(`${lobbyRegion}-${tick}-latency`) * 92)
      setWsLatencyMs(simulatedLatency)

      let raisedTenderTitle = ''
      let raisedAmount = 0
      setTenderBoard((prev) => {
        let updatedAny = false
        const updated = prev.map((tender) => {
          if (tender.status !== 'open' || tender.closeAt <= now) {
            return tender
          }

          const shouldRaise = deterministicNoise(`${tender.id}-${tick}-ws-trigger`) > 0.63
          if (!shouldRaise) {
            return tender
          }

          const increment = Math.max(
            5000,
            Math.round(
              tender.minBid *
                (0.004 + deterministicNoise(`${tender.id}-${tick}-ws-increment`) * tender.bidStepRate),
            ),
          )

          updatedAny = true
          if (!raisedTenderTitle) {
            raisedTenderTitle = tender.title
            raisedAmount = increment
          }

          return {
            ...tender,
            rivalBid: tender.rivalBid + increment,
          }
        })

        return updatedAny ? updated : prev
      })

      setLobbyPlayers((prev) =>
        prev.map((player) => {
          const simulatedPing = 24 + Math.round(deterministicNoise(`${player.id}-${tick}-ping`) * 94)

          if (player.isYou) {
            return {
              ...player,
              pingMs: Math.max(16, Math.round(simulatedLatency * 0.72)),
            }
          }

          return {
            ...player,
            ready: deterministicNoise(`${player.id}-${tick}-ready`) > 0.42,
            pingMs: simulatedPing,
          }
        }),
      )

      if (raisedTenderTitle) {
        pushSocketEvent('bid', `${raisedTenderTitle}: rakip teklif +${formatMoney(raisedAmount)}.`)
      } else if (tick % 2 === 0) {
        pushSocketEvent('heartbeat', `${lobbyRegion} websocket heartbeat alindi.`)
      }

      if (tick % 3 === 0) {
        const botSpeaker = lobbyRosterSeed[1 + (tick % (lobbyRosterSeed.length - 1))]
        const chatId = `chat-${lobbyChatCounterRef.current}`
        lobbyChatCounterRef.current += 1

        setLobbyChat((prev) =>
          [
            {
              id: chatId,
              author: botSpeaker.company,
              text: 'Ihale masasi hizlandi, herkes teminatini hazir tutsun.',
              at: formatGameClock(now),
            },
            ...prev,
          ].slice(0, 24),
        )
      }
    }, 2500)

    return () => {
      window.clearInterval(wsIntervalId)
    }
  }, [lobbyRegion, wsConnected])

  const toggleSocketConnection = () => {
    setWsConnected((prev) => {
      const next = !prev
      const eventId = `ws-${wsEventCounterRef.current}`
      wsEventCounterRef.current += 1

      setSocketFeed((feed) =>
        [
          {
            id: eventId,
            type: 'system',
            text: next ? 'WebSocket yeniden baglandi.' : 'WebSocket baglantisi gecici olarak kapatildi.',
            at: formatGameClock(gameTimeRef.current),
          },
          ...feed,
        ].slice(0, 24),
      )

      return next
    })
  }

  const toggleReadyState = () => {
    let nextReady = false
    setLobbyPlayers((prev) =>
      prev.map((player) => {
        if (!player.isYou) {
          return player
        }

        nextReady = !player.ready
        return {
          ...player,
          ready: nextReady,
        }
      }),
    )

    const eventId = `ws-${wsEventCounterRef.current}`
    wsEventCounterRef.current += 1
    setSocketFeed((feed) =>
      [
        {
          id: eventId,
          type: 'lobby',
          text: nextReady ? 'Senin Koop hazir durumuna gecti.' : 'Senin Koop hazir durumundan cikti.',
          at: formatGameClock(gameTimeRef.current),
        },
        ...feed,
      ].slice(0, 24),
    )
  }

  const sendLobbyMessage = () => {
    const trimmedMessage = lobbyChatInput.trim()
    if (!trimmedMessage) {
      return
    }

    const chatId = `chat-${lobbyChatCounterRef.current}`
    lobbyChatCounterRef.current += 1
    const eventId = `ws-${wsEventCounterRef.current}`
    wsEventCounterRef.current += 1

    setLobbyChat((prev) =>
      [
        {
          id: chatId,
          author: 'Sen',
          text: trimmedMessage,
          at: formatGameClock(gameTimeRef.current),
        },
        ...prev,
      ].slice(0, 24),
    )
    setSocketFeed((feed) =>
      [
        {
          id: eventId,
          type: 'chat',
          text: `Lobi mesaji gonderildi: "${trimmedMessage}"`,
          at: formatGameClock(gameTimeRef.current),
        },
        ...feed,
      ].slice(0, 24),
    )
    setLobbyChatInput('')
  }

  const startLobbyMatchmaking = () => {
    if (!youAreReady) {
      const eventId = `ws-${wsEventCounterRef.current}`
      wsEventCounterRef.current += 1
      setSocketFeed((feed) =>
        [
          {
            id: eventId,
            type: 'warning',
            text: 'Eslesme icin once kendi hazir durumunu acmalisin.',
            at: formatGameClock(gameTimeRef.current),
          },
          ...feed,
        ].slice(0, 24),
      )
      return
    }

    const eventId = `ws-${wsEventCounterRef.current}`
    wsEventCounterRef.current += 1
    setSocketFeed((feed) =>
      [
        {
          id: eventId,
          type: 'lobby',
          text: `${lobbyRegion} icin eslesme araniyor. Hazir oyuncu: ${readyPlayerCount}/${lobbyPlayers.length}.`,
          at: formatGameClock(gameTimeRef.current),
        },
        ...feed,
      ].slice(0, 24),
    )
  }

  const queueTransitJob = ({
    title,
    routeLabel,
    source,
    bookingCost: dispatchCost,
    etaSec,
    riskScore,
    projectedProfit,
    grossRevenue,
    fuelCost,
    maintenanceCost,
    incidentLabel,
    vehicleName,
    vehicleId,
    deadlineAt = null,
    collateralLocked = 0,
    penaltyRate = 0.3,
  }) => {
    if (cash < dispatchCost) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${title} baslatilamadi`,
            note: 'Nakit yetersiz. Is emri acmak icin daha fazla likidite gerekli.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return false
    }

    if (vehicleFailures[vehicleId] ?? false) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${vehicleName} arizasi`,
            note: 'Arac arizali oldugu icin sefere cikis engellendi. Once bakim yapmalisin.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return false
    }

    const jobId = `job-${nextId()}`

    setCash((prev) => Math.round(prev - dispatchCost))
    setInTransitJobs((prev) =>
      [
        {
          id: jobId,
          title,
          source,
          routeLabel,
          etaAt: gameTime + etaSec,
          deadlineAt,
          riskScore,
          projectedProfit,
          grossRevenue,
          fuelCost,
          maintenanceCost,
          bookingCost: dispatchCost,
          incidentLabel,
          vehicleName,
          vehicleId,
          collateralLocked,
          penaltyRate,
        },
        ...prev,
      ].slice(0, 12),
    )
    setOperations((prev) =>
      [
        {
          id: nextId(),
          title: `${title} yola cikti`,
          note: `${vehicleName} ile cikis yapildi. Tahmini teslimat: ${formatCountdown(etaSec)}.`,
          delta: -dispatchCost,
        },
        ...prev,
      ].slice(0, 18),
    )

    return true
  }

  const runOperation = () => {
    settleDueEvents(gameTime)

    if (!selectedRoute || !origin || !destination) {
      return
    }

    if (selectedVehicleHealth < 22 || selectedVehicleFault) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${selectedVehicle.name} bakim bekliyor`,
            note: selectedVehicleFault
              ? 'Arac arizali. Sefer oncesi bakim merkezinde ariza gidermelisin.'
              : 'Arac sagligi kritik seviyede. Sefer oncesi bakim yapmalisin.',
            delta: 0,
          },
          ...prev,
      ].slice(0, 18),
      )
      return
    }

    if (inTransitJobs.length >= 12) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: 'Transit limiti dolu',
            note: 'Yeni sefer acmadan once bazi teslimatlari sonuclandir.',
            delta: 0,
          },
          ...prev,
      ].slice(0, 18),
      )
      return
    }

    const started = queueTransitJob({
      title: `${origin.name} -> ${destination.name}`,
      routeLabel: `${origin.name} -> ${destination.name}`,
      source: 'manual',
      bookingCost,
      etaSec: deliveryEtaSec,
      riskScore,
      projectedProfit,
      grossRevenue,
      fuelCost,
      maintenanceCost,
      incidentLabel: scenario.incidentLabel,
      vehicleName: selectedVehicle.name,
      vehicleId: selectedVehicle.id,
    })

    if (!started) {
      return
    }

    const wearAmount = clamp(
      distanceKm / 500 + (cargoTons / selectedVehicle.capacity) * 11 + scenarioRiskByMode * 14,
      5,
      24,
    )
    wearVehicle(selectedVehicle.id, wearAmount, scenarioRiskByMode, 'manual-route')
    setLeaguePoints((prev) => Math.round(prev + 4))
  }

  const placeTenderBid = (tenderId) => {
    settleDueEvents(gameTime)

    const tender = tenderBoard.find((item) => item.id === tenderId)
    if (!tender) {
      return
    }

    const isTenderOpen = tender.status === 'open' && tender.closeAt > gameTime
    if (!isTenderOpen) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `Ihale kapandi: ${tender.title}`,
            note: 'Bu ihalenin teklif suresi doldu veya baska bir ekip tarafindan alindi.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return
    }

    const tenderVehicle = fleetByMode[tender.mode][0]
    const vehicleHealth = vehicleCondition[tenderVehicle.id] ?? 100
    if (vehicleHealth < 22 || (vehicleFailures[tenderVehicle.id] ?? false)) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${tender.title} teklif reddedildi`,
            note: `${tenderVehicle.name} bakimda oldugu icin ihaleye girilemedi.`,
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return
    }

    const minCollateral = Math.round(tender.minBid * tender.minCollateralRate)
    const additionalBond = Math.max(0, minCollateral - (tender.bondLocked ?? 0))
    if (cash < additionalBond) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${tender.title} teklif reddedildi`,
            note: `Asgari teminat icin ${formatMoney(additionalBond)} daha gerekli.`,
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return
    }

    const raiseAmount = Math.round(
      tender.minBid *
        (tender.bidStepRate + deterministicNoise(`${tender.id}-${gameTime}-player-raise`) * 0.015),
    )
    const nextPlayerBid = tender.playerBid + raiseAmount

    setCash((prev) => prev - additionalBond)
    setEscrowedBond((prev) => prev + additionalBond)
    setTenderBoard((prev) =>
      prev.map((item) =>
        item.id === tenderId
          ? {
              ...item,
              bondLocked: minCollateral,
              hasPlayerBid: true,
              playerBid: nextPlayerBid,
            }
          : item,
      ),
    )
    setOperations((prev) =>
      [
        {
          id: nextId(),
          title: `Canli teklif: ${tender.title}`,
          note: `Teklifin ${formatMoney(nextPlayerBid)} seviyesine cikarildi. Asgari teminat kilitlendi.`,
          delta: -additionalBond,
        },
        ...prev,
      ].slice(0, 18),
    )
    const eventId = `ws-${wsEventCounterRef.current}`
    wsEventCounterRef.current += 1
    setSocketFeed((feed) =>
      [
        {
          id: eventId,
          type: 'bid',
          text: `${tender.title} ihalende teklif ${formatMoney(nextPlayerBid)} seviyesine cikarildi.`,
          at: formatGameClock(gameTimeRef.current),
        },
        ...feed,
      ].slice(0, 24),
    )
  }

  const performMaintenance = (targetVehicleId) => {
    settleDueEvents(gameTime)

    const vehicle = vehicleById[targetVehicleId]
    if (!vehicle) {
      return
    }

    const currentHealth = vehicleCondition[targetVehicleId] ?? 100
    const hasFailure = vehicleFailures[targetVehicleId] ?? false
    if (currentHealth > 96 && !hasFailure) {
      return
    }

    const serviceCost = Math.round(vehicle.maintenanceCost * (0.22 + (1 - currentHealth / 100) * 0.62))
    if (cash < serviceCost) {
      setOperations((prev) =>
        [
          {
            id: nextId(),
            title: `${vehicle.name} bakimi ertelendi`,
            note: 'Servis masrafini karsilamak icin nakit yetersiz.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 18),
      )
      return
    }

    const recovery = clamp(Math.round((100 - currentHealth) * 0.82 + 7), 8, 100)

    setCash((prev) => prev - serviceCost)
    setVehicleCondition((prev) => ({
      ...prev,
      [targetVehicleId]: clamp((prev[targetVehicleId] ?? 100) + recovery, 0, 100),
    }))
    setVehicleFailures((prev) => ({
      ...prev,
      [targetVehicleId]: false,
    }))
    setOperations((prev) =>
      [
        {
          id: nextId(),
          title: `${vehicle.name} bakimi tamamlandi`,
          note: hasFailure
            ? `Ariza giderildi ve arac sagligi +${recovery.toFixed(0)} puan yenilendi.`
            : `Arac sagligi +${recovery.toFixed(0)} puan yenilendi.`,
          delta: -serviceCost,
        },
        ...prev,
      ].slice(0, 18),
    )
  }

  const syncSimulation = () => {
    settleDueEvents(gameTime)
  }

  const advanceSimulation = () => {
    const nextTime = gameTime + 30
    setGameTime(nextTime)
    settleDueEvents(nextTime)
  }

  const takeLoan = () => {
    settleDueEvents(gameTime)

    const principal = 400000
    const debtIncrease = Math.round(principal * (1 + loanRate * 0.22))

    setCash((prev) => prev + principal)
    setDebt((prev) => prev + debtIncrease)
    setOperations((prev) =>
      [
        {
          id: nextId(),
          title: 'Banka Kredisi',
          note: `Likidite icin ${formatMoney(principal)} kredi alindi.`,
          delta: principal,
        },
        ...prev,
      ].slice(0, 18),
    )
  }

  const payDebt = () => {
    settleDueEvents(gameTime)

    const payment = Math.min(debt, Math.round(cash * 0.35))

    if (payment < 50000) {
      return
    }

    setCash((prev) => prev - payment)
    setDebt((prev) => Math.max(0, prev - payment))
    setOperations((prev) =>
      [
        {
          id: nextId(),
          title: 'Borclanma Azaltildi',
          note: `Kredi anaparasina ${formatMoney(payment)} odeme gecildi.`,
          delta: -payment,
        },
        ...prev,
      ].slice(0, 18),
    )
  }

  return (
    <div className="app">
      <div className="phone-shell">
        <header className="hero">
          <p className="eyebrow">Ticarium benzeri mobil frontend demo</p>
          <h1>Kuresel Ticaret Savaslari</h1>
          <p>
            Gercek sehirler, gercek limanlar, kriz sezonlari ve zor ekonomi dengesi
            ile mobil strateji oyunu prototipi.
          </p>
          <div className="clock-line">
            <span>Sunucu saati: {formatGameClock(gameTime)}</span>
            <strong>{inTransitJobs.length} aktif transit</strong>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span>Nakit</span>
            <strong>{formatMoney(cash)}</strong>
          </article>
          <article className="stat-card">
            <span>Borc</span>
            <strong>{formatMoney(debt)}</strong>
          </article>
          <article className="stat-card">
            <span>Enflasyon</span>
            <strong>{formatPercent(inflation)}</strong>
          </article>
          <article className="stat-card">
            <span>Iflas Riski</span>
            <strong>{bankruptcyRisk.toFixed(1)} / 100</strong>
          </article>
          <article className="stat-card">
            <span>Acik Ihale</span>
            <strong>{tenderRows.filter((tender) => tender.isOpen).length}</strong>
          </article>
          <article className="stat-card">
            <span>Kilitli Teminat</span>
            <strong>{formatMoney(escrowedBond)}</strong>
          </article>
          <article className="stat-card">
            <span>Secili Arac Sagligi</span>
            <strong>{selectedVehicleHealth.toFixed(0)} / 100</strong>
          </article>
          <article className="stat-card">
            <span>Bakim Arizasi</span>
            <strong>{faultedVehicleCount} arac</strong>
          </article>
        </section>

        <nav className="tab-row" aria-label="Mobil oyun menusu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="content-area">
          {activeTab === 'dashboard' && (
            <>
              <section className="panel">
                <div className="panel-title-row">
                  <h2>Kriz Sezonu</h2>
                  <span className="badge">{scenario.name}</span>
                </div>
                <div className="chip-grid">
                  {scenarioCatalog.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={scenarioId === item.id ? 'chip active' : 'chip'}
                      onClick={() => setScenarioId(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <p className="muted">{scenario.summary}</p>
              </section>

              <section className="panel">
                <h2>Dunya Haritasi ve Ticaret Merkezleri</h2>
                <div className="map-stage">
                  <img src={worldMapImg} alt="Dunya ticaret haritasi" />
                  <svg className="map-links" viewBox="0 0 100 100" aria-hidden="true">
                    {mapRoutes.map((route) => (
                      <line
                        key={`${route.id}-link`}
                        x1={route.fromCity.mapX}
                        y1={route.fromCity.mapY}
                        x2={route.toCity.mapX}
                        y2={route.toCity.mapY}
                      />
                    ))}
                  </svg>
                  {cityCatalog.map((city) => (
                    <div
                      key={city.id}
                      className="map-marker"
                      style={{ left: `${city.mapX}%`, top: `${city.mapY}%` }}
                    >
                      <span>
                        {city.name}, {city.country}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="city-grid">
                  {cityCatalog.map((city) => (
                    <article key={city.id} className="city-card">
                      <h3>{city.name}</h3>
                      <p>{city.country}</p>
                      <p>{city.port}</p>
                      <p>Vergi: {formatPercent(city.taxRate)}</p>
                      <p>Risk: {formatPercent(city.risk)}</p>
                    </article>
                  ))}
                </div>
                <div className="route-list">
                  {routeCatalog.map((route) => {
                    const from = cityById[route.from]
                    const to = cityById[route.to]

                    return (
                      <div key={route.id} className="route-item">
                        <div>
                          <strong>
                            {from.name}
                            {' -> '}
                            {to.name}
                          </strong>
                          <p>{route.distanceKm.toLocaleString('tr-TR')} km</p>
                        </div>
                        <span>{route.modes.join(' / ')}</span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="panel">
                <h2>Ekonomi Modeli (Zor Mod)</h2>
                <ul className="bullet-list">
                  <li>Kur dalgalanmasi: USD/TRY {usdTry.toFixed(2)}</li>
                  <li>Kredi faizi: {formatPercent(loanRate)}</li>
                  <li>Yatirimci baskisi: {investorPressure.toFixed(1)} / 100</li>
                  <li>Ihale sureleri akar, teslimatlar ancak transit suresi bitince sonuclanir.</li>
                  <li>Depolama, sigorta, personel ve bakim her turda yansitilir.</li>
                </ul>
              </section>
            </>
          )}

          {activeTab === 'trade' && (
            <>
              <section className="panel">
                <h2>Ticaret Operasyonu Planla</h2>
                <div className="form-grid">
                  <label>
                    Tasima Modu
                    <select value={mode} onChange={(event) => setMode(event.target.value)}>
                      <option value="land">Kara</option>
                      <option value="sea">Deniz</option>
                      <option value="air">Hava</option>
                    </select>
                  </label>

                  <label>
                    Rota
                    <select
                      value={normalizedRouteId}
                      onChange={(event) => setRouteId(event.target.value)}
                    >
                      {availableRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {cityById[route.from].name}
                          {' -> '}
                          {cityById[route.to].name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Arac/Filo
                    <select
                      value={normalizedVehicleId}
                      onChange={(event) => setVehicleId(event.target.value)}
                    >
                      {availableVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} (Kapasite {vehicle.capacity} ton)
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Urun
                    <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                      {productCatalog.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                          {product.illegal ? ' - ozel risk' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="vehicle-visual-wrap">
                  <img
                    src={vehicleVisualByMode[mode]}
                    alt={`${modeLabels[mode]} arac goruntusu`}
                    className="vehicle-visual"
                  />
                  <div className="vehicle-visual-meta">
                    <p>{selectedVehicle.name}</p>
                    <strong>Bakim: {selectedVehicleHealth.toFixed(0)} / 100</strong>
                    {selectedVehicleFault && <em className="warning-text">Ariza aktif: Bakim gerekli</em>}
                    <span>Tahmini teslimat: {formatCountdown(deliveryEtaSec)}</span>
                  </div>
                </div>

                <label className="range-control">
                  Yuk Miktari: <strong>{cargoTons} ton</strong>
                  <input
                    type="range"
                    min="20"
                    max={selectedVehicle.capacity}
                    value={cargoTons}
                    onChange={(event) => setCargoTons(Number(event.target.value))}
                  />
                </label>

                <div className="toggle-row">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={insuranceEnabled}
                      onChange={(event) => setInsuranceEnabled(event.target.checked)}
                    />
                    Sigorta aktif
                  </label>

                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={escortEnabled}
                      disabled={mode !== 'sea'}
                      onChange={(event) => setEscortEnabled(event.target.checked)}
                    />
                    Askeri eskort
                  </label>
                </div>
              </section>

              <section className="panel">
                <h2>Operasyon Ongorusu</h2>
                <div className="metrics-grid">
                  <article>
                    <span>Brut Gelir</span>
                    <strong>{formatMoney(grossRevenue)}</strong>
                  </article>
                  <article>
                    <span>Toplam Maliyet</span>
                    <strong>{formatMoney(totalCost)}</strong>
                  </article>
                  <article>
                    <span>Beklenen Kar/Zarar</span>
                    <strong className={projectedProfit >= 0 ? 'positive' : 'negative'}>
                      {formatMoney(projectedProfit)}
                    </strong>
                  </article>
                  <article>
                    <span>Risk Skoru</span>
                    <strong>{(riskScore * 100).toFixed(1)} / 100</strong>
                  </article>
                  <article>
                    <span>Cikis Teminati</span>
                    <strong>{formatMoney(bookingCost)}</strong>
                  </article>
                  <article>
                    <span>Teslimat Suresi</span>
                    <strong>{formatCountdown(deliveryEtaSec)}</strong>
                  </article>
                </div>

                <button type="button" className="primary-btn" onClick={runOperation}>
                  Seferi Baslat (Transit Kuyrugu)
                </button>
                <p className="muted">
                  Aktif mod: {modeLabels[mode]} | Sezon: {scenario.name}
                </p>
              </section>

              <section className="panel">
                <div className="panel-title-row">
                  <h2>Transit Kuyrugu ve Teslimatlar</h2>
                  <span className="badge">{inTransitJobs.length} aktif</span>
                </div>
                <div className="button-row">
                  <button type="button" className="ghost-btn compact-btn" onClick={syncSimulation}>
                    Teslimatlari Guncelle
                  </button>
                  <button type="button" className="ghost-btn compact-btn" onClick={advanceSimulation}>
                    Simulasyonu +30 sn
                  </button>
                </div>
                {transitRows.length === 0 && (
                  <p className="muted">Aktif transit yok. Yeni sefer veya ihale baslatabilirsin.</p>
                )}
                <div className="transit-list">
                  {transitRows.map((job) => (
                    <article key={job.id} className="transit-item">
                      <div>
                        <strong>{job.title}</strong>
                        <p>
                          {job.routeLabel} | {job.vehicleName} | Kaynak:{' '}
                          {job.source === 'tender' ? 'Ihale' : 'Serbest ticaret'}
                        </p>
                      </div>
                      <span className={job.timeLeftSec <= 20 ? 'countdown urgent' : 'countdown'}>
                        {formatCountdown(job.timeLeftSec)}
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title-row">
                  <h2>WebSocket Ihale Akisi</h2>
                  <span className={wsConnected ? 'socket-status live' : 'socket-status down'}>
                    {wsConnected ? 'Bagli' : 'Kesik'} | {wsLatencyMs} ms
                  </span>
                </div>
                <div className="button-row">
                  <button type="button" className="ghost-btn compact-btn" onClick={toggleSocketConnection}>
                    {wsConnected ? 'Socketi Durdur' : 'Socketi Bagla'}
                  </button>
                  <button type="button" className="ghost-btn compact-btn" onClick={startLobbyMatchmaking}>
                    Eslesme Sinyali Gonder
                  </button>
                </div>
                <div className="socket-feed-list">
                  {socketFeed.slice(0, 6).map((event) => (
                    <article key={event.id} className="socket-feed-item">
                      <div>
                        <strong>{event.type.toUpperCase()}</strong>
                        <p>{event.text}</p>
                      </div>
                      <span>{event.at}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Sure Sinirli Ihale Masasi</h2>
                <p className="muted">
                  Asgari teminat yatirmadan teklif gecerli olmaz. Rakipler canli artirim yapar;
                  sure doldugunda en yuksek teklif kontrati alir.
                </p>
                <div className="auction-list">
                  {tenderRows.map((tender) => {
                    const route = routeCatalog.find((entry) => entry.id === tender.routeId)
                    const from = route ? cityById[route.from] : null
                    const to = route ? cityById[route.to] : null

                    return (
                      <article key={tender.id} className="auction-item">
                        <div>
                          <strong>{tender.title}</strong>
                          <p>
                            {from?.name} {' -> '} {to?.name} | {modeLabels[tender.mode]} |{' '}
                            {tender.tons} ton
                          </p>
                          <p>Min. bedel: {formatMoney(tender.minBid)}</p>
                          <p>Asgari teminat: {formatMoney(tender.minCollateral)}</p>
                          <p>
                            Oyuncu teklifi: {formatMoney(tender.playerBid)} | Rakip teklifi:{' '}
                            {formatMoney(tender.rivalBid)}
                          </p>
                        </div>
                        <div className="auction-meta">
                          <span
                            className={
                              tender.isOpen
                                ? tender.timeLeftSec < 20
                                  ? 'countdown urgent'
                                  : 'countdown'
                                : 'countdown closed'
                            }
                          >
                            {tender.isOpen ? formatCountdown(tender.timeLeftSec) : 'Kapandi'}
                          </span>
                          <span>Teslimat penceresi: {formatCountdown(tender.deliveryWindowSec)}</span>
                          <span className={tender.playerLeading ? 'leader player' : 'leader rival'}>
                            Lider: {tender.playerLeading ? 'Senin Koop' : 'Rakip oyuncu'}
                          </span>
                          <button
                            type="button"
                            className="ghost-btn compact-btn"
                            disabled={!tender.isOpen}
                            onClick={() => placeTenderBid(tender.id)}
                          >
                            Teklif Arttir
                          </button>
                          <p className="muted mini">
                            {tender.status === 'awarded'
                              ? `Kazanan: ${tender.winner} | Ceza: ${formatMoney(tender.penaltyPaid)}`
                              : tender.status === 'failed'
                                ? `Kontrat iptali | Ceza: ${formatMoney(tender.penaltyPaid)}`
                              : tender.status === 'expired'
                                ? `Kapanis: ${tender.winner} | Ceza: ${formatMoney(tender.penaltyPaid)}`
                                : tender.isOpen
                                  ? 'Durum: Acik'
                                  : 'Sure doldu, guncelle'}
                          </p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <section className="panel">
                <h2>Arac Bakim Merkezi</h2>
                <div className="maintenance-list">
                  {fleetRows.map((vehicle) => (
                    <article key={vehicle.id} className="maintenance-item">
                      <div>
                        <strong>{vehicle.name}</strong>
                        <p>Bakim maliyeti: {formatMoney(vehicle.serviceCost)}</p>
                        {vehicle.hasFailure && <p className="fault-text">Durum: Ariza aktif</p>}
                      </div>
                      <div className="maintenance-actions">
                        <div className="health-track">
                          <span style={{ width: `${vehicle.health}%` }} />
                        </div>
                        <p>{vehicle.health.toFixed(0)} / 100</p>
                        <button
                          type="button"
                          className="ghost-btn compact-btn"
                          onClick={() => performMaintenance(vehicle.id)}
                        >
                          {vehicle.hasFailure ? 'Arizayi Gider' : 'Bakim Yap'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Son Operasyonlar</h2>
                <div className="log-list">
                  {operations.map((item) => (
                    <article key={item.id} className="log-item">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.note}</p>
                      </div>
                      <span className={item.delta >= 0 ? 'positive' : 'negative'}>
                        {formatMoney(item.delta)}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'lobby' && (
            <>
              <section className="panel">
                <div className="panel-title-row">
                  <h2>Cok Oyunculu Lobi Paneli</h2>
                  <span className={wsConnected ? 'socket-status live' : 'socket-status down'}>
                    {wsConnected ? 'Socket online' : 'Socket offline'}
                  </span>
                </div>
                <div className="lobby-controls">
                  <label>
                    Sunucu Havuzu
                    <select value={lobbyRegion} onChange={(event) => setLobbyRegion(event.target.value)}>
                      {lobbyRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="button-row">
                    <button type="button" className="primary-btn no-top" onClick={toggleReadyState}>
                      {youAreReady ? 'Haziri Kapat' : 'Hazir Ol'}
                    </button>
                    <button type="button" className="ghost-btn" onClick={startLobbyMatchmaking}>
                      Eslesme Ara
                    </button>
                  </div>
                </div>
                <p className="muted">
                  Hazir oyuncu: {readyPlayerCount}/{lobbyPlayers.length} | Gecikme: {wsLatencyMs} ms
                </p>
              </section>

              <section className="panel">
                <h2>Lobi Oyunculari</h2>
                <div className="lobby-player-list">
                  {lobbyPlayers.map((player) => (
                    <article key={player.id} className="lobby-player-item">
                      <div>
                        <strong>{player.company}</strong>
                        <p>
                          Kaptan: {player.captain} | MMR: {player.leagueMmr}
                        </p>
                      </div>
                      <div className="lobby-player-meta">
                        <span>{player.pingMs} ms</span>
                        <span className={player.ready ? 'ready-badge on' : 'ready-badge off'}>
                          {player.ready ? 'Hazir' : 'Beklemede'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Lobi Sohbeti</h2>
                <div className="lobby-chat-input">
                  <input
                    type="text"
                    value={lobbyChatInput}
                    onChange={(event) => setLobbyChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        sendLobbyMessage()
                      }
                    }}
                    placeholder="Lobiye mesaj gonder..."
                  />
                  <button type="button" className="ghost-btn compact-btn" onClick={sendLobbyMessage}>
                    Gonder
                  </button>
                </div>
                <div className="chat-list">
                  {lobbyChat.map((message) => (
                    <article key={message.id} className="chat-item">
                      <div>
                        <strong>{message.author}</strong>
                        <p>{message.text}</p>
                      </div>
                      <span>{message.at}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>WebSocket Event Akisi</h2>
                <div className="socket-feed-list">
                  {socketFeed.map((event) => (
                    <article key={event.id} className="socket-feed-item">
                      <div>
                        <strong>{event.type.toUpperCase()}</strong>
                        <p>{event.text}</p>
                      </div>
                      <span>{event.at}</span>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'coop' && (
            <>
              <section className="panel">
                <h2>Kooperatif Sirketler Birligi</h2>
                <div className="profile-highlight">
                  <img src={coopAvatarImg} alt="Koop profil rozeti" />
                  <div>
                    <strong>Senin Koop Profili: KureTrade Collective</strong>
                    <p>
                      Ortak filo, ortak depo ve ihale havuzu ile cok nokta teslimat zinciri
                      yonetiliyor.
                    </p>
                  </div>
                </div>
                <div className="coop-kpis">
                  <article>
                    <span>Ortak Filo Degeri</span>
                    <strong>{formatMoney(6900000)}</strong>
                  </article>
                  <article>
                    <span>Ortak Depo Kapasitesi</span>
                    <strong>14.500 ton</strong>
                  </article>
                  <article>
                    <span>Kuresel Siralama Puani</span>
                    <strong>{leaguePoints}</strong>
                  </article>
                </div>
              </section>

              <section className="panel">
                <h2>Gelir Paylasim Zinciri</h2>
                <p className="muted">
                  Ornek akis: Shanghai dan yuk cikiyor, Istanbul limaninda aktarim, Hamburg a
                  kara dagitimi.
                </p>
                <div className="member-list">
                  {cooperativeMembers.map((member) => (
                    <article key={member.id} className="member-item">
                      <div>
                        <strong>{member.company}</strong>
                        <p>{member.mission}</p>
                      </div>
                      <span>{Math.round(member.incomeShare * 100)}%</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Ortak Savunma ve Ihale</h2>
                <ul className="bullet-list">
                  <li>Denizde korsan riskine karsi ortak eskort butcesi.</li>
                  <li>Buyuk ihalelere katilim icin birlesik teminat havuzu.</li>
                  <li>Uyeler arasi canli varlik transferi ve acil destek fonu.</li>
                </ul>
              </section>
            </>
          )}

          {activeTab === 'profiles' && (
            <>
              <section className="panel">
                <h2>Oyuncu Profilleri</h2>
                <div className="profile-grid">
                  {profileCards.map((profile) => (
                    <article key={profile.id} className="profile-card">
                      <img src={playerAvatarImg} alt="Oyuncu profil avatar" />
                      <div>
                        <strong>{profile.name}</strong>
                        <p>{profile.role}</p>
                        <p>Uzmanlik: {profile.focus}</p>
                        <p>Risk stili: {profile.riskStyle}</p>
                        <p>Puan: {profile.rating} | Varlik: {formatMoney(profile.valuation)}</p>
                        {profile.currentRank !== '-' && <p>Lig sirasi: #{profile.currentRank}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Koop Profilleri</h2>
                <div className="profile-grid">
                  {cooperativeCards.map((coop) => (
                    <article key={coop.id} className="profile-card">
                      <img src={coopAvatarImg} alt="Kooperatif profil armalari" />
                      <div>
                        <strong>{coop.name}</strong>
                        <p>Bolge: {coop.region}</p>
                        <p>Uzmanlik: {coop.specialty}</p>
                        <p>Uye sayisi: {coop.members}</p>
                        <p>Rekabet skoru: {coop.score}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'finance' && (
            <>
              <section className="panel">
                <h2>Finans Merkezi</h2>
                <div className="metrics-grid">
                  <article>
                    <span>USD/TRY</span>
                    <strong>{usdTry.toFixed(2)}</strong>
                  </article>
                  <article>
                    <span>EUR/USD</span>
                    <strong>{eurUsd.toFixed(3)}</strong>
                  </article>
                  <article>
                    <span>Borsa Portfoyu</span>
                    <strong>{formatMoney(portfolio)}</strong>
                  </article>
                  <article>
                    <span>Kredi Faizi</span>
                    <strong>{formatPercent(loanRate)}</strong>
                  </article>
                </div>

                <div className="button-row">
                  <button type="button" className="primary-btn" onClick={takeLoan}>
                    Kredi Al
                  </button>
                  <button type="button" className="ghost-btn" onClick={payDebt}>
                    Borc Ode
                  </button>
                </div>
              </section>

              <section className="panel">
                <h2>Kuresel Borsa ve Hisse Takibi</h2>
                <div className="stock-list">
                  {stockBoard.map((stock) => (
                    <article key={stock.name} className="stock-item">
                      <div>
                        <strong>{stock.name}</strong>
                        <p>{stock.value.toFixed(1)} puan</p>
                      </div>
                      <span className={stock.change >= 0 ? 'positive' : 'negative'}>
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change.toFixed(1)}%
                      </span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Risk Uyarisi</h2>
                <ul className="bullet-list">
                  <li>Vergi kacirma tespit edilirse para cezasi ve itibar kaybi uygulanir.</li>
                  <li>Yuksek borc + negatif nakit, iflas koruma surecini tetikler.</li>
                  <li>Yatirimci baskisi 80 uzeri oldugunda halka arz zorlasir.</li>
                </ul>
              </section>
            </>
          )}

          {activeTab === 'league' && (
            <>
              <section className="panel">
                <h2>Kuresel Rekabet Ligi</h2>
                <div className="ranking-list">
                  {leagueTable.map((entry) => (
                    <article key={entry.name} className="ranking-item">
                      <div>
                        <strong>
                          #{entry.rank} {entry.name}
                        </strong>
                        <p>{entry.style}</p>
                      </div>
                      <span>{entry.points} puan</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>Rekabet Sistemi</h2>
                <ul className="bullet-list">
                  <li>Ihale savaslari ve liman kapasitesi kilitlenmesi.</li>
                  <li>Ihale sure siniri sebebiyle agresif teklif planlamasi gerekir.</li>
                  <li>Stratejik fiyat kirma ve tekellesme denemeleri.</li>
                  <li>Legal/illegal ekonomik sabotaj girisimleri.</li>
                </ul>
              </section>

              <section className="panel">
                <h2>Oyun Modlari</h2>
                <div className="mode-cards">
                  <article>
                    <strong>Kuresel Lig</strong>
                    <p>Tek tabloda tum dunya ile rekabet.</p>
                  </article>
                  <article>
                    <strong>Bolgesel Sunucular</strong>
                    <p>Yerel ekonomi kosullarina gore ayri sezonlar.</p>
                  </article>
                  <article>
                    <strong>Hardcore Ekonomi</strong>
                    <p>Yuksek faiz, yuksek iflas riski, dusuk marj.</p>
                  </article>
                  <article>
                    <strong>Kriz Sezonu</strong>
                    <p>Savas, petrol krizi veya finansal cokuste sinirli kaynak.</p>
                  </article>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
