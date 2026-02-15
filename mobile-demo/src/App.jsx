import { useEffect, useMemo, useState } from 'react'
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
  { id: 'coop', label: 'Koop' },
  { id: 'profiles', label: 'Profiller' },
  { id: 'finance', label: 'Finans' },
  { id: 'league', label: 'Lig' },
]

const cityCatalog = [
  {
    id: 'new-york',
    name: 'New York',
    port: 'Port of New York and New Jersey',
    taxRate: 0.18,
    risk: 0.14,
    demand: ['Elektronik', 'Tibbi Malzeme', 'Luks Arac'],
    policy: 'Denetim yogun',
    mapX: 20,
    mapY: 40,
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
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
    port: 'Port of Hamburg',
    taxRate: 0.16,
    risk: 0.12,
    demand: ['Tahil', 'Elektronik', 'Tibbi Malzeme'],
    policy: 'Yesil lojistik',
    mapX: 58,
    mapY: 32,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
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

const tenderCatalog = [
  {
    id: 'tender-1',
    title: 'Dubai Petrol Tedarik Ihalesi',
    routeId: 'dubai-istanbul',
    mode: 'sea',
    productId: 'petrol',
    tons: 520,
    minBid: 1750000,
    durationSec: 95,
    deliveryWindowSec: 100,
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
  },
  {
    id: 'tender-3',
    title: 'Tokyo Elektronik Hizli Hat',
    routeId: 'tokyo-shanghai',
    mode: 'air',
    productId: 'electronics',
    tons: 95,
    minBid: 1120000,
    durationSec: 140,
    deliveryWindowSec: 62,
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

const buildInitialTenderBoard = () =>
  tenderCatalog.map((tender, index) => ({
    ...tender,
    status: 'open',
    winner: null,
    awardedAt: null,
    closeAt: tender.durationSec + index * 28,
  }))

function App() {
  const cityById = useMemo(
    () => Object.fromEntries(cityCatalog.map((city) => [city.id, city])),
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
  const [gameTime, setGameTime] = useState(0)
  const [tenderBoard, setTenderBoard] = useState(() => buildInitialTenderBoard())
  const [inTransitJobs, setInTransitJobs] = useState([])
  const [vehicleCondition, setVehicleCondition] = useState(() =>
    Object.fromEntries(allVehicles.map((vehicle) => [vehicle.id, 100])),
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

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setGameTime((prev) => prev + 1)
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
          rating: Math.round(52 + Math.random() * 30),
          valuation: 850000 + Math.round(Math.random() * 650000),
        }
      }),
    [cash, leagueTable, reputation],
  )

  const cooperativeCards = useMemo(
    () =>
      cooperativeProfiles.map((coop, index) => ({
        ...coop,
        score: 1400 + index * 45 + Math.round(Math.random() * 18),
      })),
    [],
  )

  const tenderRows = useMemo(
    () =>
      tenderBoard.map((tender) => ({
        ...tender,
        timeLeftSec: Math.max(0, tender.closeAt - gameTime),
        isOpen: tender.status === 'open' && tender.closeAt > gameTime,
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
        }
      }),
    [vehicleCondition],
  )

  const settleDueEvents = (targetTime = gameTime) => {
    const expiredTenders = tenderBoard.filter(
      (tender) => tender.status === 'open' && tender.closeAt <= targetTime,
    )

    if (expiredTenders.length > 0) {
      setTenderBoard((prev) =>
        prev.map((tender, index) => {
          if (tender.status === 'open' && tender.closeAt <= targetTime) {
            return {
              ...tender,
              status: 'expired',
              winner: leagueOpponents[index % leagueOpponents.length].name,
            }
          }

          return tender
        }),
      )

      setOperations((prev) =>
        [
          ...expiredTenders.map((tender, index) => ({
            id: Date.now() + index,
            title: `Ihale kacirildi: ${tender.title}`,
            note: `Sure doldu, ${leagueOpponents[index % leagueOpponents.length].name} kontrati aldi.`,
            delta: 0,
          })),
          ...prev,
        ].slice(0, 14),
      )
    }

    const dueJobs = inTransitJobs.filter((job) => job.etaAt <= targetTime)
    if (dueJobs.length === 0) {
      return
    }

    let cashDelta = 0
    let debtAdjustment = 0
    let repAdjustment = 0
    let pointsAdjustment = 0
    let portfolioFactor = 1

    const completions = dueJobs.map((job, index) => {
      const incident = Math.random() < job.riskScore
      const variance = 0.9 + Math.random() * 0.2
      let delta = Math.round(job.projectedProfit * variance + job.bookingCost)
      let note = `${job.routeLabel} teslimati hedef surede tamamlandi.`

      if (incident) {
        const emergencyLoss = job.grossRevenue * (0.22 + Math.random() * 0.25)
        delta = -Math.round(Math.abs(job.fuelCost + job.maintenanceCost * 0.55 + emergencyLoss))
        note = `${job.routeLabel} seferinde ${job.incidentLabel} nedeniyle zarar yazildi.`
      }

      cashDelta += delta
      debtAdjustment += incident ? 9500 : -5000
      repAdjustment += incident ? -5 : 3
      pointsAdjustment += incident ? -10 : 18
      portfolioFactor *= 1 + (incident ? -0.008 : 0.011)

      return {
        id: Date.now() + 100 + index,
        title: `Teslimat Tamamlandi: ${job.title}`,
        note,
        delta,
      }
    })

    setCash((prev) => Math.round(prev + cashDelta))
    setDebt((prev) =>
      Math.max(0, Math.round(prev * (1 + (loanRate * dueJobs.length) / 5100) + debtAdjustment)),
    )
    setReputation((prev) => clamp(prev + repAdjustment, 0, 100))
    setLeaguePoints((prev) => Math.max(0, Math.round(prev + pointsAdjustment)))
    setPortfolio((prev) => Math.max(0, Math.round(prev * portfolioFactor)))
    setInTransitJobs((prev) => prev.filter((job) => job.etaAt > targetTime))
    setOperations((prev) => [...completions, ...prev].slice(0, 14))
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
  }) => {
    if (cash < dispatchCost) {
      setOperations((prev) =>
        [
          {
            id: Date.now(),
            title: `${title} baslatilamadi`,
            note: 'Nakit yetersiz. Is emri acmak icin daha fazla likidite gerekli.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
      )
      return false
    }

    const jobId = `${Date.now()}-${Math.round(Math.random() * 10000)}`

    setCash((prev) => Math.round(prev - dispatchCost))
    setInTransitJobs((prev) =>
      [
        {
          id: jobId,
          title,
          source,
          routeLabel,
          etaAt: gameTime + etaSec,
          riskScore,
          projectedProfit,
          grossRevenue,
          fuelCost,
          maintenanceCost,
          bookingCost: dispatchCost,
          incidentLabel,
          vehicleName,
        },
        ...prev,
      ].slice(0, 12),
    )
    setOperations((prev) =>
      [
        {
          id: Date.now(),
          title: `${title} yola cikti`,
          note: `${vehicleName} ile cikis yapildi. Tahmini teslimat: ${formatCountdown(etaSec)}.`,
          delta: -dispatchCost,
        },
        ...prev,
      ].slice(0, 14),
    )

    return true
  }

  const wearVehicle = (vehicleId, wearAmount) => {
    setVehicleCondition((prev) => ({
      ...prev,
      [vehicleId]: clamp((prev[vehicleId] ?? 100) - wearAmount, 8, 100),
    }))
  }

  const runOperation = () => {
    settleDueEvents(gameTime)

    if (!selectedRoute || !origin || !destination) {
      return
    }

    if (selectedVehicleHealth < 22) {
      setOperations((prev) =>
        [
          {
            id: Date.now(),
            title: `${selectedVehicle.name} bakim bekliyor`,
            note: 'Arac sagligi kritik seviyede. Sefer oncesi bakim yapmalisin.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
      )
      return
    }

    if (inTransitJobs.length >= 12) {
      setOperations((prev) =>
        [
          {
            id: Date.now(),
            title: 'Transit limiti dolu',
            note: 'Yeni sefer acmadan once bazi teslimatlari sonuclandir.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
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
    })

    if (!started) {
      return
    }

    const wearAmount = clamp(
      distanceKm / 500 + (cargoTons / selectedVehicle.capacity) * 11 + scenarioRiskByMode * 14,
      5,
      24,
    )
    wearVehicle(selectedVehicle.id, wearAmount)
    setLeaguePoints((prev) => Math.round(prev + 4))
  }

  const bidTender = (tenderId) => {
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
            id: Date.now(),
            title: `Ihale kapandi: ${tender.title}`,
            note: 'Bu ihalenin teklif suresi doldu veya baska bir ekip tarafindan alindi.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
      )
      return
    }

    const tenderRoute = routeCatalog.find((route) => route.id === tender.routeId)
    const tenderVehicle = fleetByMode[tender.mode][0]
    const tenderProduct =
      productCatalog.find((product) => product.id === tender.productId) ?? productCatalog[0]

    if (!tenderRoute || !tenderVehicle) {
      return
    }

    const from = cityById[tenderRoute.from]
    const to = cityById[tenderRoute.to]
    const vehicleHealth = vehicleCondition[tenderVehicle.id] ?? 100
    if (vehicleHealth < 22) {
      setOperations((prev) =>
        [
          {
            id: Date.now(),
            title: `${tender.title} teklif reddedildi`,
            note: `${tenderVehicle.name} bakimda oldugu icin ihaleye girilemedi.`,
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
      )
      return
    }

    const tenderScenarioRisk =
      tender.mode === 'sea'
        ? scenario.seaRisk
        : tender.mode === 'air'
          ? scenario.airRisk
          : scenario.landRisk
    const tenderRisk = clamp(
      tenderRoute.baseRisk +
        modeRiskBase[tender.mode] +
        tenderScenarioRisk +
        tenderProduct.risk +
        (100 - vehicleHealth) / 260,
      0.08,
      0.95,
    )
    const tenderBookingCost = Math.round(tender.minBid * 0.08 + tenderRoute.distanceKm * 3.4)
    const tenderFuelCost = tenderRoute.distanceKm * tenderVehicle.fuelPerKm * scenario.fuelMultiplier
    const tenderMaintenanceCost = tenderVehicle.maintenanceCost * 0.44
    const tenderProjectedProfit = Math.round(tender.minBid * (0.14 + Math.random() * 0.08))
    const tenderEta = clamp(
      Math.round(
        tender.deliveryWindowSec +
          (100 - vehicleHealth) * 0.5 +
          tenderScenarioRisk * 38 +
          tenderRoute.distanceKm / 980,
      ),
      30,
      280,
    )

    const started = queueTransitJob({
      title: tender.title,
      routeLabel: `${from.name} -> ${to.name}`,
      source: 'tender',
      bookingCost: tenderBookingCost,
      etaSec: tenderEta,
      riskScore: tenderRisk,
      projectedProfit: tenderProjectedProfit,
      grossRevenue: tender.minBid,
      fuelCost: tenderFuelCost,
      maintenanceCost: tenderMaintenanceCost,
      incidentLabel: scenario.incidentLabel,
      vehicleName: tenderVehicle.name,
    })

    if (!started) {
      return
    }

    setTenderBoard((prev) =>
      prev.map((item) =>
        item.id === tenderId
          ? {
              ...item,
              status: 'awarded',
              winner: 'Senin Koop Birligin',
              awardedAt: gameTime,
            }
          : item,
      ),
    )

    const tenderWear = clamp(
      tenderRoute.distanceKm / 620 + tender.tons / 140 + tenderScenarioRisk * 18,
      6,
      22,
    )
    wearVehicle(tenderVehicle.id, tenderWear)
    setLeaguePoints((prev) => Math.round(prev + 22))
    setReputation((prev) => clamp(prev + 2, 0, 100))
  }

  const performMaintenance = (targetVehicleId) => {
    settleDueEvents(gameTime)

    const vehicle = allVehicles.find((entry) => entry.id === targetVehicleId)
    if (!vehicle) {
      return
    }

    const currentHealth = vehicleCondition[targetVehicleId] ?? 100
    if (currentHealth > 96) {
      return
    }

    const serviceCost = Math.round(vehicle.maintenanceCost * (0.22 + (1 - currentHealth / 100) * 0.62))
    if (cash < serviceCost) {
      setOperations((prev) =>
        [
          {
            id: Date.now(),
            title: `${vehicle.name} bakimi ertelendi`,
            note: 'Servis masrafini karsilamak icin nakit yetersiz.',
            delta: 0,
          },
          ...prev,
        ].slice(0, 14),
      )
      return
    }

    const recovery = clamp(Math.round((100 - currentHealth) * 0.82 + 7), 8, 100)

    setCash((prev) => prev - serviceCost)
    setVehicleCondition((prev) => ({
      ...prev,
      [targetVehicleId]: clamp((prev[targetVehicleId] ?? 100) + recovery, 0, 100),
    }))
    setOperations((prev) =>
      [
        {
          id: Date.now(),
          title: `${vehicle.name} bakimi tamamlandi`,
          note: `Arac sagligi +${recovery.toFixed(0)} puan yenilendi.`,
          delta: -serviceCost,
        },
        ...prev,
      ].slice(0, 14),
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
          id: Date.now(),
          title: 'Banka Kredisi',
          note: `Likidite icin ${formatMoney(principal)} kredi alindi.`,
          delta: principal,
        },
        ...prev,
      ].slice(0, 14),
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
          id: Date.now(),
          title: 'Borclanma Azaltildi',
          note: `Kredi anaparasina ${formatMoney(payment)} odeme gecildi.`,
          delta: -payment,
        },
        ...prev,
      ].slice(0, 14),
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
            <span>Arac Sagligi</span>
            <strong>{selectedVehicleHealth.toFixed(0)} / 100</strong>
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
                  {cityCatalog.map((city) => (
                    <div
                      key={city.id}
                      className="map-marker"
                      style={{ left: `${city.mapX}%`, top: `${city.mapY}%` }}
                    >
                      <span>{city.name}</span>
                    </div>
                  ))}
                </div>
                <div className="city-grid">
                  {cityCatalog.map((city) => (
                    <article key={city.id} className="city-card">
                      <h3>{city.name}</h3>
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
                <h2>Sure Sinirli Ihale Masasi</h2>
                <p className="muted">
                  Ihalede sure bitmeden teklif ver. Kazandigin kontratlar dogrudan transit kuyruguna
                  duser, aninda teslim olmaz.
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
                          <button
                            type="button"
                            className="ghost-btn compact-btn"
                            disabled={!tender.isOpen}
                            onClick={() => bidTender(tender.id)}
                          >
                            Teklif Ver
                          </button>
                          <p className="muted mini">
                            {tender.status === 'awarded'
                              ? `Kazanan: ${tender.winner}`
                              : tender.status === 'expired'
                                ? `Kapanis: ${tender.winner}`
                                : 'Durum: Acik'}
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
                          Bakim Yap
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
