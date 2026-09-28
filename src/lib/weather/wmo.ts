/**
 * MAUSAM — Centralized WMO Meteorological Condition Engine
 * 
 * Single source of truth for weather code interpretation across the entire application:
 * WeatherHero, HourlyForecast, ForecastCard, DynamicBackground, AI Assistant, and Risk Timeline.
 */

export type WeatherCategory = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

export interface WeatherConditionInfo {
  code: number;
  condition: string;
  category: WeatherCategory;
  shortDesc: string;
  iconName: string;
  isPrecipitating: boolean;
  severityLevel: 'normal' | 'advisory' | 'warning' | 'severe';
}

export const WMO_MAP: Record<number, WeatherConditionInfo> = {
  0: { code: 0, condition: 'Clear Sky', category: 'sunny', shortDesc: 'Clear', iconName: 'sun', isPrecipitating: false, severityLevel: 'normal' },
  1: { code: 1, condition: 'Mainly Clear', category: 'sunny', shortDesc: 'Mostly Clear', iconName: 'sun-cloud', isPrecipitating: false, severityLevel: 'normal' },
  2: { code: 2, condition: 'Partly Cloudy', category: 'cloudy', shortDesc: 'Partly Cloudy', iconName: 'cloud-sun', isPrecipitating: false, severityLevel: 'normal' },
  3: { code: 3, condition: 'Overcast', category: 'cloudy', shortDesc: 'Cloudy', iconName: 'cloud', isPrecipitating: false, severityLevel: 'normal' },
  45: { code: 45, condition: 'Fog / Mist', category: 'fog', shortDesc: 'Fog', iconName: 'fog', isPrecipitating: false, severityLevel: 'advisory' },
  48: { code: 48, condition: 'Depositing Rime Fog', category: 'fog', shortDesc: 'Rime Fog', iconName: 'fog', isPrecipitating: false, severityLevel: 'advisory' },
  51: { code: 51, condition: 'Light Drizzle', category: 'rain', shortDesc: 'Drizzle', iconName: 'cloud-drizzle', isPrecipitating: true, severityLevel: 'normal' },
  53: { code: 53, condition: 'Moderate Drizzle', category: 'rain', shortDesc: 'Drizzle', iconName: 'cloud-drizzle', isPrecipitating: true, severityLevel: 'normal' },
  55: { code: 55, condition: 'Dense Drizzle', category: 'rain', shortDesc: 'Heavy Drizzle', iconName: 'cloud-rain', isPrecipitating: true, severityLevel: 'advisory' },
  56: { code: 56, condition: 'Freezing Drizzle', category: 'snow', shortDesc: 'Freezing Drizzle', iconName: 'cloud-snow', isPrecipitating: true, severityLevel: 'warning' },
  57: { code: 57, condition: 'Dense Freezing Drizzle', category: 'snow', shortDesc: 'Heavy Freezing Drizzle', iconName: 'cloud-snow', isPrecipitating: true, severityLevel: 'warning' },
  61: { code: 61, condition: 'Slight Rain', category: 'rain', shortDesc: 'Light Rain', iconName: 'cloud-rain', isPrecipitating: true, severityLevel: 'normal' },
  63: { code: 63, condition: 'Moderate Rain', category: 'rain', shortDesc: 'Rain', iconName: 'cloud-rain', isPrecipitating: true, severityLevel: 'advisory' },
  65: { code: 65, condition: 'Heavy Rain', category: 'rain', shortDesc: 'Heavy Rain', iconName: 'cloud-lightning', isPrecipitating: true, severityLevel: 'warning' },
  66: { code: 66, condition: 'Freezing Rain', category: 'snow', shortDesc: 'Freezing Rain', iconName: 'cloud-snow', isPrecipitating: true, severityLevel: 'warning' },
  67: { code: 67, condition: 'Heavy Freezing Rain', category: 'snow', shortDesc: 'Severe Freezing Rain', iconName: 'cloud-snow', isPrecipitating: true, severityLevel: 'severe' },
  71: { code: 71, condition: 'Slight Snowfall', category: 'snow', shortDesc: 'Light Snow', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'normal' },
  73: { code: 73, condition: 'Moderate Snowfall', category: 'snow', shortDesc: 'Snow', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'warning' },
  75: { code: 75, condition: 'Heavy Snowfall', category: 'snow', shortDesc: 'Heavy Snow', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'severe' },
  77: { code: 77, condition: 'Snow Grains', category: 'snow', shortDesc: 'Snow Grains', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'advisory' },
  80: { code: 80, condition: 'Slight Rain Showers', category: 'rain', shortDesc: 'Showers', iconName: 'cloud-rain', isPrecipitating: true, severityLevel: 'normal' },
  81: { code: 81, condition: 'Moderate Rain Showers', category: 'rain', shortDesc: 'Rain Showers', iconName: 'cloud-rain', isPrecipitating: true, severityLevel: 'advisory' },
  82: { code: 82, condition: 'Violent Rain Showers', category: 'rain', shortDesc: 'Torrential Showers', iconName: 'cloud-lightning', isPrecipitating: true, severityLevel: 'severe' },
  85: { code: 85, condition: 'Slight Snow Showers', category: 'snow', shortDesc: 'Snow Showers', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'advisory' },
  86: { code: 86, condition: 'Heavy Snow Showers', category: 'snow', shortDesc: 'Heavy Snow Showers', iconName: 'snowflake', isPrecipitating: true, severityLevel: 'severe' },
  95: { code: 95, condition: 'Thunderstorm', category: 'storm', shortDesc: 'Thunderstorm', iconName: 'cloud-lightning', isPrecipitating: true, severityLevel: 'warning' },
  96: { code: 96, condition: 'Thunderstorm with Slight Hail', category: 'storm', shortDesc: 'Hailstorm', iconName: 'cloud-lightning', isPrecipitating: true, severityLevel: 'severe' },
  99: { code: 99, condition: 'Thunderstorm with Heavy Hail', category: 'storm', shortDesc: 'Severe Hailstorm', iconName: 'cloud-lightning', isPrecipitating: true, severityLevel: 'severe' }
};

const DEFAULT_CONDITION: WeatherConditionInfo = {
  code: 2,
  condition: 'Partly Cloudy',
  category: 'cloudy',
  shortDesc: 'Partly Cloudy',
  iconName: 'cloud-sun',
  isPrecipitating: false,
  severityLevel: 'normal'
};

export function getWmoCondition(code: number): WeatherConditionInfo {
  return WMO_MAP[code] || DEFAULT_CONDITION;
}

export function getWmoWeatherDescription(code: number): { description: string; category: WeatherCategory } {
  const item = getWmoCondition(code);
  return {
    description: item.condition,
    category: item.category
  };
}
