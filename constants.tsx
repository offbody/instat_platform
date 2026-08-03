
import { SOKBData } from './types';

export const INITIAL_DATA: SOKBData = {
  nationalGoalsProgress: 78,
  strategicEfficiency: 92,
  longTermStrategyScore: 85,
  
  healthSafetyIndex: 96,
  socialProgramsBudget: 4500000,
  vhiCoverage: 100,
  trainingHours: 42,
  
  regionalInvestment: 12.5, 
  socialProjectsCount: 24,
  unemploymentImpact: 3.2,
  
  emissionReduction: [
    { date: '2023-Q1', value: 500 },
    { date: '2023-Q2', value: 480 },
    { date: '2023-Q3', value: 450 },
    { date: '2023-Q4', value: 410 },
  ],
  environmentalRiskScore: 15, 
  conservationProjects: 8,

  laborProductivity: 88,
  localProcurement: [
    { category: 'Goods', value: 82 },
    { category: 'Works', value: 95 },
    { category: 'Services', value: 88 },
  ],

  companyRatings: [
    { name: 'ECG Rating', rank: 12, total: 250, change: 2, icon: 'assessment' },
    { name: 'SOKB Rating', rank: 5, total: 100, change: 1, icon: 'star' },
    { name: 'Employer Rating', rank: 8, total: 500, change: -3, icon: 'badge' },
  ],

  sokbDetails: {
    development: {
      title: 'Economy and Development',
      criteria: [
        { name: 'Productivity', value: 88, color: '#0052CC' },
        { name: 'Revenue/Taxes', value: 95, color: '#36B37E' },
        { name: 'R&D/Innovation', value: 72, color: '#FFAB00' },
        { name: 'Import Substitution', value: 65, color: '#00B8D9' },
        { name: 'Digital Maturity', value: 80, color: '#FF5630' },
      ]
    },
    employees: {
      title: 'Health and Workforce',
      criteria: [
        { name: 'Occupational Safety', value: 96, color: '#0052CC' },
        { name: 'Family Support', value: 85, color: '#36B37E' },
        { name: 'Pay and Benefits', value: 92, color: '#FFAB00' },
        { name: 'Training/Development', value: 88, color: '#00B8D9' },
        { name: 'Wellbeing Index', value: 91, color: '#FF5630' },
      ]
    },
    society: {
      title: 'Society and People',
      criteria: [
        { name: 'Human Potential', value: 78, color: '#0052CC' },
        { name: 'Inclusion/Equality', value: 82, color: '#36B37E' },
        { name: 'Volunteering', value: 65, color: '#FFAB00' },
        { name: 'Urban Improvement', value: 74, color: '#00B8D9' },
        { name: 'Traditional Values', value: 88, color: '#FF5630' },
      ]
    },
    ecology: {
      title: 'Environment and Habitat',
      criteria: [
        { name: 'Water Withdrawal', value: 84, color: '#0052CC' },
        { name: 'Carbon Footprint', value: 75, color: '#36B37E' },
        { name: 'Waste Recycling', value: 92, color: '#FFAB00' },
        { name: 'Green Energy', value: 45, color: '#00B8D9' },
        { name: 'Eco Investments', value: 88, color: '#FF5630' },
      ]
    },
    country: {
      title: 'State and Law',
      criteria: [
        { name: 'Compliance', value: 100, color: '#0052CC' },
        { name: 'Anti-corruption', value: 95, color: '#36B37E' },
        { name: 'SME Procurement', value: 88, color: '#FFAB00' },
        { name: 'National Projects', value: 90, color: '#00B8D9' },
        { name: 'Transparency', value: 94, color: '#FF5630' },
      ]
    }
  },

  regions: [
    {
      id: '1',
      name: 'Moscow Region',
      coords: [55.7558, 37.6173],
      investment: 5.2,
      projects: 12,
      impactScore: 94,
      description: 'A key logistics hub with projects in waste recycling and education cluster support.',
      lastUpdate: '20.05.2024'
    },
    {
      id: '2',
      name: 'Nizhny Novgorod Region',
      coords: [56.3269, 44.0059],
      investment: 2.8,
      projects: 5,
      impactScore: 82,
      description: 'An industrial center focused on production digitalization and talent pipeline development.',
      lastUpdate: '15.05.2024'
    },
    {
      id: '3',
      name: 'Krasnoyarsk Territory',
      coords: [56.0153, 92.8932],
      investment: 3.5,
      projects: 8,
      impactScore: 88,
      description: 'Environmental initiatives for forest conservation and air purification system upgrades.',
      lastUpdate: '18.05.2024'
    },
    {
      id: '4',
      name: 'Republic of Tatarstan',
      coords: [55.7887, 49.1221],
      investment: 4.1,
      projects: 10,
      impactScore: 91,
      description: 'A leader in industrial innovation and ESG project implementation.',
      lastUpdate: '22.05.2024'
    }
  ]
};
