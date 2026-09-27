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

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
