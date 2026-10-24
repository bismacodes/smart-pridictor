export type SoilType =
  | 'Sandy Loam'
  | 'Clay Loam'
  | 'Loamy'
  | 'Silty'
  | 'Heavy Clay'
  | 'Sandy'
  | 'Unsure / Typical Field Soil';

export type IrrigationType =
  | 'Rainfed Only (Natural Rainfall)'
  | 'Supplementary Borehole / Well'
  | 'Canal / Drip Irrigation Scheme'
  | 'Stream / River Pumping';

export interface FarmerLocation {
  country: string;
  state: string;
  lga: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PlantingInput {
  location: FarmerLocation;
  crop: string;
  intendedDate: string;
  soilType: SoilType | string;
  irrigation: IrrigationType | string;
  weatherObservation: string;
  rainfallTrend?: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'favorable';
  title: string;
  description: string;
  actionRecommendation: string;
}

export interface FarmActivity {
  stage: string;
  timing: string;
  activity: string;
  criticalNotes: string;
  reminderTag: string;
}

export interface AgronomicTip {
  category: string;
  tip: string;
}

export interface PlantingAdvice {
  recommendedDate: string;
  recommendedWindow: string;
  suitabilityScore: number; // 0 - 100
  suitabilityLevel: 'Optimal' | 'Good' | 'Moderate' | 'Risky';
  summaryReason: string;
  detailedExplanation: string;
  soilMoistureAssessment: {
    status: 'Adequate' | 'Deficit / Too Dry' | 'Excess / Waterlogged' | 'Building';
    score: number;
    details: string;
  };
  rainfallSuitability: {
    status: string;
    expectedRainfallMm: string;
    details: string;
  };
  distinctionForecastVsSeasonal: {
    shortTermForecast: string;
    seasonalOutlook: string;
    implication: string;
  };
  weatherAlerts: WeatherAlert[];
  agronomicTips: AgronomicTip[];
  activityTimeline: FarmActivity[];
  providerUsed: 'api' | 'local';
  modelUsed: string;
  timestamp: string;
}

export interface ProviderStatus {
  activeProvider: 'api' | 'local';
  apiModel: string;
  hasApiKey: boolean;
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaAvailable: boolean;
}
