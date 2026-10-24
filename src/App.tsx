import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CloudRain,
  Compass,
  Droplets,
  Layers,
  MapPin,
  Menu,
  Moon,
  Printer,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sprout,
  Sun,
  X,
  Clock,
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  CloudSun,
  Sliders,
  Cpu,
  ChevronRight,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { PlantingInput, PlantingAdvice, ProviderStatus } from './types';

// Regional field benchmarks
const FIELD_BENCHMARKS = [
  {
    name: 'Kaduna Central (Igabi)',
    zone: 'Northern Guinea Savanna',
    state: 'Kaduna',
    lga: 'Igabi',
    crop: 'Maize (Drought-Tolerant Hybrid)',
    intendedDate: '18 May – 30 May 2026',
    soilType: 'Sandy Loam',
    irrigation: 'Rainfed Only (Natural Rainfall)',
    weatherObservation: '14mm rainfall recorded on 6 May. Dry for 5 subsequent days with maximum daily temperatures at 34°C. Soil moisture building in lower horizon.',
    rainfallTrend: 'Transitioning from dry season into unimodal rainy season. Mid-onset dry spell risk observed in regional station.',
  },
  {
    name: 'Kano River Basin (Kura)',
    zone: 'Sudan Savanna (Irrigated)',
    state: 'Kano',
    lga: 'Kura',
    crop: 'Lowland Rice (FARO 44)',
    intendedDate: '5 June – 20 June 2026',
    soilType: 'Clay Loam',
    irrigation: 'Canal / Drip Irrigation Scheme',
    weatherObservation: 'Canal water available. Rains have not established yet; daytime temperature is 38°C with moderate humidity.',
    rainfallTrend: 'Semi-arid Sudan savanna; persistent monsoonal rains begin late June.',
  },
  {
    name: 'Benue River Basin (Makurdi)',
    zone: 'Southern Guinea Savanna',
    state: 'Benue',
    lga: 'Makurdi',
    crop: 'Cowpea / Beans',
    intendedDate: '1 July – 15 July 2026',
    soilType: 'Loamy',
    irrigation: 'Rainfed Only (Natural Rainfall)',
    weatherObservation: 'Steady precipitation every 48 hours. Soil moisture profile saturated to 25cm. Excellent vegetative conditions.',
    rainfallTrend: 'Bimodal wet season transitioning toward August dry break.',
  },
  {
    name: 'Oyo Agricultural Zone (Iseyin)',
    zone: 'Derived Savanna / Forest Transition',
    state: 'Oyo',
    lga: 'Iseyin',
    crop: 'Tomatoes',
    intendedDate: '20 September – 10 October 2026',
    soilType: 'Sandy Loam',
    irrigation: 'Supplementary Borehole / Well',
    weatherObservation: 'Terminal rainy season. Afternoon showers dissipating. High solar radiation; low relative humidity at night.',
    rainfallTrend: 'Transitioning to late season dry spell with high sunlight and low blight risk.',
  },
];

const CROPS = [
  'Maize (Corn)',
  'Rice (Upland / Lowland)',
  'Cowpea / Beans',
  'Millet',
  'Sorghum (Guinea Corn)',
  'Soybeans',
  'Cassava',
  'Yam',
  'Tomatoes',
  'Groundnut (Peanut)',
];

const SOILS = [
  'Sandy Loam',
  'Clay Loam',
  'Loamy',
  'Silty',
  'Heavy Clay',
  'Sandy',
  'Unsure / Typical Field Soil',
];

const IRRIGATIONS = [
  'Rainfed Only (Natural Rainfall)',
  'Supplementary Borehole / Well',
  'Canal / Drip Irrigation Scheme',
  'Stream / River Pumping',
];

