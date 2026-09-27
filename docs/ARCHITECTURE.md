# MAUSAM ARCHITECTURE SPECIFICATION
## Smart Personalized Weather Intelligence Platform

---

### 1. High-Level Architecture Overview

Traditional weather applications operate as static aggregators: regardless of whether a user is an asthmatic child, a marathon runner, a farmer preparing for harvest, or an event planner organizing an outdoor reception, they are greeted by an identical grid of cards.

**Mausam** inverts this paradigm. It acts as an **intelligent, context-aware operational dashboard** whose information layout, warnings, and advisory modules are dynamically reorganized every time atmospheric data changes or user lifestyle priorities shift.

```
                           +------------------------+
                           |  Next.js 14 Client     |
                           |  (React 18 + Tailwind) |
                           +-----------+------------+
                                       |
                   HTTP Requests / Rest API | Server Actions
                                       v
                     +------------------------------------+
                     |     Next.js API Gateway Layer      |
                     |  (/api/weather, /api/personalize)  |
                     +-----------------+------------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
+--------------------+       +--------------------+       +--------------------+
|  Weather Service   |       |   Personalization  |       |     Mausam AI      |
|  & Cache Manager   |       |    Rules Engine    |       | (Google Gemini API)|
+---------+----------+       +---------+----------+       +---------+----------+
          |                            |                            |
          v                            v                            v
+--------------------+       +--------------------+       +--------------------+
| Weather Providers  |       | Relational Storage |       | Structured Weather |
| (Open-Meteo / IMD) |       | (PostgreSQL / RLS) |       | Context Grounding  |
+--------------------+       +--------------------+       +--------------------+
```

---

### 2. Core Subsystems

#### 2.1 Provider Abstraction Layer (`src/lib/weather/`)
Weather providers are encapsulated behind the `IWeatherProvider` contract:
```typescript
export interface IWeatherProvider {
  readonly id: string;
  readonly name: string;
  getWeather(lat: number, lon: number, locationMeta?: Partial<WeatherLocation>): Promise<WeatherPayload>;
  searchLocations(query: string): Promise<WeatherLocation[]>;
}
```
- **OpenMeteoProvider**: Connects to global high-resolution ECMWF / IMD numerical prediction models and CPCB air quality stations. Zero API key barriers for local and regional testing.
- **DemoWeatherProvider**: A clearly segregated sandbox provider that returns labeled simulated datasets for testing UI edge cases without consuming provider quota.
- **Cache Layer (`src/lib/weather/cache.ts`)**: In-memory and distributed Redis-compatible LRU cache with spatial rounding (lat/lon to 2 decimal places ~1.1km) and 10-minute TTL to prevent rate limiting.

#### 2.2 Personalization & Deterministic Ranking Engine (`src/lib/personalization/`)
Cards on the homepage are never randomly shuffled. Their position is calculated by a strictly deterministic, explainable scoring function:

$$\text{Priority} = S_{\text{userInterest}} + S_{\text{weatherSeverity}} + S_{\text{timeRelevance}} + S_{\text{locationRelevance}} + S_{\text{activityRelevance}}$$

- **Severe Weather Override**: When active meteorological alerts exist (e.g. gale winds, thunderstorms, extreme heat), $S_{\text{weatherSeverity}} \ge 200$, forcing the alert to Rank #1.
- **Fitness Hour Adjustment**: Between 05:00 - 09:00 and 16:00 - 19:00, $S_{\text{timeRelevance}}$ elevates for fitness profiles. If rain or hazardous AQI occurs during these hours, alternate workout windows are calculated from hourly forecast data.
- **Health & Air Quality Escalation**: If $AQI > 100$, the particulate card escalates over general forecast cards for users with health and allergy profiles enabled.

#### 2.3 Smart Automation & Rules Engine (`src/lib/automation/`)
Evaluates rule chains to generate actionable, neutral insights:
1. **Precipitation Rule**: Triggered when hourly rain probability $\ge 60\%$.
2. **Solar Radiation Rule**: Triggered when $UV \ge 8$ (Very High) or $\ge 11$ (Extreme).
3. **Thermal Stress Rule**: Triggered when ambient temperature $\ge 38^\circ\text{C}$.
4. **Air Quality Rule**: Triggered when $AQI \ge 150$.
5. **Visibility Rule**: Triggered when optical range falls below $3\,\text{km}$.
6. **Fitness Alternate Window**: Identifies the cleanest, driest upcoming window in the next 12 hours when current weather is poor.

#### 2.4 Ground-Truth AI Assistant (`src/lib/ai/gemini.ts`)
Mausam AI strictly avoids hallucination by injecting observed meteorological parameters into the system prompt:
```
[OBSERVED REAL-TIME WEATHER DATA]
Location: Bengaluru, India
Temperature: 24°C (Feels like 25°C)
Condition: Partly Cloudy
Rain Probability: 15%
Air Quality (AQI): 75 (Moderate)
Active Alerts: None
User Lifestyle: Fitness, Health
```
The client UI presents responses with clear visual distinction between **[Observed Weather Data]** and **[AI Recommendation]**.

#### 2.5 Relational Database Layer (`src/lib/db/`)
- Production: PostgreSQL schema with Row-Level Security (RLS), foreign key cascades, and spatial indexes on lat/lon coordinates.
- Local zero-friction fallback: Atomic disk-backed storage engine (`data/mausam_storage.json`) that enables immediate cloning and running on any machine without local PostgreSQL installation requirements.

---

### 3. Security & API Key Isolation Architecture

1. **Server-Side Exclusivity**: Secrets like `JWT_SECRET`, `DATABASE_URL`, `GEMINI_API_KEY`, `WEATHER_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are never bundled into client JavaScript.
2. **Public Client Prefixing**: Only variables prefixed with `NEXT_PUBLIC_` (such as `NEXT_PUBLIC_APP_URL` or public map tiles) are exposed.
3. **Session Cookies**: Tokens are stored in `httpOnly`, `SameSite=Lax`, secure cookies, defending against Cross-Site Scripting (XSS) credential theft.
4. **Graceful Degraded States**: When a secret (e.g. Gemini API key) is omitted, Mausam does not crash; it engages local deterministic expert synthesis.
