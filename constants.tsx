
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
    { date: '2023-Кв1', value: 500 },
    { date: '2023-Кв2', value: 480 },
    { date: '2023-Кв3', value: 450 },
    { date: '2023-Кв4', value: 410 },
  ],
  environmentalRiskScore: 15, 
  conservationProjects: 8,

  laborProductivity: 88,
  localProcurement: [
    { category: 'Товары', value: 82 },
    { category: 'Работы', value: 95 },
    { category: 'Услуги', value: 88 },
  ],

  companyRatings: [
    { name: 'Рейтинг ЭКГ', rank: 12, total: 250, change: 2, icon: 'assessment' },
    { name: 'Рейтинг СОКБ', rank: 5, total: 100, change: 1, icon: 'star' },
    { name: 'Рейтинг работодателей', rank: 8, total: 500, change: -3, icon: 'badge' },
  ],

  sokbDetails: {
    development: {
      title: 'Экономика и Развитие',
      criteria: [
        { name: 'Производительность', value: 88, color: '#0052CC' },
        { name: 'Выручка/Налоги', value: 95, color: '#36B37E' },
        { name: 'НИОКР/Инновации', value: 72, color: '#FFAB00' },
        { name: 'Импортозамещение', value: 65, color: '#00B8D9' },
        { name: 'Цифровая зрелость', value: 80, color: '#FF5630' },
      ]
    },
    employees: {
      title: 'Здоровье и Персонал',
      criteria: [
        { name: 'Охрана труда', value: 96, color: '#0052CC' },
        { name: 'Поддержка семей', value: 85, color: '#36B37E' },
        { name: 'Оплата и соцпакет', value: 92, color: '#FFAB00' },
        { name: 'Обучение/Развитие', value: 88, color: '#00B8D9' },
        { name: 'Индекс благополучия', value: 91, color: '#FF5630' },
      ]
    },
    society: {
      title: 'Общество и Человек',
      criteria: [
        { name: 'Потенциал человека', value: 78, color: '#0052CC' },
        { name: 'Инклюзия/Равенство', value: 82, color: '#36B37E' },
        { name: 'Волонтерство', value: 65, color: '#FFAB00' },
        { name: 'Благоустройство', value: 74, color: '#00B8D9' },
        { name: 'Трад. ценности', value: 88, color: '#FF5630' },
      ]
    },
    ecology: {
      title: 'Экология и Среда',
      criteria: [
        { name: 'Забор воды', value: 84, color: '#0052CC' },
        { name: 'Углеродный след', value: 75, color: '#36B37E' },
        { name: 'Утилизация отходов', value: 92, color: '#FFAB00' },
        { name: 'Зеленая энергия', value: 45, color: '#00B8D9' },
        { name: 'Эко-инвестиции', value: 88, color: '#FF5630' },
      ]
    },
    country: {
      title: 'Государство и Право',
      criteria: [
        { name: 'Комплаенс', value: 100, color: '#0052CC' },
        { name: 'Антикоррупция', value: 95, color: '#36B37E' },
        { name: 'Закупки у МСП', value: 88, color: '#FFAB00' },
        { name: 'Нацпроекты', value: 90, color: '#00B8D9' },
        { name: 'Прозрачность', value: 94, color: '#FF5630' },
      ]
    }
  },

  regions: [
    {
      id: '1',
      name: 'Московская область',
      coords: [55.7558, 37.6173],
      investment: 5.2,
      projects: 12,
      impactScore: 94,
      description: 'Ключевой логистический узел. Реализуются проекты по переработке отходов и поддержке образовательных кластеров.',
      lastUpdate: '20.05.2024'
    },
    {
      id: '2',
      name: 'Нижегородская область',
      coords: [56.3269, 44.0059],
      investment: 2.8,
      projects: 5,
      impactScore: 82,
      description: 'Промышленный центр. Основной фокус на цифровизации производства и кадровом резерве.',
      lastUpdate: '15.05.2024'
    },
    {
      id: '3',
      name: 'Красноярский край',
      coords: [56.0153, 92.8932],
      investment: 3.5,
      projects: 8,
      impactScore: 88,
      description: 'Экологические инициативы по сохранению лесов и реновации систем очистки воздуха.',
      lastUpdate: '18.05.2024'
    },
    {
      id: '4',
      name: 'Республика Татарстан',
      coords: [55.7887, 49.1221],
      investment: 4.1,
      projects: 10,
      impactScore: 91,
      description: 'Лидер по внедрению инноваций в промышленность и реализации ESG-проектов.',
      lastUpdate: '22.05.2024'
    }
  ]
};
