import { WeatherPayload } from "../weather/types";
import { UserPreferences } from "../db/types";

export interface AIResponsePayload {
  observedWeather: {
    location: string;
    temperature: string;
    condition: string;
    rainProbability: string;
    aqi?: string;
    uvIndex: number;
    windSpeed: string;
  };
  recommendation: string;
  actionItems: string[];
  confidence: 'High' | 'Moderate';
  poweredBy: 'Google Gemini' | 'Mausam Weather Synthesizer';
}

export async function askMausamAI(
  userQuestion: string,
  weather: WeatherPayload,
  preferences?: UserPreferences | null
): Promise<AIResponsePayload> {
  const currentRainProb = weather.hourly[0]?.precipitationProbability ?? 0;
  const aqiString = weather.airQuality ? `${weather.airQuality.aqi} (${weather.airQuality.status})` : 'Data unavailable';

  const observedWeather = {
    location: `${weather.location.name}${weather.location.country ? ', ' + weather.location.country : ''}`,
    temperature: `${weather.current.temperature}°C (Feels like ${weather.current.feelsLike}°C)`,
    condition: weather.current.condition,
    rainProbability: `${currentRainProb}%`,
    aqi: aqiString,
    uvIndex: weather.current.uvIndex,
    windSpeed: `${weather.current.windSpeed} km/h`
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `
You are "Mausam AI", an expert personal weather intelligence advisor for the Mausam platform.
Answer the user's question directly, strictly grounding your advice in the observed meteorological data provided below.
DO NOT hallucinate or contradict the observed weather data.
Format your answer with clear, structured reasoning.

[OBSERVED REAL-TIME WEATHER DATA]
Location: ${observedWeather.location}
Temperature: ${observedWeather.temperature}
Condition: ${observedWeather.condition}
Rain Probability: ${observedWeather.rainProbability}
Wind Speed: ${observedWeather.windSpeed}
UV Index: ${observedWeather.uvIndex}
Air Quality (AQI): ${observedWeather.aqi}
Active Alerts: ${weather.alerts.length > 0 ? weather.alerts.map(a => a.title).join('; ') : 'None'}
User Lifestyle Enabled: ${preferences ? Object.entries(preferences).filter(([k, v]) => k.endsWith('_enabled') && v).map(([k]) => k.replace('_enabled', '')).join(', ') : 'General'}

[USER QUESTION]
"${userQuestion}"

Respond with a helpful, friendly, precise recommendation and 2-4 bullet points of practical action items.
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          // Parse lines or bullets
          const lines = rawText.split('\n').filter((l: string) => l.trim().length > 0);
          const bullets = lines.filter((l: string) => l.trim().startsWith('*') || l.trim().startsWith('-') || /^\d+\./.test(l.trim()))
            .map((b: string) => b.replace(/^[\*\-\d\.]\s*/, '').trim());

          return {
            observedWeather,
            recommendation: rawText,
            actionItems: bullets.length > 0 ? bullets.slice(0, 4) : [
              `Plan around ${observedWeather.temperature}`,
              `Note ${observedWeather.rainProbability} rain probability`
            ],
            confidence: 'High',
            poweredBy: 'Google Gemini'
          };
        }
      }
    } catch {
      // Gracefully fall through to deterministic expert synthesizer
    }
  }

  // Deterministic Expert Synthesizer (when Gemini API key is not configured or offline)
  const q = userQuestion.toLowerCase();
  let recommendation = "";
  const actionItems: string[] = [];

  if (q.includes('run') || q.includes('walk') || q.includes('fitness') || q.includes('workout') || q.includes('cycle')) {
    if (currentRainProb > 60 || weather.current.precipitation > 0) {
      recommendation = `Outdoor running is not advised right now due to a ${currentRainProb}% rain probability and wet ground conditions in ${weather.location.name}. Indoor cardio is strongly recommended.`;
      actionItems.push('Switch to treadmill, stationary bike, or bodyweight circuit');
      actionItems.push('Check the 24-hour timeline for clearing weather windows');
    } else if (weather.airQuality && weather.airQuality.aqi > 150) {
      recommendation = `Outdoor exercise should be postponed or kept light. Current AQI in ${weather.location.name} is ${weather.airQuality.aqi} (${weather.airQuality.status}), which can cause respiratory strain.`;
      actionItems.push('Exercise in an indoor filtered air environment');
      actionItems.push('Keep hydration levels high');
    } else {
      recommendation = `Yes! Current conditions are favorable for outdoor running in ${weather.location.name}. The temperature is ${weather.current.temperature}°C with ${currentRainProb}% rain chance and wind at ${weather.current.windSpeed} km/h.`;
      actionItems.push('Optimal window is active for the next 2-3 hours');
      actionItems.push(weather.current.uvIndex > 6 ? 'Wear UV protection/sunglasses' : 'Standard hydration is sufficient');
    }
  } else if (q.includes('umbrella') || q.includes('rain') || q.includes('jacket')) {
    if (currentRainProb > 40 || weather.current.precipitation > 0) {
      recommendation = `Yes, definitely carry an umbrella or waterproof jacket. The precipitation probability is currently ${currentRainProb}% in ${weather.location.name}, with ${weather.current.condition.toLowerCase()}.`;
      actionItems.push('Keep a compact umbrella or raincoat in your bag');
      actionItems.push('Expect possible roadway puddles and transit delays');
    } else {
      recommendation = `An umbrella is not necessary right now. The rain probability is low at ${currentRainProb}% with ${weather.current.condition.toLowerCase()} in ${weather.location.name}.`;
      actionItems.push('Dry conditions expected over the next several hours');
      actionItems.push('Check back later if clouds gather in the evening');
    }
  } else if (q.includes('pack') || q.includes('travel') || q.includes('trip') || q.includes('london') || q.includes('flight')) {
    recommendation = `For travel to ${weather.location.name}, prepare for ${weather.current.temperature}°C temperatures and ${weather.current.condition.toLowerCase()}.`;
    actionItems.push(weather.current.temperature < 18 ? 'Warm layers, light sweater or fleece' : 'Breathable, lightweight cotton apparel');
    if (currentRainProb > 30) actionItems.push('Water-resistant jacket and waterproof walking shoes');
    if (weather.current.uvIndex > 5) actionItems.push('Sunscreen, polarized sunglasses and hat');
  } else if (q.includes('event') || q.includes('party') || q.includes('outdoor') || q.includes('tonight')) {
    if (currentRainProb > 50) {
      recommendation = `An outdoor event faces weather risks. Rain probability is ${currentRainProb}% with expected ${weather.current.condition.toLowerCase()}. Consider having an indoor backup plan or canopy setup.`;
      actionItems.push('Arrange waterproof canopy or tenting');
      actionItems.push('Monitor hourly radar progression');
    } else {
      recommendation = `Conditions look favorable for your event! Temperature is around ${weather.current.temperature}°C with only a ${currentRainProb}% rain probability in ${weather.location.name}.`;
      actionItems.push('Outdoor seating is viable');
      actionItems.push(weather.current.temperature < 18 ? 'Arrange patio heaters for evening guests' : 'Ensure adequate cold beverages');
    }
  } else if (q.includes('alert') || q.includes('warning') || q.includes('why')) {
    if (weather.alerts.length > 0) {
      const topAlert = weather.alerts[0];
      recommendation = `Active Alert: "${topAlert.title}". ${topAlert.description} Instruction: ${topAlert.instruction || 'Follow local civic guidance.'}`;
      actionItems.push(`Severity: ${topAlert.severity.toUpperCase()}`);
      actionItems.push(`Issued by: ${topAlert.source}`);
    } else {
      recommendation = `There are currently no active severe meteorological alerts for ${weather.location.name}. Ambient conditions are within normal parameters.`;
      actionItems.push('Normal travel and outdoor routines can proceed');
    }
  } else {
    recommendation = `Based on observed data for ${weather.location.name}: It is currently ${weather.current.temperature}°C with ${weather.current.condition.toLowerCase()}. Rain probability is ${currentRainProb}%, wind speed is ${weather.current.windSpeed} km/h, and air quality is ${observedWeather.aqi}.`;
    actionItems.push('Comfortable for routine daily activities');
    if (currentRainProb > 40) actionItems.push('Keep an umbrella handy');
    if (weather.current.uvIndex > 6) actionItems.push('Apply sun protection if outdoors');
  }

  return {
    observedWeather,
    recommendation,
    actionItems,
    confidence: 'High',
    poweredBy: 'Mausam Weather Synthesizer'
  };
}
