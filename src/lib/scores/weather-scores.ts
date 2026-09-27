import { CurrentWeather, AirQualityData, HourlyForecastItem } from "../weather/types";

export interface ContextualScore {
  name: string;
  score: number; // 0 to 100
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Hazardous';
  badgeColor: string;
  reason: string;
  factors: {
    name: string;
    impact: 'positive' | 'neutral' | 'negative';
    detail: string;
  }[];
}

export function calculateFitnessScore(
  current: CurrentWeather,
  airQuality?: AirQualityData,
  nextHours?: HourlyForecastItem[]
): ContextualScore {
  let score = 100;
  const factors: ContextualScore['factors'] = [];

  // 1. Rain & Precipitation Impact
  const rainProb = nextHours?.[0]?.precipitationProbability ?? (current.precipitation > 0 ? 90 : 10);
  if (rainProb > 70) {
    score -= 35;
    factors.push({ name: 'Rain Risk', impact: 'negative', detail: `High rain chance (${rainProb}%)` });
  } else if (rainProb > 30) {
    score -= 15;
    factors.push({ name: 'Rain Risk', impact: 'neutral', detail: `Moderate rain probability (${rainProb}%)` });
  } else {
    factors.push({ name: 'Dry Conditions', impact: 'positive', detail: 'Minimal rain expected' });
  }

  // 2. Temperature Impact (Ideal: 16°C - 24°C)
  const temp = current.temperature;
  if (temp >= 18 && temp <= 24) {
    factors.push({ name: 'Ideal Temp', impact: 'positive', detail: `${temp}°C within prime cardiovascular range` });
  } else if ((temp >= 14 && temp < 18) || (temp > 24 && temp <= 30)) {
    score -= 10;
    factors.push({ name: 'Moderate Temp', impact: 'neutral', detail: `${temp}°C may require light layering or hydration` });
  } else if (temp > 30 && temp <= 36) {
    score -= 25;
    factors.push({ name: 'Heat Stress', impact: 'negative', detail: `${temp}°C requires careful pacing and hydration` });
  } else if (temp > 36 || temp < 10) {
    score -= 40;
    factors.push({ name: 'Thermal Extremes', impact: 'negative', detail: `${temp}°C not recommended for strenuous outdoor workouts` });
  }

  // 3. Air Quality Impact
  if (airQuality) {
    if (airQuality.aqi <= 50) {
      factors.push({ name: 'Clean Air', impact: 'positive', detail: `AQI ${airQuality.aqi} is optimal for deep breathing` });
    } else if (airQuality.aqi <= 100) {
      score -= 10;
      factors.push({ name: 'Moderate AQI', impact: 'neutral', detail: `AQI ${airQuality.aqi} acceptable for general fitness` });
    } else if (airQuality.aqi <= 150) {
      score -= 25;
      factors.push({ name: 'Elevated AQI', impact: 'negative', detail: `AQI ${airQuality.aqi} sensitive runners should reduce duration` });
    } else {
      score -= 45;
      factors.push({ name: 'Unhealthy AQI', impact: 'negative', detail: `AQI ${airQuality.aqi} indoor cardio strongly recommended` });
    }
  }

  // 4. Wind & Humidity
  if (current.windSpeed > 35) {
    score -= 15;
    factors.push({ name: 'Strong Gusts', impact: 'negative', detail: `Wind ${current.windSpeed} km/h presents resistance` });
  }
  if (current.humidity > 85) {
    score -= 10;
    factors.push({ name: 'High Humidity', impact: 'negative', detail: `${current.humidity}% hampers sweat evaporation` });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  let status: ContextualScore['status'] = 'Good';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (finalScore >= 85) {
    status = 'Excellent';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (finalScore >= 70) {
    status = 'Good';
    badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  } else if (finalScore >= 50) {
    status = 'Fair';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else {
    status = 'Poor';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }

  return {
    name: 'Fitness & Running Score',
    score: finalScore,
    status,
    badgeColor,
    reason: finalScore >= 75
      ? 'Optimal thermal balance and favorable wind conditions.'
      : finalScore >= 50
      ? 'Acceptable conditions, but monitor weather shifts and hydration.'
      : 'Unfavorable conditions; consider moving training indoors.',
    factors
  };
}

export function calculateOutdoorScore(current: CurrentWeather, airQuality?: AirQualityData): ContextualScore {
  let score = 100;
  const factors: ContextualScore['factors'] = [];

  if (current.uvIndex > 8) {
    score -= 20;
    factors.push({ name: 'Intense UV', impact: 'negative', detail: `UV ${current.uvIndex} requires high sun protection` });
  }
  if (current.precipitation > 0) {
    score -= 30;
    factors.push({ name: 'Active Rain', impact: 'negative', detail: 'Wet ground surfaces' });
  }
  if (airQuality && airQuality.aqi > 100) {
    score -= 20;
    factors.push({ name: 'Air Pollution', impact: 'negative', detail: `AQI ${airQuality.aqi}` });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    name: 'General Outdoor Score',
    score: finalScore,
    status: finalScore >= 75 ? 'Good' : finalScore >= 50 ? 'Fair' : 'Poor',
    badgeColor: finalScore >= 70 ? 'text-emerald-400' : 'text-amber-400',
    reason: finalScore >= 70 ? 'Pleasant atmospheric conditions for outdoor leisure.' : 'Reduced comfort due to atmospheric elements.',
    factors
  };
}

export function calculateCommuteScore(current: CurrentWeather): ContextualScore {
  let score = 100;
  const factors: ContextualScore['factors'] = [];

  if (current.visibility < 3) {
    score -= 35;
    factors.push({ name: 'Low Visibility', impact: 'negative', detail: `Visibility reduced to ${current.visibility} km` });
  }
  if (current.precipitation > 2) {
    score -= 25;
    factors.push({ name: 'Road Wetness', impact: 'negative', detail: 'Slick roads and potential traffic slowdowns' });
  }
  if (current.windSpeed > 40) {
    score -= 20;
    factors.push({ name: 'Crosswinds', impact: 'negative', detail: `Wind speeds of ${current.windSpeed} km/h` });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    name: 'Commute Safety Score',
    score: finalScore,
    status: finalScore >= 80 ? 'Good' : finalScore >= 60 ? 'Fair' : 'Poor',
    badgeColor: finalScore >= 70 ? 'text-emerald-400' : 'text-rose-400',
    reason: finalScore >= 75 ? 'Clear roadways and typical traffic pacing expected.' : 'Adverse weather may cause commute delays.',
    factors
  };
}

export function calculateEventScore(current: CurrentWeather, hourly?: HourlyForecastItem[]): ContextualScore {
  let score = 100;
  const factors: ContextualScore['factors'] = [];

  const maxRain = hourly?.slice(0, 6).reduce((max, h) => Math.max(max, h.precipitationProbability), 0) ?? 0;
  if (maxRain > 50) {
    score -= 40;
    factors.push({ name: 'Rain Contingency', impact: 'negative', detail: `Up to ${maxRain}% rain risk in next 6h` });
  }
  if (current.temperature > 32 || current.temperature < 15) {
    score -= 20;
    factors.push({ name: 'Thermal Discomfort', impact: 'neutral', detail: `${current.temperature}°C may affect guest comfort` });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    name: 'Event Viability Score',
    score: finalScore,
    status: finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Fair' : 'Poor',
    badgeColor: finalScore >= 70 ? 'text-emerald-400' : 'text-amber-400',
    reason: finalScore >= 75 ? 'Stable conditions for open-air gatherings.' : 'Rain canopy or indoor backup recommended.',
    factors
  };
}
