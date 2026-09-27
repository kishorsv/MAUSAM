export type CardId =
  | 'severe-alerts'
  | 'hero-weather'
  | 'rain-warning'
  | 'fitness-card'
  | 'health-card'
  | 'hourly-timeline'
  | 'smart-scores'
  | 'commute-card'
  | 'travel-card'
  | 'family-card'
  | 'agriculture-card'
  | 'event-card'
  | 'beach-card'
  | 'daily-forecast';

export interface PrioritizedCard {
  id: CardId;
  title: string;
  category: 'core' | 'alert' | 'persona' | 'forecast';
  priorityScore: number;
  rank: number;
  explanation: string;
  scoringBreakdown: {
    userInterestScore: number;
    weatherSeverityScore: number;
    timeRelevanceScore: number;
    locationRelevanceScore: number;
    activityRelevanceScore: number;
  };
}

export interface ActivityWindow {
  startTime: string;
  endTime: string;
  temperature: number;
  condition: string;
  rainProbability: number;
  aqi?: number;
  rating: 'Optimal' | 'Acceptable' | 'Poor';
  recommendation: string;
}
