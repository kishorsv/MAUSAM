# MAUSAM — Smart Personalized Weather Intelligence Platform

🔗 Live Demo: https://mausam-mzqf.vercel.app/

> **“Development of personalized homepage for ‘Mausam’ mobile application.”**

Mausam is an intelligent, full-stack, production-quality weather intelligence platform that automatically personalizes the homepage according to user lifestyles, health needs, travel plans, fitness schedules, family safety, agriculture requirements, and real-time atmospheric severity.

---

## 🌟 Key Features

1. **Intelligent Dynamic Dashboard (`/`)**
   - **Personalization Engine**: Reorganizes cards mathematically based on:
     $$\text{Priority} = \text{userInterestScore} + \text{weatherSeverityScore} + \text{timeRelevanceScore} + \text{locationRelevanceScore} + \text{activityRelevanceScore}$$
   - **Explainability**: Every card rank can be inspected with transparent score breakdowns.
   - **Lifestyle Persona Toggles**: Toggle **Fitness, Health, Beach, Travel, Family, Agriculture, Commute, and Events** dynamically with real-time homepage reordering.

2. **Real Weather API Integration & Caching**
   - Provider abstraction layer (`IWeatherProvider`) connected to **Open-Meteo, ECMWF, and IMD** models.
   - Live US EPA Air Quality Index (AQI), PM2.5, PM10, UV index, surface pressure, and 24h/7-day projections.
   - Spatial LRU caching with spatial coordinate rounding and 10-minute TTL.

3. **Status Badges (Live Data vs Demo Data)**
   - Prominently displays `LIVE DATA` or `DEMO DATA` status.
   - Never silently presents sample data as live observations.
   - Graceful degradation: displays *"Data unavailable for this location"* when a sensor is absent.

4. **Mausam AI Ground-Truth Assistant**
   - Contextual chat assistant powered by **Google Gemini** with structured prompt grounding.
   - Clearly separates **[Observed Weather Data]** from **[AI Recommendation]**.
   - Answers questions on running windows, packing checklists, rain probabilities, and alert explanations.

5. **Lifestyle & Persona Modules**
   - **Fitness & Outdoor**: Running, walking, cycling, and sports timelines calculated from real hourly forecast trends.
   - **Health & Allergy**: Particulate concentrations, pollen indicators, and neutral non-medical guidance.
   - **Travel Intelligence**: Destination weather feeds and meteorological packing recommendations.
   - **Family & Safety**: School departure, playground temperature, and evening transit windows.
   - **Agriculture & Crop Microclimate**: Evapotranspiration, frost warnings, and agricultural IoT soil probe gateway.
   - **Daily Commuter**: Optical road visibility, roadway slickness, and crosswind warnings.
   - **Event Planner**: Open-air venue comfort scoring and hourly precipitation timelines.
   - **Beach & Marine**: Surface wind chop, wave swell indications, and coastal UV alerts.

6. **Interactive Regional Weather Map (`/map`)**
   - Thermal heatmap layers, rain radar, wind flow vectors, and air quality markers with zoom controls.

7. **Multilingual Architecture**
   - Native localization supporting **English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी)** with instant switching.

8. **Protected Admin Telemetry Console (`/admin`)**
   - Weather provider latency tracking, cache hit ratios, active users, and system diagnostics.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Next.js Server & Route Handlers (`src/app/api/`)
- **Database**: PostgreSQL schema with RLS (`src/lib/db/schema.sql`) + Persistent local storage adapter (`data/mausam_storage.json`)
- **Authentication**: JWT session tokens stored in secure, `httpOnly`, `SameSite=Lax` cookies with `bcryptjs` hashing
- **AI**: Google Gemini API (`gemini-1.5-flash`) with strict weather grounding
- **Weather Providers**: Open-Meteo core (IMD/ECMWF), WeatherAPI adapter, and labeled Demo Sandbox provider
- **Testing**: Automated end-to-end test suite (`scripts/test-runner.js`)

---

## 📁 Folder Structure

```
c:/Users/kisho/OneDrive/Desktop/Masum/
├── .env.example              # Environment variables documentation
├── .env.local                # Local development settings
├── docs/
│   └── ARCHITECTURE.md       # Technical architecture specification
├── scripts/
│   └── test-runner.js        # Automated test suite
├── src/
│   ├── app/
│   │   ├── api/              # API routes (weather, personalization, AI, auth, admin)
│   │   ├── auth/             # Login and Registration pages
│   │   ├── forecast/         # Extended 7-day forecast page
│   │   ├── landing/          # Premium product landing page
│   │   ├── map/              # Interactive weather map page
│   │   ├── notifications/    # Notification inbox page
│   │   ├── onboarding/       # 6-step personalized onboarding
│   │   ├── profile/          # User profile and saved locations
│   │   ├── admin/            # Protected system telemetry console
│   │   ├── layout.tsx        # App root layout
│   │   └── page.tsx          # Flagship personalized homepage
│   ├── components/
│   │   ├── common/           # LoadingSkeleton, ErrorState, ModeBadge
│   │   ├── navigation/       # Header, MobileBottomNav
│   │   ├── weather/          # WeatherHero, AQICard, HourlyForecast, ForecastCard, ActivityScore
│   │   ├── modules/          # Fitness, Health, Travel, Family, Agriculture, Commuter, Event, Beach
│   │   ├── ai/               # AIChatDrawer
│   │   └── map/              # WeatherMapComponent
│   └── lib/
│       ├── ai/               # Gemini AI integration and weather synthesizer
│       ├── auth/             # Session management & JWT token utilities
│       ├── automation/       # Smart automation rules engine
│       ├── db/               # PostgreSQL schema & repository adapter
│       ├── i18n/             # Translations dictionary (English, Kannada, Hindi)
│       ├── personalization/  # Deterministic card prioritization engine
│       ├── scores/           # Smart weather scoring algorithms
│       ├── utils.ts          # Formatters & WMO decoders
│       └── weather/          # Weather providers, cache, and service orchestrator
└── package.json
```

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 2. Installation
```bash
git clone <repository-url>
cd Masum
npm install
```

### 3. Run the Automated Test Suite
```bash
npm test
```
*Executes all 14 tests verifying scoring math, rules engine, multilingual completeness, and deterministic card rankings.*

### 4. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Variable Reference
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_DATA_MODE` | No (Default: `live`) | Set to `live` for real APIs, or `demo` for simulated datasets. |
| `DEFAULT_WEATHER_PROVIDER` | No (Default: `open-meteo`) | Primary provider for forecast and air quality. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key. If omitted, Mausam engages its local expert synthesizer. |
| `DATABASE_URL` | Optional | PostgreSQL connection string for production database. |
| `JWT_SECRET` | Recommended | Secret string used for signing user session tokens. |

---

## 👥 Demo Credentials
Pre-seeded in the database for instant testing:
- **Demo User**: `user@mausam.app` / `User@12345`
- **Admin**: `admin@mausam.app` / `Admin@12345`

---

## 🧪 Testing Results
- **WMO Decoders & Conversions**: Passed
- **Contextual Weather Scoring Engine**: Passed
- **Smart Automation Rules**: Passed
- **Personalization Engine Mathematical Ordering**: Passed
- **Multilingual Completeness (EN, KN, HI)**: Passed
- **Production Build (`npm run build`)**: Generated 27 static and dynamic routes with 0 errors.

---

## 📄 License
MIT License. Built for the Mausam Smart Personalized Weather Intelligence initiative.
