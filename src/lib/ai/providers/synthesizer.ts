import { IAIProvider } from "./base";
import { AIContextPayload, AIStreamChunk } from "../types";

export class MausamSynthesizerProvider implements IAIProvider {
  name = 'Mausam Weather Synthesizer';

  async generateText(
    prompt: string,
    context: AIContextPayload,
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const text = this.synthesize(prompt, context);
    const words = text.split(/\s+/).length;
    return {
      text,
      tokenUsage: {
        prompt_tokens: Math.round(prompt.length / 4),
        completion_tokens: Math.round(words * 1.3),
        total_tokens: Math.round(prompt.length / 4 + words * 1.3)
      }
    };
  }

  async generateStream(
    prompt: string,
    context: AIContextPayload,
    systemPrompt: string,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<{ fullText: string; tokenUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const fullText = this.synthesize(prompt, context);
    const tokens = fullText.split(' ');

    for (let i = 0; i < tokens.length; i++) {
      const isLast = i === tokens.length - 1;
      onChunk({
        token: (i === 0 ? '' : ' ') + tokens[i],
        isDone: isLast,
        metadata: isLast ? {
          intent: context.intent,
          location: context.location.name,
          provider: this.name,
          dataAgeSeconds: context.weather.dataAgeSeconds,
          confidence: 'High',
          sources: [context.weather.dataSource, 'CPCB Air Quality']
        } : undefined
      });
      // Small simulated latency for smooth streaming experience (5-15ms)
      if (!isLast && tokens.length > 10) {
        await new Promise(r => setTimeout(r, 8));
      }
    }

    const words = fullText.split(/\s+/).length;
    return {
      fullText,
      tokenUsage: {
        prompt_tokens: Math.round(prompt.length / 4),
        completion_tokens: Math.round(words * 1.3),
        total_tokens: Math.round(prompt.length / 4 + words * 1.3)
      }
    };
  }

  private synthesize(prompt: string, context: AIContextPayload): string {
    const { weather, airQuality, location, userContext, intent } = context;
    const lang = userContext.language;
    const dataAgeMinutes = Math.max(1, Math.round(weather.dataAgeSeconds / 60));
    const dataUpdatedStr = `${dataAgeMinutes} minute${dataAgeMinutes === 1 ? '' : 's'} ago`;

    const aqiStatus = airQuality?.status || 'Good';
    const uvLevel = weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 6 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low';

    // 1. RUNNING & FITNESS
    if (intent === 'running_fitness') {
      const isRainy = weather.rainProbability >= 40 || weather.precipitationMm > 0;
      const isExtremeHeat = weather.temperature > 32;
      const isPoorAQI = (airQuality?.aqi ?? 0) > 150;

      const isSuitable = !isRainy && !isExtremeHeat && !isPoorAQI;
      const recommendation = isSuitable 
        ? 'Current conditions are suitable for outdoor running.' 
        : isRainy 
          ? 'Wet conditions detected. Outdoor running is not recommended due to rain probability and slick roads.'
          : isPoorAQI 
            ? 'Air quality is degraded. Consider indoor treadmill training.'
            : 'Thermal stress elevated. Early morning or sunset hours are strongly recommended.';

      const bestWindow = weather.isDay ? '6:15 PM – 7:45 PM' : '6:00 AM – 7:30 AM';
      const why = isSuitable 
        ? 'Comfortable temperature and low rain probability.'
        : isRainy 
          ? 'High precipitation probability during the current hour.'
          : 'Better atmospheric dispersion and lower solar radiation.';

      if (lang === 'kn') {
        return `🏃 ಓಟ ಮತ್ತು ಫಿಟ್‌ನೆಸ್ ಪರಿಸ್ಥಿತಿಗಳು (${location.name})

ತಾಪಮಾನ: ${weather.temperature}°C (ಅನಿಸಿಕೆ: ${weather.feelsLike}°C)
ಮಳೆ ಸಂಭವನೀಯತೆ: ${weather.rainProbability}%
ಗಾಳಿಯ ವೇಗ: ${weather.windSpeed} km/h
ವಾಯು ಗುಣಮಟ್ಟ (AQI): ${airQuality ? airQuality.aqi : 'ಲಭ್ಯವಿಲ್ಲ'} (${aqiStatus})
UV ಸೂಚ್ಯಂಕ: ${weather.uvIndex} (${uvLevel})

ಸಲಹೆ:
${recommendation}

ಅತ್ಯುತ್ತಮ ಸಮಯ:
${bestWindow}

ಕಾರಣ:
${why}

ಮಾಹಿತಿ ನವೀಕರಣ:
${dataUpdatedStr}`;
      }

      if (lang === 'hi') {
        return `🏃 दौड़ने की मौसम स्थिति (${location.name})

तापमान: ${weather.temperature}°C (अनुभव: ${weather.feelsLike}°C)
बारिश की संभावना: ${weather.rainProbability}%
हवा की गति: ${weather.windSpeed} km/h
वायु गुणवत्ता (AQI): ${airQuality ? airQuality.aqi : 'उपलब्ध नहीं'} (${aqiStatus})
यूवी इंडेक्स: ${weather.uvIndex} (${uvLevel})

सिफारिश:
${recommendation}

सर्वश्रेष्ठ समय:
${bestWindow}

कारण:
${why}

डेटा अपडेट:
${dataUpdatedStr}`;
      }

      return `🏃 Running conditions for ${location.name}

Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
Rain: ${weather.rainProbability}%
Wind: ${weather.windSpeed} km/h
AQI: ${airQuality ? `${airQuality.aqi} • ` : ''}${aqiStatus}
UV: ${uvLevel} (${weather.uvIndex}/12)

Recommendation:
${recommendation}

Best window:
${bestWindow}

Why:
${why}

Data updated:
${dataUpdatedStr}`;
    }

    // 2. RAIN & UMBRELLA
    if (intent === 'rain_forecast') {
      const willRain = weather.rainProbability >= 40 || weather.precipitationMm > 0;
      const umbrellaRec = willRain 
        ? 'Yes, carry an umbrella. Precipitation probability is elevated.' 
        : 'An umbrella is not strictly required right now, as rain probability is low.';

      return `🌧️ Precipitation Outlook for ${location.name}

Current Condition: ${weather.condition}
Rain Probability: ${weather.rainProbability}%
Precipitation Volume: ${weather.precipitationMm} mm
Cloud Stratum: Overcast layer active

Recommendation:
${umbrellaRec}

Why:
Observed tropospheric precipitation index is ${weather.rainProbability}%.

Data updated:
${dataUpdatedStr}`;
    }

    // 3. TRAVEL & COMMUTE
    if (intent === 'travel' || intent === 'commute') {
      const roadRisk = weather.rainProbability > 50 || weather.visibilityKm < 3;
      return `🚗 Transit & Route Intelligence for ${location.name}

Visibility: ${weather.visibilityKm} km
Surface Condition: ${weather.precipitationMm > 0 ? 'Wet Surface' : 'Dry Surface'}
Wind Gusts: ${weather.windSpeed} km/h
Active Alerts: ${context.alerts.length > 0 ? context.alerts.map(a => a.title).join('; ') : 'None'}

Transit Assessment:
${roadRisk ? 'Road visibility reduced or wet surfaces detected. Exercise caution and allow 10-15 minutes extra buffer.' : 'Corridor conditions are clear with optimal transit visibility.'}

Data updated:
${dataUpdatedStr}`;
    }

    // 4. GENERAL WEATHER NOW
    return `🌤️ Current Weather Intelligence for ${location.name}

Temperature: ${weather.temperature}°C (Feels like ${weather.feelsLike}°C)
Condition: ${weather.condition}
Precipitation Probability: ${weather.rainProbability}%
Air Quality: ${airQuality ? `AQI ${airQuality.aqi} (${aqiStatus})` : 'Data unavailable'}
UV Index: ${weather.uvIndex} (${uvLevel})
Wind Speed: ${weather.windSpeed} km/h
Relative Humidity: ${weather.humidity}%

Outlook:
Atmospheric conditions in ${location.name} are currently ${weather.condition.toLowerCase()} with a barometric pressure of ${weather.pressureHpa} hPa.

Data updated:
${dataUpdatedStr}`;
  }
}

export const synthesizerProvider = new MausamSynthesizerProvider();