type ActivePage = 'advisory' | 'predictor' | 'schedule' | 'climatology' | 'agronomy' | 'benchmarks';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('advisory');
  const [formData, setFormData] = useState<PlantingInput>({
    location: {
      country: 'Nigeria',
      state: 'Kaduna',
      lga: 'Igabi',
    },
    crop: 'Maize (Corn)',
    intendedDate: '18 May – 30 May 2026',
    soilType: 'Sandy Loam',
    irrigation: 'Rainfed Only (Natural Rainfall)',
    weatherObservation: '14mm rainfall recorded on 6 May. Dry for 5 subsequent days with maximum daily temperatures at 34°C. Soil moisture building in lower horizon.',
    rainfallTrend: 'Transitioning from dry season into unimodal rainy season. Mid-onset dry spell risk observed in regional station.',
  });

  const [advice, setAdvice] = useState<PlantingAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light');
  };

  useEffect(() => {
    fetch('/api/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProviderStatus(data);
      })
      .catch(() => {});

    handlePredict(formData);
  }, []);

  const handlePredict = async (inputToPredict = formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputToPredict),
      });

      if (!res.ok) {
        throw new Error('Prediction failed');
      }

      const result = await res.json();
      setAdvice(result);
    } catch {
      // Backend handles fallback cleanly
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBenchmark = (item: (typeof FIELD_BENCHMARKS)[0]) => {
    const updated: PlantingInput = {
      location: {
        country: 'Nigeria',
        state: item.state,
        lga: item.lga,
      },
      crop: item.crop,
      intendedDate: item.intendedDate,
      soilType: item.soilType,
      irrigation: item.irrigation,
      weatherObservation: item.weatherObservation,
      rainfallTrend: item.rainfallTrend,
    };
    setFormData(updated);
    handlePredict(updated);
    setCurrentPage('advisory');
  };

  const handleCopySummary = () => {
    if (!advice) return;
    const text = `🌱 INSTORA AGROCLOUD PLANTING BULLETIN
Location: ${formData.location.lga ? `${formData.location.lga}, ` : ''}${formData.location.state}, ${formData.location.country}
Crop: ${formData.crop}
Target Window: ${advice.recommendedWindow} (Optimal: ${advice.recommendedDate})
Suitability: ${advice.suitabilityScore}% (${advice.suitabilityLevel})

SUMMARY RATIONALE:
${advice.summaryReason}

RISK NOTICES:
${advice.weatherAlerts.map((a) => `• [${a.severity.toUpperCase()}] ${a.title}: ${a.actionRecommendation}`).join('\n')}

OPERATIONS SCHEDULE:
${advice.activityTimeline.map((item) => `• ${item.stage} (${item.timing}): ${item.activity}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'advisory', label: 'Advisory Bulletin', icon: LayoutDashboard, desc: 'Current Sowing Recommendation' },
    { id: 'predictor', label: 'Planting Predictor', icon: Sliders, desc: 'Field & Weather Configuration' },
    { id: 'schedule', label: 'Operations Timetable', icon: CalendarCheck, desc: 'Crop Management Calendar' },
    { id: 'climatology', label: 'Rainfall Climatology', icon: CloudSun, desc: 'Synoptic Forecast vs Seasonal' },
    { id: 'agronomy', label: 'Varietal Agronomy', icon: BookOpen, desc: 'Best Practice Guidelines' },
    { id: 'benchmarks', label: 'Regional Benchmarks', icon: TrendingUp, desc: 'Calibrated Field Baselines' },
  ] as const;

  const getPageTitle = () => {
    switch (currentPage) {
      case 'advisory':
        return 'Sowing Advisory Bulletin';
      case 'predictor':
        return 'Planting Predictor & Field Configuration';
      case 'schedule':
        return 'Chronological Operations Timetable';
      case 'climatology':
        return 'Rainfall Climatology & Seasonal Horizon';
      case 'agronomy':
        return 'Varietal Agronomy & Management Tips';
      case 'benchmarks':
        return 'Regional Field Benchmarks';
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-base-200)] text-[var(--text-base-content)] transition-colors duration-200">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Redesigned Minimal Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[var(--bg-base-100)] border-r border-[var(--border-color)] flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-18 px-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#465fff] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm tracking-tight text-[var(--text-base-content)] flex items-center gap-1.5">
                  AgroCloud
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#465fff]/10 text-[#465fff]">
                    v1.0
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-normal">
                  Planting Intelligence
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-base-content)] md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Pages
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#465fff]/10 text-[#465fff]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-base-200)] hover:text-[var(--text-base-content)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Engine Info & Theme Switcher */}
        <div className="p-4 border-t border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span className="text-[11px]">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-base-200)] hover:text-[var(--text-base-content)] transition-colors cursor-pointer"
              title="Toggle dark/light mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-base-200)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#465fff] shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[var(--text-base-content)] block leading-tight">
                  Engine:
                </span>
                <span className="text-[11px] truncate block text-[var(--text-muted)]">
                  {providerStatus?.activeProvider === 'local' ? providerStatus.ollamaModel : (providerStatus?.apiModel || 'gemma-4-31b-it')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Full-Width Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-18 px-6 sm:px-10 bg-[var(--bg-base-100)] border-b border-[var(--border-color)] sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-base-content)] md:hidden cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-base-content)]">AgroCloud</span>
              <span>/</span>
              <span className="text-[#465fff] font-medium">{getPageTitle()}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePredict()}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#465fff] hover:bg-[#3b51d4] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Evaluating...' : 'Recalculate'}</span>
            </button>
          </div>
        </header>

        {/* Full-Width Main Workspace Container */}
        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
          {/* ========================================================= */}
          {/* PAGE 1: ADVISORY BULLETIN (Overview & Core Decision)      */}
          {/* ========================================================= */}
          {currentPage === 'advisory' && (
            <div className="space-y-8">
              {/* Page Title & Context */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                    Sowing Advisory Bulletin
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                    Calibrated planting recommendations for {formData.crop} in {formData.location.state}, {formData.location.country}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage('predictor')}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-base-100)] hover:bg-[var(--bg-base-200)] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Adjust Parameters
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-base-100)] hover:bg-[var(--bg-base-200)] text-xs font-medium text-[#465fff] transition-colors cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy Summary'}
                  </button>
                </div>
              </div>

              {/* 4-Stat Metric Row */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Recommended Window
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#465fff]/10 flex items-center justify-center text-[#465fff]">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-lg font-bold text-[var(--text-base-content)]">
                      {advice?.recommendedWindow || 'Calculating...'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      Target: <strong className="text-[#465fff]">{advice?.recommendedDate || 'Pending'}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Suitability Index
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-success-subtle)] flex items-center justify-center text-[var(--color-success)]">
                      <Sprout className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-lg font-bold text-[var(--text-base-content)] flex items-baseline gap-2">
                      <span className="font-mono tabular-nums">{advice?.suitabilityScore ?? '--'}%</span>
                      <span className="text-xs font-semibold text-[var(--color-success-text)]">
                        {advice?.suitabilityLevel || 'Optimal'}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      Soil thermal & moisture index
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Precipitation Volume
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-info-subtle)] flex items-center justify-center text-[var(--color-info)]">
                      <CloudRain className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-lg font-bold text-[var(--text-base-content)]">
                      {advice?.rainfallSuitability.expectedRainfallMm || '50 - 75 mm'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 truncate">
                      {advice?.rainfallSuitability.status || 'Onset showers building'}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Root-Zone Moisture
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-subtle)] flex items-center justify-center text-[var(--color-warning)]">
                      <Droplets className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-lg font-bold text-[var(--text-base-content)] flex items-baseline gap-2">
                      <span>{advice?.soilMoistureAssessment.status || 'Adequate'}</span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        ({advice?.soilMoistureAssessment.score ?? 85}%)
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {formData.soilType} seedbed
                    </div>
                  </div>
                </div>
              </section>

              {/* Recommendation Hero Box */}
              {advice && (
                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base-200)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#465fff] mb-1">
                        Recommended Planting Window
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-base-content)]">
                        {advice.recommendedWindow}
                      </div>
                      <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Optimal Target Date: <strong className="text-[var(--text-base-content)]">{advice.recommendedDate}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentPage('schedule')}
                        className="px-4 py-2 rounded-lg bg-[#465fff] text-white text-xs font-semibold hover:bg-[#3b51d4] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>View Operations Timetable</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Technical Agronomic Rationale
                    </h3>
                    <p className="text-sm text-[var(--text-base-content)] leading-relaxed">
                      {advice.summaryReason}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                      {advice.detailedExplanation}
                    </p>
                  </div>

                  {/* Priority Weather Alerts */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Priority Field Weather Risk Notices
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advice.weatherAlerts.map((alert, idx) => (
                        <div
                          key={alert.id || idx}
                          className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-base-200)] text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-[var(--text-base-content)]">
                            <span className="text-sm">{alert.title}</span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#465fff]/10 text-[#465fff]">
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-[var(--text-muted)] leading-relaxed">{alert.description}</p>
                          <div className="text-[var(--text-base-content)] font-medium pt-1">
                            <span className="text-[#465fff] font-bold">Action:</span> {alert.actionRecommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 2: PLANTING PREDICTOR (Configuration & Inputs)       */}
          {/* ========================================================= */}
          {currentPage === 'predictor' && (
            <div className="space-y-8">
              <div className="border-b border-[var(--border-color)] pb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                  Planting Predictor & Field Parameters
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  Enter your local soil, water, and weather observations to calculate the optimal sowing date.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePredict();
                  setCurrentPage('advisory');
                }}
                className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location State & LGA */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value },
                        })
                      }
                      placeholder="e.g. Kaduna"
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      LGA / District / Town
                    </label>
                    <input
                      type="text"
                      value={formData.location.lga || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, lga: e.target.value },
                        })
                      }
                      placeholder="e.g. Igabi"
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Crop Variety */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Target Crop
                    </label>
                    <select
                      value={formData.crop}
                      onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none cursor-pointer"
                    >
                      {CROPS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Custom">Other Variety...</option>
                    </select>
                  </div>

                  {/* Intended Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Intended Planting Period
                    </label>
                    <input
                      type="text"
                      value={formData.intendedDate}
                      onChange={(e) => setFormData({ ...formData, intendedDate: e.target.value })}
                      placeholder="e.g. 18 May – 30 May 2026"
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Soil Texture */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Soil Texture
                    </label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none cursor-pointer"
                    >
                      {SOILS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Irrigation */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Water / Irrigation Source
                    </label>
                    <select
                      value={formData.irrigation}
                      onChange={(e) => setFormData({ ...formData, irrigation: e.target.value })}
                      className="w-full h-11 text-xs sm:text-sm px-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none cursor-pointer"
                    >
                      {IRRIGATIONS.map((irr) => (
                        <option key={irr} value={irr}>
                          {irr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ground Weather Observations */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-base-content)] mb-2 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    Local Meteorological & Ground Observations
                  </label>
                  <textarea
                    rows={3}
                    value={formData.weatherObservation}
                    onChange={(e) =>
                      setFormData({ ...formData, weatherObservation: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm p-3.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-base-100)] text-[var(--text-base-content)] focus:border-[#465fff] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border-color)]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#465fff] hover:bg-[#3b51d4] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4" />
                        Calculate Optimal Window
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 3: OPERATIONS TIMETABLE                              */}
          {/* ========================================================= */}
          {currentPage === 'schedule' && advice && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                    Chronological Field Operations Timetable
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                    Activity schedule from land preparation to harvest for {formData.crop}.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-base-100)] hover:bg-[var(--bg-base-200)] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Schedule
                </button>
              </div>

              <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] overflow-hidden shadow-xs">
                {advice.activityTimeline.map((item, idx) => (
                  <div key={idx} className="p-5 hover:bg-[var(--bg-base-200)] transition-colors text-xs sm:text-sm space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="font-bold text-[var(--text-base-content)] text-sm sm:text-base">
                        {idx + 1}. {item.stage}
                      </span>
                      <span className="font-mono text-[#465fff] font-semibold text-xs px-2.5 py-1 rounded bg-[#465fff]/10 self-start sm:self-auto">
                        {item.timing}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{item.activity}</p>
                    <div className="p-3 rounded-lg bg-[var(--bg-base-200)] border border-[var(--border-color)] text-[var(--text-muted)] text-xs leading-relaxed">
                      <strong className="text-[var(--text-base-content)]">Field Note:</strong> {item.criticalNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 4: RAINFALL CLIMATOLOGY (Synoptic vs Seasonal)       */}
          {/* ========================================================= */}
          {currentPage === 'climatology' && advice && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                  Rainfall Climatology & Seasonal Outlook
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  Balancing short-term 7–14 day weather forecasts with the broader 3–6 month seasonal duration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-3">
                  <div className="font-bold text-[var(--text-base-content)] text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#465fff]" />
                    7–14 Day Synoptic Weather Forecast
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {advice.distinctionForecastVsSeasonal.shortTermForecast}
                  </p>
                </div>

                <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-3">
                  <div className="font-bold text-[var(--text-base-content)] text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#465fff]" />
                    3–6 Month Seasonal Climatic Horizon
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {advice.distinctionForecastVsSeasonal.seasonalOutlook}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-2">
                <div className="font-bold text-[var(--text-base-content)] text-sm">
                  Farmer Planning Strategy
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {advice.distinctionForecastVsSeasonal.implication}
                </p>
              </div>

              <div className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-2">
                <div className="font-bold text-[var(--text-base-content)] text-sm">
                  Soil Moisture & Precipitation Verification
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {advice.detailedExplanation}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 5: VARIETAL AGRONOMY (Best Practices)                */}
          {/* ========================================================= */}
          {currentPage === 'agronomy' && advice && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                  Varietal Agronomy Best Practices
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  Field guidelines for {formData.crop} on {formData.soilType} soils.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {advice.agronomicTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-2"
                  >
                    <div className="font-bold text-[var(--text-base-content)] text-base">
                      {tip.category}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {tip.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 6: REGIONAL BENCHMARKS (Calibrated Field Profiles)   */}
          {/* ========================================================= */}
          {currentPage === 'benchmarks' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--border-color)] pb-5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-base-content)]">
                  Regional Field Benchmarks
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  Click any benchmark to load calibrated soil, precipitation, and agro-ecological parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FIELD_BENCHMARKS.map((benchmark, idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--bg-base-100)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#465fff] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-base-content)] text-base">
                          {benchmark.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#465fff]/10 text-[#465fff]">
                          {benchmark.zone}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-medium">
                        {benchmark.crop} · {benchmark.soilType} · {benchmark.intendedDate}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                        {benchmark.weatherObservation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectBenchmark(benchmark)}
                      className="w-full py-2.5 px-3 rounded-lg border border-[#465fff] text-[#465fff] hover:bg-[#465fff] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                    >
                      Load This Benchmark Scenario
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
