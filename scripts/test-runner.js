/**
 * MAUSAM SMART PERSONALIZED WEATHER PLATFORM
 * AUTOMATED END-TO-END TEST SUITE
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('STARTING MAUSAM AUTOMATED TEST RUNNER');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failedTests++;
  }
}

// 1. Weather Formatters & WMO Decoders
const { getWmoWeatherDescription, getAqiCategory, getUvCategory, formatTemperature, formatWindSpeed } = require('../src/lib/utils.ts');

runTest('WMO Weather Code 0 returns Clear Sky and sunny category', () => {
  const result = getWmoWeatherDescription(0);
  assert.strictEqual(result.description, 'Clear Sky');
  assert.strictEqual(result.category, 'sunny');
});

runTest('WMO Weather Code 95 returns Thunderstorm and storm category', () => {
  const result = getWmoWeatherDescription(95);
  assert.strictEqual(result.description, 'Thunderstorm');
  assert.strictEqual(result.category, 'storm');
});

runTest('AQI Category: 45 is Good, 145 is Unhealthy for Sensitive, 220 is Very Unhealthy', () => {
  assert.strictEqual(getAqiCategory(45).level, 'good');
  assert.strictEqual(getAqiCategory(145).level, 'unhealthy-sensitive');
  assert.strictEqual(getAqiCategory(220).level, 'very-unhealthy');
});

runTest('UV Index Category: 11 returns Extreme', () => {
  assert.strictEqual(getUvCategory(11).label, 'Extreme');
});

runTest('Temperature formatting converts Celsius to Fahrenheit accurately', () => {
  assert.strictEqual(formatTemperature(20, 'celsius'), '20°C');
  assert.strictEqual(formatTemperature(20, 'fahrenheit'), '68°F');
  assert.strictEqual(formatTemperature(NaN), '--');
});

runTest('Wind speed formatting converts km/h to mph and m/s accurately', () => {
  assert.strictEqual(formatWindSpeed(36, 'kmh'), '36 km/h');
  assert.strictEqual(formatWindSpeed(36, 'ms'), '10 m/s');
  assert.strictEqual(formatWindSpeed(36, 'mph'), '22 mph');
});

// 2. Weather Scores Engine Tests
const { calculateFitnessScore, calculateCommuteScore, calculateOutdoorScore, calculateEventScore } = require('../src/lib/scores/weather-scores.ts');

runTest('Fitness Score: Severe rain and high heat reduce score drastically', () => {
  const currentBad = { temperature: 38, feelsLike: 42, humidity: 90, pressure: 1008, windSpeed: 40, windDirection: 0, visibility: 2, uvIndex: 10, wmoCode: 95, condition: 'Thunderstorm', isDay: true, precipitation: 15 };
  const aqiBad = { aqi: 180, pm25: 60, pm10: 120, category: 'unhealthy', status: 'Unhealthy' };
  const nextHours = [{ precipitationProbability: 90, time: '14:00', temperature: 38, feelsLike: 42, precipitation: 15, windSpeed: 40, uvIndex: 10, humidity: 90, wmoCode: 95, condition: 'Storm', isDay: true }];
  
  const score = calculateFitnessScore(currentBad, aqiBad, nextHours);
  assert.ok(score.score < 50, `Expected score < 50, got ${score.score}`);
  assert.strictEqual(score.status, 'Poor');
});

runTest('Fitness Score: Prime conditions (21°C, dry, clean air) yield High score', () => {
  const currentGood = { temperature: 21, feelsLike: 21, humidity: 55, pressure: 1013, windSpeed: 10, windDirection: 0, visibility: 10, uvIndex: 4, wmoCode: 1, condition: 'Clear', isDay: true, precipitation: 0 };
  const aqiGood = { aqi: 35, pm25: 8, pm10: 15, category: 'good', status: 'Good' };
  const nextHoursGood = [{ precipitationProbability: 5, time: '07:00', temperature: 21, feelsLike: 21, precipitation: 0, windSpeed: 10, uvIndex: 4, humidity: 55, wmoCode: 1, condition: 'Clear', isDay: true }];

  const score = calculateFitnessScore(currentGood, aqiGood, nextHoursGood);
  assert.ok(score.score >= 80, `Expected score >= 80, got ${score.score}`);
  assert.ok(score.status === 'Excellent' || score.status === 'Good');
});

runTest('Commute Score: Fog (vis < 3km) and wet roads decrease commute score', () => {
  const fogWeather = { temperature: 16, feelsLike: 16, humidity: 95, pressure: 1015, windSpeed: 12, windDirection: 90, visibility: 1.5, uvIndex: 1, wmoCode: 45, condition: 'Fog', isDay: true, precipitation: 4 };
  const score = calculateCommuteScore(fogWeather);
  assert.ok(score.score <= 60, `Expected commute score <= 60, got ${score.score}`);
  assert.ok(score.factors.some(f => f.name === 'Low Visibility'));
});

// 3. Smart Automation Rules Engine Tests
const { smartAutomationEngine } = require('../src/lib/automation/rules.ts');

runTest('Smart Automation triggers Rain Alert when rain probability >= 60%', () => {
  const mockWeather = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 24, feelsLike: 25, humidity: 75, pressure: 1010, windSpeed: 15, windDirection: 180, visibility: 8, uvIndex: 4, wmoCode: 61, condition: 'Rain', isDay: true, precipitation: 3 },
    hourly: [{ precipitationProbability: 85, time: '12:00', temperature: 24, feelsLike: 25, precipitation: 3, windSpeed: 15, uvIndex: 4, humidity: 75, wmoCode: 61, condition: 'Rain', isDay: true }],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const insights = smartAutomationEngine.evaluateRules(mockWeather, { fitness_enabled: true });
  assert.ok(insights.some(i => i.ruleKey === 'RAIN_ALERT'), 'Should trigger RAIN_ALERT');
  assert.ok(insights.some(i => i.ruleKey === 'FITNESS_ALTERNATE_WINDOW'), 'Should trigger FITNESS_ALTERNATE_WINDOW');
});

runTest('Smart Automation triggers High UV Alert when UV >= 8', () => {
  const mockSunny = {
    location: { name: 'Goa', country: 'India', lat: 15.29, lon: 74.12 },
    current: { temperature: 32, feelsLike: 36, humidity: 65, pressure: 1010, windSpeed: 12, windDirection: 270, visibility: 10, uvIndex: 9, wmoCode: 0, condition: 'Clear', isDay: true, precipitation: 0 },
    hourly: [{ precipitationProbability: 0, time: '13:00', temperature: 32, feelsLike: 36, precipitation: 0, windSpeed: 12, uvIndex: 9, humidity: 65, wmoCode: 0, condition: 'Clear', isDay: true }],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const insights = smartAutomationEngine.evaluateRules(mockSunny);
  assert.ok(insights.some(i => i.ruleKey === 'UV_ALERT'), 'Should trigger UV_ALERT');
});

// 4. Personalization Engine Deterministic Ordering Tests
const { personalizationEngine } = require('../src/lib/personalization/engine.ts');

runTest('Personalization Engine prioritizes severe alerts to rank 1 when alerts exist', () => {
  const weatherWithAlert = {
    location: { name: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87 },
    current: { temperature: 30, feelsLike: 35, humidity: 85, pressure: 998, windSpeed: 55, windDirection: 240, visibility: 4, uvIndex: 3, wmoCode: 95, condition: 'Severe Storm', isDay: true, precipitation: 20 },
    hourly: [{ precipitationProbability: 95, time: '15:00', temperature: 30, feelsLike: 35, precipitation: 20, windSpeed: 55, uvIndex: 3, humidity: 85, wmoCode: 95, condition: 'Storm', isDay: true }],
    daily: [],
    alerts: [{ id: 'storm-1', title: 'Severe Cyclone Warning', severity: 'extreme', category: 'storm', description: 'Gale winds', effective: '', expires: '', source: 'IMD' }],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const cards = personalizationEngine.calculateCardPriorities(weatherWithAlert, { fitness_enabled: true });
  assert.strictEqual(cards[0].id, 'severe-alerts', 'Severe alerts must be rank #1');
  assert.strictEqual(cards[0].rank, 1);
});

runTest('Personalization Engine prioritizes fitness window above baseline when fitness is enabled', () => {
  const weatherClear = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 22, feelsLike: 22, humidity: 60, pressure: 1012, windSpeed: 10, windDirection: 90, visibility: 10, uvIndex: 5, wmoCode: 1, condition: 'Clear', isDay: true, precipitation: 0 },
    hourly: [
      { precipitationProbability: 0, time: '06:00', temperature: 19, feelsLike: 19, precipitation: 0, windSpeed: 8, uvIndex: 1, humidity: 65, wmoCode: 1, condition: 'Clear', isDay: true },
      { precipitationProbability: 0, time: '07:00', temperature: 21, feelsLike: 21, precipitation: 0, windSpeed: 10, uvIndex: 3, humidity: 60, wmoCode: 1, condition: 'Clear', isDay: true },
    ],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const cardsWithFitness = personalizationEngine.calculateCardPriorities(weatherClear, { fitness_enabled: true });
  const cardsWithoutFitness = personalizationEngine.calculateCardPriorities(weatherClear, { fitness_enabled: false });

  const fitnessRankWith = cardsWithFitness.find(c => c.id === 'fitness-card').rank;
  const fitnessRankWithout = cardsWithoutFitness.find(c => c.id === 'fitness-card').rank;

  assert.ok(fitnessRankWith < fitnessRankWithout, 'Fitness rank should be significantly higher when fitness profile is enabled');
});

// 5. Multilingual Dictionary Completeness Tests
const { translations } = require('../src/lib/i18n/translations.ts');

runTest('Multilingual: All languages (en, kn, hi) contain required dictionary keys', () => {
  const enKeys = Object.keys(translations.en);
  const knKeys = Object.keys(translations.kn);
  const hiKeys = Object.keys(translations.hi);

  assert.strictEqual(knKeys.length, enKeys.length, 'Kannada dictionary must match English key count');
  assert.strictEqual(hiKeys.length, enKeys.length, 'Hindi dictionary must match English key count');

  enKeys.forEach(k => {
    assert.ok(translations.kn[k], `Missing Kannada translation for key: ${k}`);
    assert.ok(translations.hi[k], `Missing Hindi translation for key: ${k}`);
  });
});

// 6. Rain Nowcasting Engine Tests
const { rainNowcastingEngine } = require('../src/lib/weather/nowcast.ts');

runTest('Rain Nowcast: Heavy rain (>5mm/hr or prob >= 75%) returns Heavy Downpour with High confidence', () => {
  const rainPayload = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 23, feelsLike: 24, humidity: 88, pressure: 1008, windSpeed: 25, windDirection: 220, visibility: 5, uvIndex: 2, wmoCode: 65, condition: 'Heavy Rain', isDay: true, precipitation: 8 },
    hourly: [
      { precipitationProbability: 90, time: '13:00', temperature: 23, feelsLike: 24, precipitation: 8, windSpeed: 25, uvIndex: 2, humidity: 88, wmoCode: 65, condition: 'Heavy Rain', isDay: true },
      { precipitationProbability: 80, time: '14:00', temperature: 22, feelsLike: 23, precipitation: 5, windSpeed: 20, uvIndex: 1, humidity: 90, wmoCode: 63, condition: 'Moderate Rain', isDay: true },
      { precipitationProbability: 70, time: '15:00', temperature: 22, feelsLike: 23, precipitation: 3, windSpeed: 18, uvIndex: 1, humidity: 90, wmoCode: 61, condition: 'Rain', isDay: true }
    ],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const res = rainNowcastingEngine.calculateNowcast(rainPayload);
  assert.strictEqual(res.hasImminentRain, true);
  assert.strictEqual(res.intensity, 'Heavy Downpour');
  assert.strictEqual(res.confidence, 'High');
  assert.strictEqual(res.sourceAgreement, 'Strong Agreement');
  assert.ok(res.summary.includes('Heavy Downpour expected'));
});

runTest('Rain Nowcast: Clear conditions return None intensity and minimal precipitation risk', () => {
  const dryPayload = {
    location: { name: 'Jaipur', country: 'India', lat: 26.91, lon: 75.78 },
    current: { temperature: 31, feelsLike: 31, humidity: 40, pressure: 1014, windSpeed: 12, windDirection: 90, visibility: 10, uvIndex: 8, wmoCode: 0, condition: 'Sunny', isDay: true, precipitation: 0 },
    hourly: [
      { precipitationProbability: 0, time: '12:00', temperature: 31, feelsLike: 31, precipitation: 0, windSpeed: 12, uvIndex: 8, humidity: 40, wmoCode: 0, condition: 'Sunny', isDay: true },
      { precipitationProbability: 5, time: '13:00', temperature: 33, feelsLike: 33, precipitation: 0, windSpeed: 14, uvIndex: 9, humidity: 38, wmoCode: 0, condition: 'Sunny', isDay: true },
      { precipitationProbability: 5, time: '14:00', temperature: 34, feelsLike: 34, precipitation: 0, windSpeed: 15, uvIndex: 8, humidity: 35, wmoCode: 0, condition: 'Sunny', isDay: true }
    ],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const res = rainNowcastingEngine.calculateNowcast(dryPayload);
  assert.strictEqual(res.hasImminentRain, false);
  assert.strictEqual(res.intensity, 'None');
  assert.ok(res.summary.includes('Minimal precipitation risk'));
});

runTest('Rain Nowcast: Telemetry age > 45 minutes reduces confidence to Medium', () => {
  const staleTime = new Date(Date.now() - 55 * 60000).toISOString();
  const stalePayload = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 24, feelsLike: 24, humidity: 70, pressure: 1010, windSpeed: 10, windDirection: 0, visibility: 8, uvIndex: 3, wmoCode: 1, condition: 'Clear', isDay: true, precipitation: 0 },
    hourly: [
      { precipitationProbability: 10, time: '12:00', temperature: 24, feelsLike: 24, precipitation: 0, windSpeed: 10, uvIndex: 3, humidity: 70, wmoCode: 1, condition: 'Clear', isDay: true },
      { precipitationProbability: 10, time: '13:00', temperature: 25, feelsLike: 25, precipitation: 0, windSpeed: 10, uvIndex: 4, humidity: 68, wmoCode: 1, condition: 'Clear', isDay: true },
      { precipitationProbability: 10, time: '14:00', temperature: 25, feelsLike: 25, precipitation: 0, windSpeed: 10, uvIndex: 3, humidity: 65, wmoCode: 1, condition: 'Clear', isDay: true }
    ],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: staleTime
  };

  const res = rainNowcastingEngine.calculateNowcast(stalePayload);
  assert.strictEqual(res.confidence, 'Medium');
  assert.ok(res.dataFreshnessMinutes >= 50);
});

// 7. Weather Decision Engine Tests
const { weatherDecisionEngine } = require('../src/lib/intelligence/decision-engine.ts');

runTest('Weather Decision Engine: Generates exactly 8 daylight/twilight slots in Risk Timeline', () => {
  const samplePayload = {
    location: { name: 'Delhi', country: 'India', lat: 28.61, lon: 77.20 },
    current: { temperature: 29, feelsLike: 31, humidity: 65, pressure: 1010, windSpeed: 15, windDirection: 180, visibility: 6, uvIndex: 6, wmoCode: 2, condition: 'Partly Cloudy', isDay: true, precipitation: 0 },
    hourly: [
      { precipitationProbability: 10, time: '06:00', temperature: 22, feelsLike: 22, precipitation: 0, windSpeed: 8, uvIndex: 1, humidity: 75, wmoCode: 1, condition: 'Clear', isDay: true },
      { precipitationProbability: 15, time: '08:00', temperature: 25, feelsLike: 25, precipitation: 0, windSpeed: 10, uvIndex: 3, humidity: 70, wmoCode: 1, condition: 'Clear', isDay: true },
      { precipitationProbability: 20, time: '10:00', temperature: 28, feelsLike: 29, precipitation: 0, windSpeed: 12, uvIndex: 6, humidity: 65, wmoCode: 2, condition: 'Partly Cloudy', isDay: true },
      { precipitationProbability: 35, time: '12:00', temperature: 32, feelsLike: 34, precipitation: 0, windSpeed: 14, uvIndex: 8, humidity: 55, wmoCode: 2, condition: 'Partly Cloudy', isDay: true },
      { precipitationProbability: 70, time: '14:00', temperature: 30, feelsLike: 33, precipitation: 5, windSpeed: 20, uvIndex: 4, humidity: 75, wmoCode: 63, condition: 'Rain', isDay: true },
      { precipitationProbability: 50, time: '16:00', temperature: 28, feelsLike: 30, precipitation: 2, windSpeed: 16, uvIndex: 2, humidity: 80, wmoCode: 61, condition: 'Light Rain', isDay: true },
      { precipitationProbability: 20, time: '18:00', temperature: 26, feelsLike: 27, precipitation: 0, windSpeed: 12, uvIndex: 0, humidity: 80, wmoCode: 2, condition: 'Partly Cloudy', isDay: false },
      { precipitationProbability: 10, time: '20:00', temperature: 24, feelsLike: 25, precipitation: 0, windSpeed: 10, uvIndex: 0, humidity: 82, wmoCode: 1, condition: 'Clear', isDay: false }
    ],
    daily: [],
    alerts: [],
    airQuality: { aqi: 110, pm25: 42, pm10: 85, category: 'moderate', status: 'Moderate' },
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const decision = weatherDecisionEngine.evaluate(samplePayload);
  assert.strictEqual(decision.riskTimeline.length, 8);
  assert.strictEqual(decision.riskTimeline[0].timeLabel, '6 AM');
  assert.strictEqual(decision.riskTimeline[3].timeLabel, '12 PM');
  assert.strictEqual(decision.riskTimeline[7].timeLabel, '8 PM');

  // The 2 PM slot with 70% rain should be High risk
  const slot2PM = decision.riskTimeline.find(s => s.timeLabel === '2 PM');
  assert.ok(slot2PM);
  assert.strictEqual(slot2PM.riskLevel, 'High');
});

runTest('Weather Decision Engine: Active severe alert results in Severe overall risk with advisory action', () => {
  const alertPayload = {
    location: { name: 'Kolkata', country: 'India', lat: 22.57, lon: 88.36 },
    current: { temperature: 32, feelsLike: 38, humidity: 90, pressure: 994, windSpeed: 60, windDirection: 120, visibility: 3, uvIndex: 2, wmoCode: 95, condition: 'Severe Storm', isDay: true, precipitation: 25 },
    hourly: [{ precipitationProbability: 95, time: '14:00', temperature: 32, feelsLike: 38, precipitation: 25, windSpeed: 60, uvIndex: 2, humidity: 90, wmoCode: 95, condition: 'Severe Storm', isDay: true }],
    daily: [],
    alerts: [{ id: 'storm-cyclone-1', title: 'Severe Cyclonic Storm Red Warning', severity: 'extreme', category: 'storm', description: 'Gale wind force 9', instruction: 'Evacuate low-lying areas immediately.', effective: '', expires: '', source: 'IMD' }],
    airQuality: { aqi: 65, pm25: 18, pm10: 45, category: 'good', status: 'Good' },
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const decision = weatherDecisionEngine.evaluate(alertPayload);
  assert.strictEqual(decision.overallRiskLevel, 'Severe');
  assert.strictEqual(decision.topPriorityAction, 'Evacuate low-lying areas immediately.');
});

runTest('Weather Decision Engine: Integrates planned events and generates viable outdoor warning', () => {
  const rainyDayPayload = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 23, feelsLike: 24, humidity: 85, pressure: 1010, windSpeed: 15, windDirection: 200, visibility: 7, uvIndex: 3, wmoCode: 61, condition: 'Rain', isDay: true, precipitation: 4 },
    hourly: [{ precipitationProbability: 75, time: '16:00', temperature: 23, feelsLike: 24, precipitation: 4, windSpeed: 15, uvIndex: 3, humidity: 85, wmoCode: 61, condition: 'Rain', isDay: true }],
    daily: [],
    alerts: [],
    airQuality: { aqi: 45, pm25: 12, pm10: 25, category: 'good', status: 'Good' },
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const mockEvents = [
    { id: 'ev-1', user_id: 'usr-1', title: 'Sunset Garden Party', event_date: '2026-09-28', location_name: 'Cubbon Park', latitude: 12.97, longitude: 77.59, created_at: '' }
  ];

  const decision = weatherDecisionEngine.evaluate(rainyDayPayload, null, mockEvents);
  assert.ok(decision.eventViabilityNote);
  assert.ok(decision.eventViabilityNote.includes('Sunset Garden Party'));
  assert.ok(decision.eventViabilityNote.includes('Waterproof canopy advised'));
});

// 8. Provider Contracts & Providers Integrity Tests
const { radarProvider } = require('../src/lib/providers/radar-provider.ts');
const { satelliteProvider } = require('../src/lib/providers/satellite-provider.ts');

runTest('Radar Provider: Implements IRadarProvider interface and identity contracts', () => {
  assert.strictEqual(radarProvider.id, 'rainviewer-radar');
  assert.strictEqual(radarProvider.name, 'RainViewer Global Doppler Radar Network');
  assert.strictEqual(typeof radarProvider.getRadarFrames, 'function');
});

runTest('Satellite Provider: Implements ISatelliteProvider interface and identity contracts', () => {
  assert.strictEqual(satelliteProvider.id, 'satellite-core');
  assert.strictEqual(satelliteProvider.name, 'EUMETSAT / NOAA / Open-Meteo Earth Observation');
  assert.strictEqual(typeof satelliteProvider.getSatelliteLayers, 'function');
});

// 9. Weather Motion Engine & Visual Themes Tests
const { weatherMotionEngine } = require('../src/lib/theme/weather-motion-engine.ts');

runTest('Weather Motion Engine: Aurora theme generates electric cyan and aurora wave particles', () => {
  const state = weatherMotionEngine.calculateVisualState(null, 'aurora');
  assert.strictEqual(state.themeId, 'aurora');
  assert.strictEqual(state.particleType, 'aurora');
  assert.strictEqual(state.accentColor, '#22d3ee');
  assert.ok(state.heroHeadline.includes('Aurora'));
});

runTest('Weather Motion Engine: Earth theme generates command center telemetry and satellite grid', () => {
  const state = weatherMotionEngine.calculateVisualState(null, 'earth');
  assert.strictEqual(state.themeId, 'earth');
  assert.strictEqual(state.particleType, 'satellite-grid');
  assert.strictEqual(state.accentColor, '#10b981');
  assert.ok(state.heroHeadline.includes('Earth Command'));
});

runTest('Weather Motion Engine: Nature theme generates soothing green and organic atmosphere', () => {
  const state = weatherMotionEngine.calculateVisualState(null, 'nature');
  assert.strictEqual(state.themeId, 'nature');
  assert.strictEqual(state.accentColor, '#34d399');
  assert.ok(state.heroHeadline.includes('Nature'));
});

runTest('Weather Motion Engine: Weather Glass theme generates VisionOS crystal style with no canvas noise', () => {
  const state = weatherMotionEngine.calculateVisualState(null, 'glass');
  assert.strictEqual(state.themeId, 'glass');
  assert.strictEqual(state.particleType, 'none');
  assert.strictEqual(state.accentColor, '#e2e8f0');
  assert.ok(state.glassPanelClass.includes('backdrop-blur-3xl'));
});

runTest('Weather Motion Engine: Living Weather dynamically enables lightning and storm aura on WMO 95', () => {
  const stormPayload = {
    location: { name: 'Kolkata', country: 'India', lat: 22.57, lon: 88.36 },
    current: { temperature: 28, feelsLike: 34, humidity: 95, pressure: 996, windSpeed: 50, windDirection: 180, visibility: 3, uvIndex: 1, wmoCode: 95, condition: 'Thunderstorm', isDay: true, precipitation: 15 },
    hourly: [{ precipitationProbability: 95, time: '15:00', temperature: 28, feelsLike: 34, precipitation: 15, windSpeed: 50, uvIndex: 1, humidity: 95, wmoCode: 95, condition: 'Storm', isDay: true }],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const state = weatherMotionEngine.calculateVisualState(stormPayload, 'living-weather');
  assert.strictEqual(state.conditionKey, 'storm');
  assert.strictEqual(state.enableLightning, true);
  assert.strictEqual(state.particleType, 'lightning');
  assert.strictEqual(state.accentColor, '#818cf8');
});

runTest('Weather Motion Engine: Living Weather triggers rain streaks for active precipitation', () => {
  const rainPayload = {
    location: { name: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59 },
    current: { temperature: 22, feelsLike: 22, humidity: 85, pressure: 1010, windSpeed: 18, windDirection: 240, visibility: 6, uvIndex: 3, wmoCode: 61, condition: 'Rain', isDay: true, precipitation: 4 },
    hourly: [{ precipitationProbability: 80, time: '14:00', temperature: 22, feelsLike: 22, precipitation: 4, windSpeed: 18, uvIndex: 3, humidity: 85, wmoCode: 61, condition: 'Rain', isDay: true }],
    daily: [],
    alerts: [],
    provider: 'Test',
    isLive: true,
    fetchedAt: new Date().toISOString()
  };

  const state = weatherMotionEngine.calculateVisualState(rainPayload, 'living-weather');
  assert.strictEqual(state.conditionKey, 'rain');
  assert.strictEqual(state.particleType, 'rain');
  assert.strictEqual(state.accentColor, '#38bdf8');
});

// 10. AI Assistant & Intelligence Architecture Tests
const { intentRouter } = require('../src/lib/ai/intent-router.ts');
const { responseValidator } = require('../src/lib/ai/validator.ts');
const { synthesizerProvider } = require('../src/lib/ai/providers/synthesizer.ts');
const { aiService } = require('../src/lib/ai/service.ts');
const { db } = require('../src/lib/db/database.ts');

runTest('AI Intent Router: Accurately classifies running and fitness queries', () => {
  const route = intentRouter.classify('Can I go for a run in Cubbon park right now?');
  assert.strictEqual(route.intent, 'running_fitness');
  assert.ok(route.requiredContexts.includes('fitness'));
  assert.ok(route.requiredContexts.includes('weather'));
  assert.strictEqual(route.isStructuredWeatherQuery, true);
  assert.ok(route.extractedLocation?.toLowerCase().includes('cubbon'));
});

runTest('AI Intent Router: Accurately classifies precipitation and umbrella queries', () => {
  const route = intentRouter.classify('Will it rain today? Should I carry an umbrella?');
  assert.strictEqual(route.intent, 'rain_forecast');
  assert.ok(route.requiredContexts.includes('forecast'));
  assert.strictEqual(route.isStructuredWeatherQuery, true);
});

runTest('AI Response Validator: Confirms truthful meteorological numbers and catches discrepancies', () => {
  const mockContext = {
    intent: 'running_fitness',
    location: { name: 'Bengaluru', lat: 12.97, lon: 77.59, source: 'current_gps' },
    weather: {
      temperature: 24,
      feelsLike: 25,
      condition: 'Clear',
      rainProbability: 10,
      precipitationMm: 0,
      windSpeed: 10,
      windDirection: 180,
      humidity: 60,
      uvIndex: 5,
      visibilityKm: 10,
      pressureHpa: 1012,
      sunrise: '06:12',
      sunset: '18:25',
      isDay: true,
      dataAgeSeconds: 120,
      dataSource: 'Open-Meteo'
    },
    userContext: { language: 'en', temperatureUnit: 'celsius', lifestyle: ['fitness'], savedLocations: [] },
    alerts: []
  };

  // Truthful response matching 24°C and 10% rain
  const validResult = responseValidator.validate('Temperature is 24°C with 10% chance of rain.', mockContext);
  assert.strictEqual(validResult.isValid, true);
  assert.strictEqual(validResult.warnings.length, 0);

  // Wildly hallucinated response (claiming 45°C when actual is 24°C)
  const invalidResult = responseValidator.validate('Temperature is 45°C with severe heat.', mockContext);
  assert.strictEqual(invalidResult.isValid, false);
  assert.ok(invalidResult.warnings.length > 0);
});

runTest('AI Synthesizer Provider: Formats structured decision output with key metrics and timestamps', async () => {
  const mockContext = {
    intent: 'running_fitness',
    location: { name: 'Bengaluru', lat: 12.97, lon: 77.59, source: 'current_gps' },
    weather: {
      temperature: 22,
      feelsLike: 23,
      condition: 'Partly Cloudy',
      rainProbability: 15,
      precipitationMm: 0,
      windSpeed: 12,
      windDirection: 200,
      humidity: 65,
      uvIndex: 4,
      visibilityKm: 10,
      pressureHpa: 1013,
      sunrise: '06:12',
      sunset: '18:25',
      isDay: true,
      dataAgeSeconds: 60,
      dataSource: 'Open-Meteo'
    },
    airQuality: { aqi: 45, status: 'Good' },
    userContext: { language: 'en', temperatureUnit: 'celsius', lifestyle: ['fitness'], savedLocations: [] },
    alerts: []
  };

  const res = await synthesizerProvider.generateText('Can I run now?', mockContext, '');
  assert.ok(res.text.includes('Running conditions'));
  assert.ok(res.text.includes('22°C'));
  assert.ok(res.text.includes('Best window'));
  assert.ok(res.text.includes('Data updated'));
});

runTest('AI Synthesizer Provider: Supports streaming token emission with metadata', async () => {
  const mockContext = {
    intent: 'weather_now',
    location: { name: 'Bengaluru', lat: 12.97, lon: 77.59, source: 'current_gps' },
    weather: {
      temperature: 25,
      feelsLike: 26,
      condition: 'Sunny',
      rainProbability: 5,
      precipitationMm: 0,
      windSpeed: 8,
      windDirection: 90,
      humidity: 50,
      uvIndex: 7,
      visibilityKm: 10,
      pressureHpa: 1014,
      sunrise: '06:12',
      sunset: '18:25',
      isDay: true,
      dataAgeSeconds: 90,
      dataSource: 'Open-Meteo'
    },
    userContext: { language: 'en', temperatureUnit: 'celsius', lifestyle: [], savedLocations: [] },
    alerts: []
  };

  let tokenCount = 0;
  let finalChunkReceived = false;

  await synthesizerProvider.generateStream('Weather now?', mockContext, '', (chunk) => {
    if (chunk.token) tokenCount++;
    if (chunk.isDone) finalChunkReceived = true;
  });

  assert.ok(tokenCount > 0);
  assert.strictEqual(finalChunkReceived, true);
});

runTest('AI Synthesizer Provider: Multilingual output in Kannada and Hindi retains numbers', async () => {
  const mockContext = {
    intent: 'running_fitness',
    location: { name: 'Bengaluru', lat: 12.97, lon: 77.59, source: 'current_gps' },
    weather: {
      temperature: 21,
      feelsLike: 21,
      condition: 'Clear',
      rainProbability: 10,
      precipitationMm: 0,
      windSpeed: 8,
      windDirection: 180,
      humidity: 55,
      uvIndex: 3,
      visibilityKm: 10,
      pressureHpa: 1012,
      sunrise: '06:12',
      sunset: '18:25',
      isDay: true,
      dataAgeSeconds: 120,
      dataSource: 'Open-Meteo'
    },
    userContext: { language: 'kn', temperatureUnit: 'celsius', lifestyle: ['fitness'], savedLocations: [] },
    alerts: []
  };

  const resKn = await synthesizerProvider.generateText('ಓಡಲು ಸಾಧ್ಯವೇ?', mockContext, '');
  assert.ok(resKn.text.includes('21°C'));
  assert.ok(resKn.text.includes('ತಾಪಮಾನ'));

  mockContext.userContext.language = 'hi';
  const resHi = await synthesizerProvider.generateText('क्या मैं दौड़ सकता हूँ?', mockContext, '');
  assert.ok(resHi.text.includes('21°C'));
  assert.ok(resHi.text.includes('तापमान'));
});

runTest('Database AI Conversation Persistence: Creates, retrieves, and clears conversations', async () => {
  const testUserId = `usr-test-${Date.now()}`;
  const conv = await db.createAIConversation(testUserId, 'Test Weather Chat');
  assert.ok(conv.id);
  assert.strictEqual(conv.user_id, testUserId);

  const msg = await db.createAIMessage(conv.id, 'user', 'Will it rain?');
  assert.strictEqual(msg.conversation_id, conv.id);
  assert.strictEqual(msg.content, 'Will it rain?');

  const messages = await db.getAIMessages(conv.id);
  assert.strictEqual(messages.length, 1);

  const cleared = await db.clearAIConversations(testUserId);
  assert.strictEqual(cleared, true);

  const remaining = await db.getAIConversations(testUserId);
  assert.strictEqual(remaining.length, 0);
});

// 12. Cinematic UI/UX & Flowing Background Engine
const { cinematicBackgroundEngine } = require('../src/lib/theme/cinematic-background-engine.ts');
const { AVAILABLE_THEMES } = require('../src/lib/theme/types.ts');
const { THEME_TOKENS } = require('../src/lib/theme/tokens.ts');

runTest('Cinematic Background Engine: Generates all 10 theme environments with scenery backdrops', () => {
  const all10Themes = [
    'midnight-ai', 'arctic', 'emerald', 'violet-cosmos', 'sunset',
    'ocean-pulse', 'monsoon', 'desert-glow', 'aurora-sky', 'storm-core'
  ];

  for (const themeId of all10Themes) {
    const env = cinematicBackgroundEngine.buildEnvironment({ themeId });
    assert.strictEqual(env.theme, themeId);
    assert.ok(env.environmentName.length > 5, `Environment name for ${themeId} should be descriptive`);
    assert.ok(env.skyGradient.includes('from-'), `Sky gradient for ${themeId} should be defined`);
    assert.ok(env.horizonGradient.includes('from-'), `Horizon gradient for ${themeId} should be defined`);
    assert.ok(env.atmosphericGlow.includes('radial-gradient'), `Atmospheric glow for ${themeId} should be defined`);
    assert.ok(env.sunMoonPosition.glow, `Sun/Moon glow for ${themeId} should be configured`);
  }
});

runTest('Cinematic Background Engine: Adapts timeOfDay and atmospheric illumination', () => {
  const mockWeatherSunrise = {
    current: { timestamp: '2026-09-28T06:15:00Z', weatherCode: 0, temperature: 20, rainProbability: 0, windSpeed: 10 },
    daily: [{ sunrise: '2026-09-28T06:10:00Z', sunset: '2026-09-28T18:20:00Z' }]
  };
  const sunriseEnv = cinematicBackgroundEngine.buildEnvironment({
    themeId: 'sunset',
    weather: mockWeatherSunrise
  });
  assert.strictEqual(sunriseEnv.timeOfDay, 'sunrise');

  const mockWeatherNight = {
    current: { timestamp: '2026-09-28T23:30:00Z', weatherCode: 0, temperature: 18, rainProbability: 0, windSpeed: 8 },
    daily: [{ sunrise: '2026-09-28T06:10:00Z', sunset: '2026-09-28T18:20:00Z' }]
  };
  const nightEnv = cinematicBackgroundEngine.buildEnvironment({
    themeId: 'violet-cosmos',
    weather: mockWeatherNight
  });
  assert.strictEqual(nightEnv.timeOfDay, 'night');
  assert.strictEqual(nightEnv.condition, 'clear-night');
});

runTest('Cinematic Background Engine: Triggers lightning and tempest squall on thunderstorm', () => {
  const mockWeatherStorm = {
    current: { timestamp: '2026-09-28T14:00:00Z', weatherCode: 95, temperature: 22, rainProbability: 95, windSpeed: 45 },
    daily: [{ sunrise: '2026-09-28T06:10:00Z', sunset: '2026-09-28T18:20:00Z' }]
  };
  const stormEnv = cinematicBackgroundEngine.buildEnvironment({
    themeId: 'storm-core',
    weather: mockWeatherStorm
  });
  assert.strictEqual(stormEnv.enableLightning, true);
  assert.strictEqual(stormEnv.condition, 'storm');
  assert.ok(stormEnv.rainIntensity >= 80);
});

runTest('Theme System: Exactly 10 premium cinematic themes registered with previews', () => {
  assert.strictEqual(AVAILABLE_THEMES.length, 10);
  const themeIds = AVAILABLE_THEMES.map(t => t.id);
  assert.ok(themeIds.includes('midnight-ai'));
  assert.ok(themeIds.includes('arctic'));
  assert.ok(themeIds.includes('emerald'));
  assert.ok(themeIds.includes('violet-cosmos'));
  assert.ok(themeIds.includes('sunset'));
  assert.ok(themeIds.includes('ocean-pulse'));
  assert.ok(themeIds.includes('monsoon'));
  assert.ok(themeIds.includes('desert-glow'));
  assert.ok(themeIds.includes('aurora-sky'));
  assert.ok(themeIds.includes('storm-core'));
});

runTest('Theme Tokens: All 10 themes contain complete Dark and Light token contracts', () => {
  for (const theme of AVAILABLE_THEMES) {
    const tokensDark = THEME_TOKENS[theme.id]?.dark;
    const tokensLight = THEME_TOKENS[theme.id]?.light;
    assert.ok(tokensDark, `Dark tokens missing for ${theme.id}`);
    assert.ok(tokensLight, `Light tokens missing for ${theme.id}`);
    assert.ok(tokensDark.primary, `Primary color missing in dark for ${theme.id}`);
    assert.ok(tokensLight.primary, `Primary color missing in light for ${theme.id}`);
    assert.ok(tokensDark.background, `Background missing in dark for ${theme.id}`);
    assert.ok(tokensLight.background, `Background missing in light for ${theme.id}`);
  }
});

// 13. Dynamic Weather World & Background Engine Tests
const { dynamicWeatherBackgroundEngine } = require('../src/lib/theme/dynamic-background-engine.ts');
const { weatherSceneController } = require('../src/lib/theme/weather-scene-controller.ts');
const { FEATURE_WORLDS } = require('../src/components/features/FeatureDock.tsx');

runTest('Dynamic Weather Background Engine: Deterministic WMO and Condition Mapping', () => {
  // CLEAR -> sunny (day) & clear-night (night)
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(0, 0, 10, 'day'), 'sunny');
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(0, 0, 10, 'night'), 'clear-night');

  // PARTLY_CLOUDY (WMO 2) -> sunny-clouds
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(2, 0, 10, 'day'), 'sunny-clouds');

  // CLOUDY (WMO 3) -> cloudy
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(3, 0, 10, 'day'), 'cloudy');

  // LIGHT_RAIN (WMO 51) -> rain-light
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(51, 45, 8, 'day'), 'rain-light');

  // MODERATE_RAIN (WMO 61) -> rain
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(61, 70, 6, 'day'), 'rain');

  // HEAVY_RAIN (WMO 65 or rainProb >= 85) -> heavy-rain
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(65, 90, 4, 'day'), 'heavy-rain');
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(61, 88, 5, 'day'), 'heavy-rain');

  // THUNDERSTORM (WMO 95) -> storm
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(95, 95, 3, 'day'), 'storm');

  // SNOW (WMO 71) -> snow
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(71, 50, 4, 'day'), 'snow');

  // FOG (WMO 45 or vis < 2.5km) -> fog
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(45, 10, 1.5, 'day'), 'fog');

  // HAZE (AQI >= 150) -> haze
  assert.strictEqual(dynamicWeatherBackgroundEngine.mapWeatherToSceneId(1, 0, 8, 'day', 165), 'haze');
});

runTest('Dynamic Weather Background Engine: Feature World Environments', () => {
  // Agriculture World
  const agriEnv = dynamicWeatherBackgroundEngine.computeScene({ selectedFeature: 'agriculture' });
  assert.strictEqual(agriEnv.sceneId, 'agriculture');
  assert.strictEqual(agriEnv.featureMode, 'agriculture');
  assert.strictEqual(agriEnv.backgroundScene.backdropSvgType, 'farmland-fields');
  assert.strictEqual(agriEnv.lighting.accentColor, '#10b981');

  // Fitness World
  const fitEnv = dynamicWeatherBackgroundEngine.computeScene({ selectedFeature: 'fitness' });
  assert.strictEqual(fitEnv.sceneId, 'fitness');
  assert.strictEqual(fitEnv.featureMode, 'fitness');
  assert.strictEqual(fitEnv.backgroundScene.backdropSvgType, 'mountain-trail');

  // Ocean World
  const oceanEnv = dynamicWeatherBackgroundEngine.computeScene({ selectedFeature: 'ocean' });
  assert.strictEqual(oceanEnv.sceneId, 'ocean');
  assert.strictEqual(oceanEnv.featureMode, 'ocean');
  assert.strictEqual(oceanEnv.backgroundScene.backdropSvgType, 'ocean-coastal');

  // Rain World
  const rainEnv = dynamicWeatherBackgroundEngine.computeScene({ selectedFeature: 'rain', rainProbability: 85 });
  assert.strictEqual(rainEnv.sceneId, 'heavy-rain');
  assert.strictEqual(rainEnv.rainAnimation.active, true);
  assert.ok(rainEnv.rainAnimation.intensity >= 75);
});

runTest('Weather Scene Controller: Manages feature switching and state notification', () => {
  let latestState = null;
  const unsubscribe = weatherSceneController.subscribe((s) => {
    latestState = s;
  });

  weatherSceneController.selectFeature('agriculture');
  assert.strictEqual(latestState.selectedFeature, 'agriculture');
  assert.strictEqual(latestState.currentScene.sceneId, 'agriculture');

  weatherSceneController.selectFeature(null);
  assert.strictEqual(latestState.selectedFeature, null);

  unsubscribe();
});

runTest('Feature Worlds Dock: All 12 feature items registered with valid metadata', () => {
  assert.strictEqual(FEATURE_WORLDS.length, 12);
  const ids = FEATURE_WORLDS.map(f => f.id);
  assert.ok(ids.includes('agriculture'));
  assert.ok(ids.includes('rain'));
  assert.ok(ids.includes('sunny'));
  assert.ok(ids.includes('cloudy'));
  assert.ok(ids.includes('fitness'));
  assert.ok(ids.includes('ocean'));
  assert.ok(ids.includes('weather'));
  assert.ok(ids.includes('satellite'));
  assert.ok(ids.includes('radar'));
  assert.ok(ids.includes('travel'));
  assert.ok(ids.includes('health'));
  assert.ok(ids.includes('events'));
});

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
