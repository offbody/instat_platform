
export interface MetricPoint {
  date: string;
  value: number;
}

export interface ProcurementPoint {
  category: string;
  value: number;
}

export interface RatingData {
  name: string;
  rank: number;
  total: number;
  change: number; 
  icon: string;
}

export interface SOKBCriterion {
  name: string;
  value: number;
  color: string;
}

export interface SOKBCategoryData {
  title: string;
  criteria: SOKBCriterion[];
}

export interface RegionData {
  id: string;
  name: string;
  coords: [number, number];
  investment: number;
  projects: number;
  impactScore: number;
  description: string;
  lastUpdate: string;
}

export interface SOKBData {
  nationalGoalsProgress: number; 
  strategicEfficiency: number; 
  longTermStrategyScore: number; 
  
  healthSafetyIndex: number; 
  socialProgramsBudget: number; 
  vhiCoverage: number; 
  trainingHours: number; 
  
  regionalInvestment: number; 
  socialProjectsCount: number; 
  unemploymentImpact: number; 
  
  emissionReduction: MetricPoint[];
  environmentalRiskScore: number; 
  conservationProjects: number;

  laborProductivity: number; 
  localProcurement: ProcurementPoint[];

  companyRatings: RatingData[];
  
  sokbDetails: Record<string, SOKBCategoryData>;
  regions: RegionData[];
}

export type Section = 'overview' | 'strategy' | 'employees' | 'regions' | 'environment' | 'ai-insights' | 'questionnaire' | 'experts';
export type SOKBTab = 'development' | 'employees' | 'society' | 'ecology' | 'country';