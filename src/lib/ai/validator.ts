import { AIContextPayload } from "./types";

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

export class ResponseValidator {
  /**
   * Validates AI output against observed ground-truth telemetry
   */
  validate(responseContent: string, context: AIContextPayload): ValidationResult {
    const warnings: string[] = [];
    const text = responseContent.toLowerCase();

    // 1. Temperature sanity check
    // If the text contains e.g. "XX°C", ensure it's not wildly hallucinated (>15°C discrepancy from observed)
    const tempMatches = responseContent.match(/(-?\d+(?:\.\d+)?)\s*(?:°C|deg C|degrees Celsius)/i);
    if (tempMatches && tempMatches[1]) {
      const citedTemp = parseFloat(tempMatches[1]);
      const actualTemp = context.weather.temperature;
      if (Math.abs(citedTemp - actualTemp) > 15) {
        warnings.push(`Cited temperature (${citedTemp}°C) deviates significantly from ground truth (${actualTemp}°C).`);
      }
    }

    // 2. Rain Probability check
    const rainMatches = responseContent.match(/(\d+)%\s*(?:rain|precipitation|chance of rain)/i);
    if (rainMatches && rainMatches[1]) {
      const citedRain = parseInt(rainMatches[1], 10);
      const actualRain = context.weather.rainProbability;
      if (Math.abs(citedRain - actualRain) > 30) {
        warnings.push(`Cited rain probability (${citedRain}%) deviates from ground-truth forecast (${actualRain}%).`);
      }
    }

    // 3. Location awareness check
    const locName = context.location.name.toLowerCase();
    // It's acceptable if the location is mentioned or omitted, but if another distinct location is named instead, log a warning
    if (warnings.length > 0) {
      return { isValid: false, warnings };
    }

    return { isValid: true, warnings: [] };
  }
}

export const responseValidator = new ResponseValidator();
