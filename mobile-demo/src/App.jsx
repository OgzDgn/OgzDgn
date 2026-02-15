import { useEffect, useMemo, useState } from 'react'
import './App.css'

const tabs = [
  { id: 'dashboard', label: 'Komuta' },
  { id: 'trade', label: 'Ticaret' },
  { id: 'coop', label: 'Koop' },
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
  },
  {
    id: 'shanghai',
    name: 'Shanghai',
    port: 'Shanghai Port',
    taxRate: 0.13,
    risk: 0.2,
    demand: ['Petrol', 'Nadir Madenler', 'Elektronik'],
    policy: 'Ihracat odakli',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    port: 'Port of Ambarli',
    taxRate: 0.17,
    risk: 0.24,
    demand: ['Tahil', 'Tibbi Malzeme', 'Elektronik'],
    policy: 'Kopru pazar',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    port: 'Jebel Ali Port',
    taxRate: 0.09,
    risk: 0.18,
    demand: ['Luks Arac', 'Petrol', 'Silah'],
    policy: 'Serbest bolge',
  },
  {
    id: 'hamburg',
    name: 'Hamburg',
    port: 'Port of Hamburg',
    taxRate: 0.16,
    risk: 0.12,
    demand: ['Tahil', 'Elektronik', 'Tibbi Malzeme'],
    policy: 'Yesil lojistik',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    port: 'Port of Tokyo',
    taxRate: 0.2,
    risk: 0.15,
    demand: ['Nadir Madenler', 'Elektronik', 'Luks Arac'],
    policy: 'Yuksek standart',
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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const formatMoney = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value) => `%${(value * 100).toFixed(1)}`

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
  const [operations, setOperations] = useState([
    {
      id: 1,
      title: 'Istanbul -> Hamburg',
      note: 'Demiryolu teslimati planlandigi gibi tamamlandi.',
      delta: 163000,
    },
    {
      id: 2,
      title: 'Dubai -> Istanbul',
      note: 'Sinir vergisi nedeniyle marj daraldi.',
      delta: -42000,
    },
    {
      id: 3,
      title: 'Shanghai -> Istanbul',
      note: 'Liman yogunlugu ekstra depolama maliyeti cikardi.',
      delta: 88000,
    },
  ])

  const scenario = useMemo(
    () => scenarioCatalog.find((item) => item.id === scenarioId) ?? scenarioCatalog[0],
    [scenarioId],
  )

  const availableRoutes = useMemo(
    () => routeCatalog.filter((route) => route.modes.includes(mode)),
    [mode],
  )

  useEffect(() => {
    if (!availableRoutes.some((route) => route.id === routeId)) {
      setRouteId(availableRoutes[0]?.id ?? '')
    }
  }, [availableRoutes, routeId])

  const availableVehicles = fleetByMode[mode]

  useEffect(() => {
    if (!availableVehicles.some((vehicle) => vehicle.id === vehicleId)) {
      setVehicleId(availableVehicles[0]?.id ?? '')
    }
  }, [availableVehicles, vehicleId])

  const selectedRoute =
    routeCatalog.find((route) => route.id === routeId) ?? availableRoutes[0] ?? null
  const selectedVehicle =
    availableVehicles.find((vehicle) => vehicle.id === vehicleId) ?? availableVehicles[0]
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
    selectedVehicle.riskMitigation

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
    storageCost +
    insuranceCost +
    taxCost +
    expectedIncidentLoss
  const projectedProfit = grossRevenue - totalCost
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

  const runOperation = () => {
    if (!selectedRoute || !origin || !destination) {
      return
    }

    const incident = Math.random() < riskScore
    const variance = 0.9 + Math.random() * 0.25
    let deltaCash = projectedProfit * variance
    let note = `${origin.name} -> ${destination.name} hattinda teslimat sorunsuz.`

    if (incident) {
      const emergencyLoss = grossRevenue * (0.25 + Math.random() * 0.3)
      deltaCash = -Math.abs(fuelCost + maintenanceCost * 0.8 + emergencyLoss)
      note = `${origin.name} -> ${destination.name} hattinda ${scenario.incidentLabel} yasandi.`
    }

    const roundedDelta = Math.round(deltaCash)

    setCash((prev) => Math.round(prev + roundedDelta))
    setDebt((prev) =>
      Math.max(0, Math.round(prev * (1 + loanRate / 3650) + (incident ? 9000 : -7000))),
    )
    setReputation((prev) => clamp(prev + (incident ? -5 : 3), 0, 100))
    setLeaguePoints((prev) =>
      Math.round(prev + (incident ? -12 : 20 + Math.max(0, projectedProfit / 50000))),
    )
    setPortfolio((prev) =>
      Math.max(0, Math.round(prev * (1 + (incident ? -0.01 : 0.012) - scenario.fxVolatility * 0.004))),
    )
    setOperations((prev) =>
      [
        {
          id: Date.now(),
          title: `${origin.name} -> ${destination.name}`,
          note,
          delta: roundedDelta,
        },
        ...prev,
      ].slice(0, 8),
    )
  }

  const takeLoan = () => {
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
      ].slice(0, 8),
    )
  }

  const payDebt = () => {
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
      ].slice(0, 8),
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
                            {from.name} -> {to.name}
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
                    <select value={routeId} onChange={(event) => setRouteId(event.target.value)}>
                      {availableRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {cityById[route.from].name} -> {cityById[route.to].name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Arac/Filo
                    <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
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
                </div>

                <button type="button" className="primary-btn" onClick={runOperation}>
                  Seferi Baslat
                </button>
                <p className="muted">
                  Aktif mod: {modeLabels[mode]} | Sezon: {scenario.name}
                </p>
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
