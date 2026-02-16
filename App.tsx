
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import RegionsMap from './components/RegionsMap';
import AIAssistantWidget from './components/AIAssistantWidget';
import { Section, SOKBData, SOKBTab, SOKBCriterion, RegionData } from './types';
import { INITIAL_DATA } from './constants';
import { getESGInsights } from './services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area, RadialBarChart, RadialBar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ComposedChart, LabelList,
  ReferenceLine
} from 'recharts';

interface Expert {
  id: number;
  name: string;
  role: string;
  exp: string;
  rating: number;
  tags: string[];
  status: 'online' | 'offline';
  category: 'ecology' | 'social' | 'governance' | 'legal' | 'sokb';
  avatarUrl?: string;
  isAcademyMember?: boolean;
  phone?: string;
  email?: string;
}

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sokbTab, setSokbTab] = useState<SOKBTab>('development');
  const [questionnaireTab, setQuestionnaireTab] = useState('health');
  
  // Questionnaire Mode State
  const [questionnaireMode, setQuestionnaireMode] = useState<'full' | 'basic'>('full');
  const [isModeConfirmOpen, setIsModeConfirmOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<'full' | 'basic' | null>(null);

  const [expertFilter, setExpertFilter] = useState('all');
  const [expertSearchQuery, setExpertSearchQuery] = useState('');
  const [procurementTab, setProcurementTab] = useState<'total' | 'msp'>('total'); 
  const [data] = useState<SOKBData>(INITIAL_DATA);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(INITIAL_DATA.regions[0]);
  const [insights, setInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [connectedExperts, setConnectedExperts] = useState<Record<string, number[]>>({});
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedExpertForConnection, setSelectedExpertForConnection] = useState<Expert | null>(null);
  const [selectedExpertForContact, setSelectedExpertForContact] = useState<Expert | null>(null);
  const [expertMenuOpen, setExpertMenuOpen] = useState<{ id: number; section: string } | null>(null);

  const [activeRadarColor, setActiveRadarColor] = useState<string | null>(null);

  // Инициализация базы подтверждающих документов для 85 показателей
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(() => {
    const initialFiles: Record<string, string[]> = {};
    
    // Helper to simulate organic filling progress (approx 70-80% filled)
    const shouldFill = () => Math.random() > 0.25;

    // Генерация документов для раздела Здоровье (h1-h30)
    for (let i = 1; i <= 30; i++) {
      const id = `h${i}`;
      if (!shouldFill()) continue;

      if (i === 1) initialFiles[id] = ["Справка о составе семьи (реестр).pdf", "Приказ о назначении пособий.docx"];
      else if (i === 3) initialFiles[id] = ["Отчет 6-НДФЛ_2023.pdf", "Расчетная ведомость_декабрь.xls"];
      else if (i === 6) initialFiles[id] = ["Смета затрат на СИЗ_2024.pdf", "Договор на мед. осмотры.pdf"];
      else if (i === 8) initialFiles[id] = ["Сертификат ISO 45001.pdf"];
      else if (i === 25) initialFiles[id] = ["Договор с учебным центром.pdf", "Акты выполненных работ (обучение).docx"];
      else initialFiles[id] = [`Выписка из приказа_${id}.pdf`, `Аналитическая справка_2023.docx`].slice(0, Math.floor(Math.random() * 2) + 1);
    }

    // Генерация документов для раздела Экология (e1-e26)
    for (let i = 1; i <= 26; i++) {
      const id = `e${i}`;
      if (!shouldFill()) continue;

      if (i === 1) initialFiles[id] = ["Журнал учета водопотребления.xls", "Договор с Водоканалом.pdf"];
      else if (i === 4) initialFiles[id] = ["Паспорта отходов I-IV классов.pdf", "Акты приема-передачи отходов.docx"];
      else if (i === 8) initialFiles[id] = ["Отчет об инвентаризации ПГ.pdf", "Расчет углеродного следа.xls"];
      else if (i === 16) initialFiles[id] = ["Политика в области УР.pdf", "Экологический кодекс компании.pdf"];
      else initialFiles[id] = [`Эко-отчетность_${id}.pdf`, `Протокол замеров.pdf`].slice(0, Math.floor(Math.random() * 2) + 1);
    }

    // Генерация документов для раздела Социум (s1-s9)
    for (let i = 1; i <= 9; i++) {
      const id = `s${i}`;
      if (!shouldFill()) continue;

      if (i === 1) initialFiles[id] = ["Благотворительный договор (Медицина).pdf", "Акт передачи оборудования.docx"];
      else if (i === 5) initialFiles[id] = ["Реестр волонтерских акций.xls", "Фотоотчет_день_донора.pdf"];
      else initialFiles[id] = [`Социальное соглашение_${id}.pdf`];
    }

    // Генерация документов для раздела Экономика (ec14-ec35)
    for (let i = 14; i <= 35; i++) {
      const id = `ec${i}`;
      if (!shouldFill()) continue;

      if (i === 17) initialFiles[id] = ["Анализ производительности_Q4.pdf"];
      else if (i === 22) initialFiles[id] = ["Реестр российских поставщиков.xls", "Сертификаты СТ-1.pdf"];
      else if (i === 35) initialFiles[id] = ["Свидетельство ЭКГ-рейтинга.pdf"];
      else initialFiles[id] = [`Бухгалтерская справка_${id}.pdf`, `Выписка из учетной политики.docx`].slice(0, Math.floor(Math.random() * 2) + 1);
    }

    return initialFiles;
  });
  
  const [expertsList, setExpertsList] = useState<Expert[]>([
    { id: 1, name: 'Александра Волкова', role: 'Эколог-аудитор', exp: '12 лет', rating: 4.9, tags: ['ISO 14001', 'GRI Standards', 'СОКБ'], status: 'online', category: 'ecology', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 900 123 45 67', email: 'volkova.a@инстат.рф' },
    { id: 2, name: 'Дмитрий Соколов', role: 'Специалист по КСО', exp: '8 лет', rating: 4.7, tags: ['Социальные инвестиции', 'HR-бренд'], status: 'offline', category: 'social', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 911 345 67 89', email: 'sokolov.d@инстат.рф' },
    { id: 3, name: 'Елена Морозова', role: 'Стратегический консультант', exp: '15 лет', rating: 5.0, tags: ['ESG-стратегия', 'Управление рисками', 'СОКБ'], status: 'online', category: 'governance', avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 920 987 65 43', email: 'morozova.e@инстат.рф' },
    { id: 4, name: 'Игорь Петров', role: 'Эксперт по энергоэффективности', exp: '10 лет', rating: 4.8, tags: ['Зеленая энергетика', 'Carbon Footprint'], status: 'offline', category: 'ecology', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 905 555 12 34', email: 'petrov.i@инстат.рф' },
    { id: 5, name: 'Мария Ковалева', role: 'Юрист (Корпоративное право)', exp: '9 лет', rating: 4.6, tags: ['Комплаенс', 'Антикоррупция'], status: 'online', category: 'legal', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 916 222 33 44', email: 'kovaleva.m@инстат.рф' },
    { id: 6, name: 'Сергей Васильев', role: 'Технолог производства', exp: '14 лет', rating: 4.8, tags: ['Цифровизация', 'Бережливое производство'], status: 'offline', category: 'governance', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 903 111 22 33', email: 'vasilyev.s@инстат.рф' },
    { id: 7, name: 'Анна Петрова', role: 'HR-Директор', exp: '11 лет', rating: 4.9, tags: ['Удержание талантов', 'D&I Политика', 'СОКБ'], status: 'online', category: 'social', avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 910 444 55 66', email: 'petrova.a@инстат.рф' },
    { id: 8, name: 'Константин Титов', role: 'Юрист по эко-праву', exp: '7 лет', rating: 4.5, tags: ['Природоохранное законодательство'], status: 'offline', category: 'legal', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 909 777 88 99', email: 'titov.k@инстат.рф' },
    { id: 9, name: 'Ольга Ильина', role: 'Менеджер по отходам', exp: '6 лет', rating: 4.7, tags: ['Циклическая экономика', 'Утилизация'], status: 'online', category: 'ecology', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 901 333 44 55', email: 'ilyina.o@инстат.рф' },
    { id: 10, name: 'Павел Смирнов', role: 'GR-менеджер', exp: '18 лет', rating: 5.0, tags: ['Связи с госорганами', 'Лоббирование'], status: 'online', category: 'governance', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 915 888 99 00', email: 'smirnov.p@инстат.рф' },
    { id: 11, name: 'Светлана Кирова', role: 'Координатор благотворительности', exp: '5 лет', rating: 4.8, tags: ['НКО', 'Гранты'], status: 'offline', category: 'social', avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 900 444 11 22', email: 'kirova.s@инстат.рф' },
    { id: 12, name: 'Роман Федоров', role: 'Риск-менеджер', exp: '13 лет', rating: 4.6, tags: ['Финансовые риски', 'Аудит'], status: 'online', category: 'governance', avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: false, phone: '+7 916 555 66 77', email: 'fedorov.r@инстат.рф' },
    { id: 13, name: 'Виктор Морозов', role: 'Методолог СОКБ', exp: '10 лет', rating: 4.9, tags: ['СОКБ Стандарт', 'Верификация'], status: 'online', category: 'sokb', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200', isAcademyMember: true, phone: '+7 999 888 77 66', email: 'morozov.v@инстат.рф' },
  ]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('esg-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('esg-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const fetchInsights = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await getESGInsights(data);
      setInsights(result);
    } catch (err) {
      console.error(err);
      setInsights('Произошла ошибка при получении данных СОКБ.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [data]);

  useEffect(() => {
    if (activeSection === 'ai-insights' && !insights) {
      fetchInsights();
    }
  }, [activeSection, insights, fetchInsights]);

  const openConnectModal = (expert: Expert) => {
    setSelectedExpertForConnection(expert);
    setIsConnectModalOpen(true);
  };

  const openContactModal = (expert: Expert) => {
    setSelectedExpertForContact(expert);
    setIsContactModalOpen(true);
  };

  const connectExpertToSection = (sectionId: string) => {
    if (!selectedExpertForConnection) return;
    
    setConnectedExperts(prev => {
      const existing = prev[sectionId] || [];
      if (!existing.includes(selectedExpertForConnection.id)) {
        return { ...prev, [sectionId]: [...existing, selectedExpertForConnection.id] };
      }
      return prev;
    });
    
    setIsConnectModalOpen(false);
    setSelectedExpertForConnection(null);
  };

  const disconnectExpert = (sectionId: string, expertId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setConnectedExperts(prev => {
      const existing = prev[sectionId] || [];
      return { ...prev, [sectionId]: existing.filter(id => id !== expertId) };
    });
    setExpertMenuOpen(null);
  };

  const handleModeChangeRequest = (mode: 'full' | 'basic') => {
    if (mode === questionnaireMode) return;
    setPendingMode(mode);
    setIsModeConfirmOpen(true);
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setQuestionnaireMode(pendingMode);
      setPendingMode(null);
    }
    setIsModeConfirmOpen(false);
  };

  const removeFile = (metricId: string, fileName: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [metricId]: (prev[metricId] || []).filter(f => f !== fileName)
    }));
  };

  const getAiEstimate = (metric: any) => {
    const seed = metric.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const rand = (seed * 9301 + 49297) % 233280;
    const normalized = rand / 233280;

    if (metric.type === 'boolean') {
      return normalized > 0.5 ? 'Да' : 'Нет';
    }

    let val = 0;
    const u = metric.unit ? metric.unit.toLowerCase() : '';
    
    if (u.includes('процент') || u.includes('%')) {
       val = Math.floor(normalized * 30) + 70; 
    } else if (u.includes('тысяч рублей') || u.includes('тыс. руб')) {
       val = Math.floor(normalized * 10000) + 500;
    } else if (u.includes('рублей')) {
       val = Math.floor(normalized * 50000) + 30000;
    } else if (u.includes('человек') || u.includes('работников') || u.includes('единиц')) {
       val = Math.floor(normalized * 100) + 5;
    } else if (u.includes('тонн')) {
       val = Math.floor(normalized * 500) + 50;
    } else if (u.includes('часов')) {
       val = Math.floor(normalized * 40) + 10;
    } else if (u.includes('гдж') || u.includes('куб')) {
       val = Math.floor(normalized * 5000) + 1000;
    } else {
       val = Math.floor(normalized * 100);
    }

    return val.toLocaleString('ru-RU');
  };

  const chartText = theme === 'dark' ? '#97A0AF' : '#6B778C';
  const chartGrid = theme === 'dark' ? '#2C333A' : '#EBECF0';
  const defaultRadarColor = theme === 'dark' ? '#8590A2' : '#97A0AF';

  const questionnaireTabs = [
    { 
      id: 'health', 
      label: 'Сохранение населения, укрепление здоровья и повышение благополучия людей, поддержка семьи', 
      icon: 'favorite' 
    },
    { 
      id: 'ecology', 
      label: 'Экологическое благополучие и создание комфортной и безопасной среды для жизни', 
      icon: 'nature' 
    },
    { 
      id: 'social', 
      label: 'Реализация потенциала каждого человека, развитие его талантов, воспитание патриотичной и социально ответственной личности', 
      icon: 'groups' 
    },
    { 
      id: 'economy', 
      label: 'Устойчивая и динамичная экономика, технологическое лидерство и цифровая трансформация', 
      icon: 'trending_up' 
    },
  ];

  const sokbTabs: { id: SOKBTab; label: string; icon: string }[] = [
    { id: 'development', label: 'Развитие', icon: 'trending_up' },
    { id: 'employees', label: 'Сотрудники', icon: 'people' },
    { id: 'society', label: 'Общество', icon: 'public' },
    { id: 'ecology', label: 'Экология', icon: 'eco' },
    { id: 'country', label: 'Государство', icon: 'flag' },
  ];

  const currentSokbData = useMemo(() => data.sokbDetails[sokbTab], [sokbTab, data]);

  const radarData = useMemo(() => {
    return currentSokbData.criteria.map(c => ({
      subject: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      A: c.value,
      fullMark: 100,
      color: c.color 
    }));
  }, [currentSokbData]);

  const renderCustomizedRadarDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={payload.color} 
        stroke={theme === 'dark' ? '#1D2125' : '#FFFFFF'} 
        strokeWidth={1}
        className="transition-all duration-300 hover:scale-125"
      />
    );
  };

  const productivityData = [
    { name: 'Q1', plan: 70, fact: 65, eff: 75 },
    { name: 'Q2', plan: 75, fact: 72, eff: 80 },
    { name: 'Q3', plan: 80, fact: 82, eff: 88 },
    { name: 'Q4', plan: 85, fact: 88, eff: 92 },
  ];

  const renderConnectedExpertsBar = (sectionId: string) => {
    const expertIds = connectedExperts[sectionId] || [];
    const experts = expertsList.filter(e => expertIds.includes(e.id));
    const isMenuOpenInThisSection = expertMenuOpen?.section === sectionId;
    
    return (
      <div className={`mb-6 relative ${isMenuOpenInThisSection ? 'z-50' : 'z-30'}`}>
        {expertMenuOpen && (
          <div 
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setExpertMenuOpen(null)}
          ></div>
        )}

        <div className="p-4 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder bg-white dark:bg-atlassian-darkSurface shadow-atl-card flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 relative">
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${experts.length > 0 ? 'bg-atlassian-brand/10 text-atlassian-brand' : 'bg-atlassian-bg dark:bg-white/5 text-atlassian-subtext'}`}>
                 <span className="material-symbols-rounded text-[20px]">{experts.length > 0 ? 'group' : 'person_off'}</span>
              </div>
              <div>
                 <h4 className="text-xs font-bold uppercase tracking-wider text-atlassian-text dark:text-white">
                    {experts.length > 0 ? 'Подключенные эксперты' : 'Эксперты не подключены'}
                 </h4>
                 <p className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext mt-0.5">
                    {experts.length > 0 
                      ? `Доступ к аналитике предоставлен ${experts.length} специалистам` 
                      : 'Подключите специалиста для глубокого анализа показателей'}
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {experts.length > 0 && (
                 <div className="flex -space-x-2 mr-2">
                    {experts.map(expert => {
                       const isMenuOpen = expertMenuOpen?.id === expert.id && expertMenuOpen?.section === sectionId;
                       
                       return (
                       <div key={expert.id} className="relative group/tooltip">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpertMenuOpen(isMenuOpen ? null : { id: expert.id, section: sectionId });
                            }}
                            className={`relative rounded-full border-2 border-white dark:border-atlassian-darkSurface transition-transform hover:scale-105 hover:z-20 focus:outline-none ${isMenuOpen ? 'z-50 scale-105 ring-2 ring-atlassian-brand ring-offset-2 dark:ring-offset-atlassian-darkSurface' : 'z-10'}`}
                          >
                            {expert.avatarUrl ? (
                               <img src={expert.avatarUrl} alt={expert.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold">
                                  {expert.name.charAt(0)}
                               </div>
                            )}
                          </button>

                          {!isMenuOpen && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                               {expert.name}
                            </div>
                          )}

                          {isMenuOpen && (
                             <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-atlassian-darkSurface rounded-lg shadow-xl border border-atlassian-border dark:border-atlassian-darkBorder z-[60] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                <div className="p-3 bg-atlassian-bg/50 dark:bg-white/5 border-b border-atlassian-border dark:border-atlassian-darkBorder">
                                   <p className="text-xs font-bold text-atlassian-text dark:text-white truncate">{expert.name}</p>
                                   <p className="text-[10px] text-atlassian-subtext truncate">{expert.role}</p>
                                </div>
                                <div className="p-1">
                                   <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-atlassian-text dark:text-atlassian-darkText hover:bg-atlassian-bg dark:hover:bg-white/5 rounded-md transition-colors">
                                      <span className="material-symbols-rounded text-[16px] text-atlassian-subtext">person</span>
                                      Профиль
                                   </button>
                                </div>
                                <div className="h-px bg-atlassian-border dark:border-atlassian-darkBorder my-0.5"></div>
                                <div className="p-1">
                                   <button 
                                      onClick={(e) => disconnectExpert(sectionId, expert.id, e)}
                                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-atlassian-error hover:bg-atlassian-error/10 rounded-md transition-colors"
                                   >
                                      <span className="material-symbols-rounded text-[16px]">person_remove</span>
                                      Удалить
                                   </button>
                                </div>
                             </div>
                          )}
                       </div>
                    );})}
                 </div>
              )}
              <button 
                 onClick={() => setActiveSection('experts')}
                 className={`h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    experts.length > 0 
                    ? 'bg-atlassian-bg dark:bg-atlassian-darkBg text-atlassian-text hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder'
                    : 'bg-atlassian-brand/10 text-atlassian-brand dark:bg-atlassian-brand/20 dark:text-white hover:bg-atlassian-brand/20 dark:hover:bg-atlassian-brand/30'
                 }`}
              >
                 <span className="material-symbols-rounded text-[16px]">person_add</span>
                 {experts.length > 0 ? 'Добавить' : 'Подключить эксперта'}
              </button>
           </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const procurementChartData = [
      { name: 'Товары', total: 82, msp: 35, fill: '#0052CC' },
      { name: 'Работы', total: 95, msp: 48, fill: '#36B37E' },
      { name: 'Услуги', total: 88, msp: 42, fill: '#FFAB00' },
    ];

    const currentProcurementAvg = procurementTab === 'total' ? 88.3 : 41.6;

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 atl-card p-6 flex flex-col min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-6">
            <div>
              <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Матрица устойчивости</h3>
              <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">Радарный анализ векторов социальной ответственности</p>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-atlassian-bg dark:bg-atlassian-darkBg p-1 rounded-lg">
              {sokbTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSokbTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                    sokbTab === tab.id 
                    ? 'bg-white text-atlassian-text shadow-sm dark:bg-atlassian-darkSurface dark:text-white' 
                    : 'text-atlassian-subtext dark:text-atlassian-darkSubtext hover:text-atlassian-text dark:hover:text-white'
                  }`}
                >
                  <span className={`material-symbols-rounded text-[16px] ${sokbTab === tab.id ? 'text-atlassian-brand' : ''}`}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="80%" 
                  data={radarData}
                  onMouseMove={(state: any) => {
                    if (state.isTooltipActive && state.activePayload && state.activePayload.length) {
                       const hoveredItem = state.activePayload[0].payload;
                       if (hoveredItem && hoveredItem.color) {
                          setActiveRadarColor(hoveredItem.color);
                       }
                    } else {
                       setActiveRadarColor(null);
                    }
                  }}
                  onMouseLeave={() => setActiveRadarColor(null)}
                >
                  <PolarGrid stroke={chartGrid} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: chartText, fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={currentSokbData.title}
                    dataKey="A"
                    stroke={activeRadarColor || defaultRadarColor}
                    strokeWidth={3}
                    fill={activeRadarColor || defaultRadarColor}
                    fillOpacity={0.3}
                    dot={renderCustomizedRadarDot}
                    isAnimationActive={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      backgroundColor: theme === 'dark' ? '#1D2125' : '#FFFFFF',
                      color: theme === 'dark' ? '#FFFFFF' : '#242424'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 pr-4">
              <h4 className="text-xs font-bold text-atlassian-text dark:text-atlassian-darkText uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-atlassian-brand rounded-full"></span>
                Детализация: {currentSokbData.title}
              </h4>
              <ul className="space-y-4">
                {currentSokbData.criteria.map((criterion, idx) => (
                  <li key={idx} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-atlassian-text dark:text-atlassian-darkText leading-tight">
                        {criterion.name}
                      </span>
                      <span className="text-xs font-bold text-atlassian-subtext">{criterion.value}%</span>
                    </div>
                    <div className="w-full bg-atlassian-bg dark:bg-atlassian-darkBg h-1.5 rounded-full overflow-hidden relative">
                       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)', backgroundSize: '4px 4px' }}></div>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative z-10" 
                        style={{ width: `${criterion.value}%`, backgroundColor: criterion.color }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Company Rating Card (UPDATED) */}
        <div className="atl-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider mb-2">РЕЙТИНГОВЫЕ ДАННЫЕ КОМПАНИИ</h3>
          
          {/* Block 1: SOKB Standard - MATCHING IMAGE */}
          <div className="bg-[#F6FBF7] dark:bg-[#1C2B23] border border-[#E3F2E6] dark:border-[#2C3B33] rounded-xl p-6 relative">
            <span className="absolute top-6 right-6 text-[10px] font-bold text-[#242424] dark:text-[#E2E8F0] uppercase tracking-wider">СТАНДАРТ СОКБ</span>
            
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2 mt-2 mb-6">
                 <span className="text-7xl font-medium text-[#242424] dark:text-white leading-none tracking-tighter">67</span>
                 <span className="text-sm font-medium text-[#242424] dark:text-[#E2E8F0]">баллов</span>
              </div>
              
              <div className="space-y-3 mb-6">
                 <div className="flex items-center">
                    <span className="text-xs font-medium text-[#6B778C] dark:text-[#94A3B8]">Анкета заполнена на</span>
                    <span className="ml-2 px-2 py-0.5 bg-[#DCFCE7] dark:bg-[#065F46] text-[#166534] dark:text-[#4ADE80] text-[10px] font-bold rounded uppercase tracking-wide">56%</span>
                 </div>
                 <div className="w-full bg-[#E3F2E6] dark:bg-[#2C3B33] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '56%' }}></div>
                 </div>
              </div>

              <div className="bg-[#DCFCE7] dark:bg-[#065F46]/30 rounded-lg p-4 flex gap-4 items-start">
                 <div className="relative w-5 h-5 shrink-0 mt-0.5">
                    <span className="material-symbols-rounded text-[#15803d] dark:text-[#4ADE80] text-[20px] absolute -top-0.5 -left-0.5">schedule</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-[#15803d] dark:text-[#4ADE80] uppercase tracking-wide mb-1">ОЖИДАЕТ ПРОВЕРКИ</p>
                    <p className="text-[10px] text-[#15803d]/80 dark:text-[#4ADE80]/80 leading-relaxed font-medium">До подтверждения со стороны оператора все данные являются ориентировочными</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Block 2: ECG Rating */}
          <div className="bg-[#F5F8FF] dark:bg-[#182333] rounded-xl p-5 relative border border-transparent dark:border-[#2C333A]">
             <span className="absolute top-4 right-4 text-[10px] font-bold text-[#182333] dark:text-[#60A5FA] uppercase tracking-wider">ЭКГ-РЕЙТИНГ</span>
             <div className="flex items-baseline gap-3 mt-2 mb-4">
                <span className="text-5xl font-medium text-[#182333] dark:text-[#DBEAFE] leading-none">BB</span>
                <span className="text-xs font-bold text-[#182333] dark:text-[#60A5FA] uppercase tracking-wide mr-2">оценка</span>
                <span className="text-3xl font-medium text-[#182333] dark:text-[#DBEAFE] leading-none">/ 63</span>
                <span className="text-xs font-bold text-[#182333] dark:text-[#60A5FA] uppercase tracking-wide">балла</span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded bg-[#DDEAFE] dark:bg-[#1E3A8A] text-[#1E40AF] dark:text-[#93C5FD] text-[9px] font-bold uppercase tracking-wide">
                   ЭКОЛОГИЯ - 19
                </span>
                <span className="px-2 py-0.5 rounded bg-[#DDEAFE] dark:bg-[#1E3A8A] text-[#1E40AF] dark:text-[#93C5FD] text-[9px] font-bold uppercase tracking-wide">
                   КАДРЫ - 14
                </span>
                <span className="px-2 py-0.5 rounded bg-[#DDEAFE] dark:bg-[#1E3A8A] text-[#1E40AF] dark:text-[#93C5FD] text-[9px] font-bold uppercase tracking-wide">
                   ГОСУДАРСТВО - 3
                </span>
             </div>
          </div>

          {/* Block 3: InStat Status */}
          <div className="bg-[#F7F7F7] dark:bg-white/5 rounded-xl p-5 relative border border-transparent dark:border-atlassian-darkBorder/50">
             <span className="absolute top-4 right-4 text-[10px] font-bold text-atlassian-text dark:text-white uppercase tracking-wider">ИНСТАТ - СТАТУС</span>
             
             <div className="flex gap-2 mb-4">
                <span className="px-2 py-0.5 bg-[#DCFCE7] dark:bg-[#14532D] text-[#166534] dark:text-[#BBF7D0] rounded text-[9px] font-bold uppercase tracking-wide">РАЗВИТИЕ+</span>
                <span className="px-2 py-0.5 bg-[#F3E8FF] dark:bg-[#581C87] text-[#6B21A8] dark:text-[#E9D5FF] rounded text-[9px] font-bold uppercase tracking-wide">ТОП-50</span>
             </div>

             <div className="w-full bg-[#E5E7EB] dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                 <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '35%' }}></div>
             </div>

             <div className="flex justify-between items-center">
                <p className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext font-medium opacity-80">Обновлено 24.02.2026</p>
                <span className="px-3 py-1 bg-[#E5E7EB] dark:bg-[#374151] text-[#374151] dark:text-[#D1D5DB] rounded text-[9px] font-bold uppercase tracking-wider">КРУПНАЯ КОМПАНИЯ</span>
             </div>
          </div>
        </div>
      </div>

      {/* Объединенный контейнер StatCards */}
      <div className="atl-card p-6">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-rounded text-atlassian-brand">monitoring</span>
              Ключевые показатели эффективности
           </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Нацприоритеты" 
              value={data.nationalGoalsProgress} 
              unit="%" 
              change={12} 
              icon="flag" 
              color="text-atlassian-brand" 
              theme={theme}
              trendData={[{value: 65}, {value: 68}, {value: 72}, {value: 70}, {value: 75}, {value: 78}]}
          />
          <StatCard 
              title="Индекс здоровья" 
              value={data.healthSafetyIndex} 
              unit="%" 
              change={4} 
              icon="health_and_safety" 
              color="text-atlassian-success" 
              theme={theme}
              trendData={[{value: 90}, {value: 92}, {value: 91}, {value: 94}, {value: 95}, {value: 96}]}
          />
          <StatCard 
              title="Инвест. в регионы" 
              value={data.regionalInvestment} 
              unit="млн" 
              change={18} 
              icon="domain" 
              color="text-atlassian-warning" 
              theme={theme}
              trendData={[{value: 8}, {value: 9}, {value: 11}, {value: 10.5}, {value: 12}, {value: 12.5}]}
          />
          <StatCard 
              title="Снижение выбросов" 
              value={18} 
              unit="%" 
              change={5} 
              icon="nature_people" 
              color="text-atlassian-success" 
              theme={theme}
              trendData={[{value: 10}, {value: 12}, {value: 14}, {value: 15}, {value: 16}, {value: 18}]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="atl-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-6">
            <div>
              <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Производительность труда</h3>
              <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">План/Факт и коэффициент эффективности</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-atlassian-brand/10 flex items-center justify-center text-atlassian-brand">
              <span className="material-symbols-rounded">trending_up</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productivityData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                   <XAxis dataKey="name" stroke={chartText} fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis yAxisId="left" stroke={chartText} fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis yAxisId="right" orientation="right" stroke="#16AB16" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', border: 'none', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        backgroundColor: theme === 'dark' ? '#1D2125' : '#FFFFFF',
                        color: theme === 'dark' ? '#FFFFFF' : '#242424'
                      }}
                   />
                   <Bar yAxisId="left" dataKey="plan" fill={chartGrid} barSize={20} radius={[4, 4, 0, 0]} name="План" />
                   <Bar yAxisId="left" dataKey="fact" fill="#0052CC" barSize={20} radius={[4, 4, 0, 0]} name="Факт" />
                   <Line yAxisId="right" type="monotone" dataKey="eff" stroke="#16AB16" strokeWidth={3} dot={{r: 4}} name="Эффективность" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-atlassian-bg dark:bg-white/5 rounded-lg border border-atlassian-border dark:border-atlassian-darkBorder">
                  <p className="text-[10px] text-atlassian-subtext uppercase font-bold tracking-wide">Выполнение плана</p>
                  <p className="text-xl font-bold text-atlassian-brand">+4.2%</p>
               </div>
               <div className="p-3 bg-atlassian-success/10 rounded-lg border border-atlassian-success/20">
                  <p className="text-[10px] text-atlassian-success uppercase font-bold tracking-wide">Прирост эффективности</p>
                  <p className="text-xl font-bold text-atlassian-success">+8.5%</p>
               </div>
            </div>
          </div>
        </div>

        <div className="atl-card p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-6">
            <div>
              <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Структура закупок</h3>
              <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">
                 {procurementTab === 'total' ? 'Доля общего объема закупок у российских поставщиков' : 'Объем закупок у малого и среднего предпринимательства'}
              </p>
            </div>
            
            <div className="flex bg-atlassian-bg dark:bg-atlassian-darkBg p-1 rounded-lg shrink-0">
               <button 
                  onClick={() => setProcurementTab('total')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                     procurementTab === 'total' 
                     ? 'bg-white text-atlassian-text shadow-sm dark:bg-atlassian-darkSurface dark:text-white' 
                     : 'text-atlassian-subtext hover:text-atlassian-text dark:hover:text-white'
                  }`}
               >
                  <span className="material-symbols-rounded text-[16px]">inventory_2</span>
                  Общий объем
               </button>
               <button 
                  onClick={() => setProcurementTab('msp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                     procurementTab === 'msp' 
                     ? 'bg-white text-atlassian-text shadow-sm dark:bg-atlassian-darkSurface dark:text-white' 
                     : 'text-atlassian-subtext hover:text-atlassian-text dark:hover:text-white'
                  }`}
               >
                  <span className="material-symbols-rounded text-[16px]">storefront</span>
                  МСП Закупки
               </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                  layout="vertical"
                  data={procurementChartData}
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  barGap={-24} 
               >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={chartGrid} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" stroke={chartText} fontSize={12} tickLine={false} axisLine={false} width={60} fontWeight={600} />
                  <Tooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ 
                        borderRadius: '8px', border: 'none', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        backgroundColor: theme === 'dark' ? '#1D2125' : '#FFFFFF',
                        color: theme === 'dark' ? '#FFFFFF' : '#242424'
                      }}
                  />
                  <Bar 
                     dataKey="total" 
                     barSize={24} 
                     radius={[0, 4, 4, 0]} 
                     fillOpacity={procurementTab === 'msp' ? 0.15 : 1}
                     name="Общий объем"
                  >
                    {
                      procurementChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                    {procurementTab === 'total' && (
                        <LabelList dataKey="total" position="right" fill={chartText} fontSize={11} fontWeight="bold" formatter={(val: any) => `${val}%`} />
                    )}
                  </Bar>
                  {procurementTab === 'msp' && (
                     <Bar 
                        dataKey="msp" 
                        barSize={24} 
                        radius={[0, 4, 4, 0]}
                        name="МСП"
                     >
                        {
                           procurementChartData.map((entry, index) => (
                              <Cell key={`cell-msp-${index}`} fill={entry.fill} />
                           ))
                        }
                        <LabelList dataKey="msp" position="right" fill={chartText} fontSize={11} fontWeight="bold" formatter={(val: any) => `${val}%`} />
                     </Bar>
                  )}
               </BarChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
             <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext">
                Средний показатель {procurementTab === 'total' ? 'локализации' : 'доли МСП'}: <span className="font-bold text-atlassian-text dark:text-white">{currentProcurementAvg}%</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  )};

  const renderQuestionnaire = () => {
     // (Question metrics preserved) ...
     const healthMetrics = [
       { id: 'h1', label: 'Среднее число детей в возрасте до 6 лет на одного сотрудника', type: 'number', unit: 'Количество человек' },
       { id: 'h2', label: 'Расходы организации на программы поддержки семьи и родительства', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h3', label: 'Фонд заработной платы, всего', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h4', label: 'Отношение средней заработной платы в организации к среднему уровню заработной платы в регионе', type: 'number', unit: 'Рублей' },
       { id: 'h5', label: 'Средняя заработная плата, всего, в том числе по группам занятий', type: 'table', unit: 'Рублей' },
       { id: 'h6', label: 'Расходы на мероприятия по охране труда и промышленную безопасность, всего, в том числе в среднем на одного работника', type: 'table', unit: 'Тысяч рублей' },
       { id: 'h7', label: 'Коэффициент частоты производственного травматизма персонала организации без учета персонала подрядчиков (LTIFR) на 1 млн чел.-час', type: 'number', unit: 'Единиц на 1 млн' },
       { id: 'h8', label: 'Наличие у организации сертификации системы менеджмента безопасности труда и охраны здоровья', type: 'boolean', unit: '' },
       { id: 'h9', label: 'Количество смертельных случаев работников организации без учета персонала подрядчиков', type: 'number', unit: 'Единиц' },
       { id: 'h10', label: 'Расходы на корпоративные программы негосударственного пенсионного обеспечения и (или) долгосрочных сбережений, всего и на одного работника', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h11', label: 'Расходы на организацию и проведение медицинских мероприятий для работников и членов их семей, всего, в том числе в среднем на одного работника', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h12', label: 'Расходы на организацию и проведение для социальных, в том числе спортивных мероприятий для работников и членов их семей, всего, в том числе в среднем на одного работника', type: 'table', unit: 'Тысяч рублей' },
       { id: 'h13', label: 'Доля работников with указанием распределения по каждой из следующих категорий: пол; возрастная группа', type: 'table', unit: 'Количество человек' },
       { id: 'h14', label: 'Доля работников, относящихся в соответствии с ФЗ «о ветеранах» к установленным категориям ветеранов', type: 'number', unit: 'Количество человек' },
       { id: 'h15', label: 'Расходы на реинтеграцию (профессиональную реабилитацию) работников, получивших статус инвалидов', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h16', label: 'Расходы организации на поддержку здоровья работников и представителей местного населения', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h17', label: 'Расходы на участие в поддержке социальных, в том числе благотворительных программ, не направленных на работников и членов их семей', type: 'table', unit: 'Тысяч рублей' },
       { id: 'h18', label: 'Доля работников, принимающих участие в проектах корпоративного добровольчества (волонтерства), и общее количество проектов корпоративного добровольчества (волонтерства)', type: 'number', unit: 'Количество человек' },
       { id: 'h19', label: 'Доля работников инвалидов', type: 'number', unit: 'Процент (%)' },
       { id: 'h20', label: 'Расходы организации на поддержку социально незащищенных групп населения', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h21', label: 'Расходы организации на улучшение жилищных условий работников / представителей местных сообществ', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h22', label: 'Среднесписочная численность работников', type: 'number', unit: 'Человек' },
       { id: 'h23', label: 'Доля работников, охваченных коллективным договором, в среднесписочной численности работников', type: 'number', unit: 'Процент (%)' },
       { id: 'h24', label: 'Количество зафиксированных социально-значимых инцидентов (забастовки)', type: 'number', unit: 'Единиц' },
       { id: 'h25', label: 'Расходы организации на обучение работников, на одного работника', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h26', label: 'Среднее количество часов обучения в год на одного работника', type: 'number', unit: 'Часов на человека' },
       { id: 'h27', label: 'Доля работников, замещающих должности с высоким коррупционным риском', type: 'number', unit: 'Процент (%)' },
       { id: 'h28', label: 'Среднее количество часов обучения по вопросам противодействия коррупции на одного работника', type: 'number', unit: 'Часов на человека' },
       { id: 'h29', label: 'Расходы организации на поддержку массового спорта', type: 'number', unit: 'Тысяч рублей' },
       { id: 'h30', label: 'Расходы на проекты по формированию традиционных духовно-нравственных ценностей', type: 'number', unit: 'Тысяч рублей' },
     ];

     const ecologyMetrics = [
        { id: 'e1', label: 'Объем использованной воды из всех источников водоснабжения', type: 'number', unit: 'Тысяч кубических' },
        { id: 'e2', label: 'Доля оборотного и повторно-последовательного водоснабжения в общем объеме собственного потребления воды из всех источников', type: 'number', unit: 'Процент (%)' },
        { id: 'e3', label: 'Объем сбросов сточных вод в водные объекты (загрязненных, нормативно чистых, нормативно очищенных) и переданных загрязненных стоков на очистку другим предприятиям', type: 'number', unit: 'Тысяч кубических' },
        { id: 'e4', label: 'Образовано отходов I–V классов опасности, всего, в том числе: I класса, II класса, III класса, IV класса, V класса', type: 'number', unit: 'Тонн' },
        { id: 'e5', label: 'Обращение с отходами всего, в том числе по категориям: утилизировано отходов, обезврежено отходов, захоронено отходов', type: 'table', unit: 'Тонн' },
        { id: 'e6', label: 'Доля использованных вторичных материальных ресурсов в общем объеме использования материальных ресурсов', type: 'number', unit: 'Проценты (%)' },
        { id: 'e7', label: 'Масса выбросов загрязняющих веществ в атмосферный воздух от стационарных источников', type: 'number', unit: 'Тонн' },
        { id: 'e8', label: 'Масса выбросов парниковых газов, в том числе: Охват 1, Охват 2', type: 'number', unit: 'Тонн CO2-эквивалента' },
        { id: 'e9', label: 'Инвестиции в основной капитал, направленные на охрану окружающей среды и рациональное использование природных ресурсов', type: 'table', unit: 'Тысяч рублей' },
        { id: 'e10', label: 'Число экологически-значимых инцидентов (в т.ч. в результате техногенных катастроф)', type: 'number', unit: 'Единиц' },
        { id: 'e11', label: 'Собственное энергопотребление, без учета отпуска тепла и электроэнергии внешним потребителям, всего', type: 'table', unit: 'Гигаджоулей, ГДж' },
        { id: 'e12', label: 'Доля активов, для которых проведена количественная и/или качественная оценка климатических рисков', type: 'number', unit: 'Процент (%)' },
        { id: 'e13', label: 'Общее количество климатически уязвимых объектов и их доля в общем количестве объектов основных средств', type: 'number', unit: 'Штук / %' },
        { id: 'e14', label: 'Эффективность мер по адаптации к изменениям климата / экономическая эффективность реализуемых мер', type: 'number', unit: 'Тыс. руб. и/или %' },
        { id: 'e15', label: 'Возможный ущерб от воздействия физических климатических рисков', type: 'number', unit: 'Тысяч рублей' },
        { id: 'e16', label: 'Наличие политики по устойчивому развитию и (или) иных стратегических документов в этой сфере', type: 'boolean', unit: 'Да / нет' },
        { id: 'e17', label: 'Наличие органа управления или комитета, ответственного за утверждение и контроль реализации политики по устойчивому развитию', type: 'boolean', unit: 'Да / нет' },
        { id: 'e18', label: 'Предусматривает ли политика вознаграждения организации учет целевых показателей, связанных with устойчивым развитием и климатом', type: 'boolean', unit: 'Да / нет' },
        { id: 'e19', label: 'Наличие политики по управлению рисками, в том числе климатическими, и (или) иных документов в этой сфере', type: 'table', unit: 'Да / нет' },
        { id: 'e20', label: 'Общий объем забираемой воды', type: 'number', unit: 'Тысяч куб. метров' },
        { id: 'e21', label: 'Углеродный след продукции', type: 'number', unit: 'Тонн CO2-экв.' },
        { id: 'e22', label: 'Расходы на мероприятия по охране окружающей среды всего', type: 'number', unit: 'Тысяч рублей' },
        { id: 'e23', label: 'Плата за негативное воздействие на окружающую среду', type: 'number', unit: 'Тысяч рублей' },
        { id: 'e24', label: 'Затраты на компенсации и штрафы за нарушения природоохранного законодательства', type: 'number', unit: 'Тысяч рублей' },
        { id: 'e25', label: 'Объем потребления возобновляемой и низкоуглеродной энергии', type: 'number', unit: 'ГДж' },
        { id: 'e26', label: 'Общий объем устойчивых («зеленых») инвестиций и их доля в общем объеме', type: 'number', unit: 'Тысяч рублей' },
     ];

     const socialMetrics = [
        { id: 's1', label: 'Расходы организации на развитие инфраструктуры здравоохранения', type: 'number', unit: 'Тысяч рублей' },
        { id: 's2', label: 'Расходы организации, направленные на поддержку образования', type: 'number', unit: 'Тысяч рублей' },
        { id: 's3', label: 'Расходы организации на развитие инфраструктуры в сфере культуры, искусства и народного творчества', type: 'number', unit: 'Тысяч рублей' },
        { id: 's4', label: 'Расходы организации на повышение благоустройства и комплексное развитие городов и других населенных пунктов', type: 'number', unit: 'Тысяч рублей' },
        { id: 's5', label: 'Расходы организации на добровольческую (волонтерскую) деятельность', type: 'number', unit: 'Тысяч рублей' },
        { id: 's6', label: 'Наличие политики, предусматривающей применение принципов инклюзии', type: 'boolean', unit: 'Да / нет' },
        { id: 's7', label: 'Наличие обязательств комплексно осуществлять деятельность в сфере инклюзии', type: 'boolean', unit: 'Да / нет' },
        { id: 's8', label: 'Количество случаев привлечения к ответственности за нарушение прав потребителей', type: 'number', unit: 'Единиц' },
        { id: 's9', label: 'Количество случаев нарушения прав коренных малочисленных народов РФ', type: 'number', unit: 'Единиц' },
     ];

     const economyMetrics = [
        { id: 'ec14', label: 'Наличие сертификации системы энергетического менеджмента', type: 'boolean', unit: 'Да/Нет' },
        { id: 'ec15', label: 'Расходы организации на повышение качества дорожной сети', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec16', label: 'Расходы на проекты по повышению туристической привлекательности РФ', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec17', label: 'Производительность труда', type: 'number', unit: 'Тыс. руб. / чел.' },
        { id: 'ec18', label: 'Выручка (показатель, аналогичный выручке)', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec19', label: 'Сумма уплаченных обязательных платежей (налоги, сборы, взносы)', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec20', label: 'Сумма начисленных обязательных платежей', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec21', label: 'Общие расходы на научные исследования и (или) ОКР', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec22', label: 'Доля закупок российских товаров, работ, услуг', type: 'number', unit: 'Процент (%)' },
        { id: 'ec23', label: 'Доля закупок у субъектов МСП в объеме закупок у рос. организаций', type: 'number', unit: 'Процент (%)' },
        { id: 'ec25', label: 'Объем инвестиций в проекты тех. суверенитета и структурной адаптации', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec26', label: 'Коэффициент текучести кадров', type: 'number', unit: 'Процент (%)' },
        { id: 'ec27', label: 'Штрафы в связи с нарушением трудового законодательства', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec28', label: 'Доля независимых директоров в составе коллегиального органа', type: 'number', unit: 'Человек' },
        { id: 'ec29', label: 'Доля женщин – руководителей в общей численности руководителей', type: 'number', unit: 'Человек' },
        { id: 'ec30', label: 'Штрафы за нарушение корп. законодательства или рынка ценных бумаг', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec31', label: 'Сумма заявленных требований по судебным спорам (ответчик)', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec32', label: 'Сумма удовлетворенных требований по судебным спорам (ответчик)', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec33', label: 'Расходы на ИТ-проекты по импортозамещению (в т.ч. стартапы)', type: 'table', unit: 'Тысяч рублей' },
        { id: 'ec34', label: 'Расходы на обеспечение цифровой безопасности', type: 'number', unit: 'Тысяч рублей' },
        { id: 'ec35', label: 'Значение экг-рейтинга', type: 'number', unit: 'Балл' },
     ];

     const calculateProgress = (metricsPrefix: string, total: number) => {
        let filled = 0;
        Object.keys(uploadedFiles).forEach(key => {
           if(key.startsWith(metricsPrefix) && uploadedFiles[key] && uploadedFiles[key].length > 0) filled++;
        });
        return Math.min(100, Math.round((filled / total) * 100));
     };

     const healthProgress = calculateProgress('h', healthMetrics.length);
     const ecologyProgress = calculateProgress('e', ecologyMetrics.length);
     const socialProgress = calculateProgress('s', socialMetrics.length);
     const economyProgress = calculateProgress('ec', economyMetrics.length);

     const totalProgress = Math.round((healthProgress + ecologyProgress + socialProgress + economyProgress) / 4);

     const questionnaireChartData = [
       { name: 'Здоровье', value: healthProgress, fill: '#0052CC' },
       { name: 'Экология', value: ecologyProgress, fill: '#36B37E' },
       { name: 'Социум', value: socialProgress, fill: '#FFAB00' },
       { name: 'Экономика', value: economyProgress, fill: '#FF5630' },
     ];

     const currentMetrics = 
        questionnaireTab === 'health' ? healthMetrics : 
        questionnaireTab === 'ecology' ? ecologyMetrics : 
        questionnaireTab === 'social' ? socialMetrics : 
        questionnaireTab === 'economy' ? economyMetrics : [];

     const visibleQuestions = questionnaireMode === 'basic' ? currentMetrics.slice(0, 5) : currentMetrics;

     const currentTab = questionnaireTabs.find(t => t.id === questionnaireTab); 

     return (
        <div className="animate-in fade-in duration-500 relative">
           {renderConnectedExpertsBar('questionnaire')}

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              <div className="xl:col-span-1 space-y-6 sticky top-4">
                 <div className="atl-card p-6 flex flex-col gap-6 shadow-md border-atlassian-brand/20">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-atlassian-text dark:text-white uppercase tracking-wider">Навигация</h3>
                        <p className="text-xs text-atlassian-subtext">Анкета СОКБ для крупного бизнеса</p>
                    </div>

                    <div className="flex bg-atlassian-bg dark:bg-atlassian-darkBg p-1 rounded-lg">
                        <button 
                           onClick={() => handleModeChangeRequest('full')}
                           className={`flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                              questionnaireMode === 'full' 
                              ? 'bg-white dark:bg-atlassian-darkSurface text-atlassian-text dark:text-white shadow-sm' 
                              : 'text-atlassian-subtext hover:text-atlassian-text'
                           }`}
                        >
                           Полный
                        </button>
                        <button 
                           onClick={() => handleModeChangeRequest('basic')}
                           className={`flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                              questionnaireMode === 'basic' 
                              ? 'bg-white dark:bg-atlassian-darkSurface text-atlassian-text dark:text-white shadow-sm' 
                              : 'text-atlassian-subtext hover:text-atlassian-text'
                           }`}
                        >
                           Базовый
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                       {questionnaireTabs.map((tab) => (
                          <button
                             key={tab.id}
                             onClick={() => setQuestionnaireTab(tab.id)}
                             title={tab.label}
                             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all text-left group ${
                                questionnaireTab === tab.id 
                                ? 'bg-atlassian-text text-white shadow-md dark:bg-atlassian-darkBorder' 
                                : 'text-atlassian-subtext hover:bg-atlassian-bg dark:hover:bg-white/5 hover:text-atlassian-text dark:hover:text-white'
                             }`}
                          >
                             <span className={`material-symbols-rounded text-[18px] shrink-0 ${questionnaireTab === tab.id ? 'text-white' : 'text-atlassian-subtext group-hover:text-atlassian-text dark:group-hover:text-white'}`}>{tab.icon}</span>
                             <span className="truncate flex-1">{tab.label}</span>
                             {questionnaireTab === tab.id && <span className="material-symbols-rounded text-[14px]">chevron_right</span>}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="atl-card p-6">
                    <h3 className="text-xs font-bold text-atlassian-text dark:text-white uppercase tracking-wider mb-6">Прогресс заполнения</h3>
                    <div className="h-[200px] relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart 
                             cx="50%" 
                             cy="50%" 
                             innerRadius="10%" 
                             outerRadius="100%" 
                             barSize={10} 
                             data={questionnaireChartData}
                          >
                             <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={10}
                                label={{ position: 'insideStart', fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                             />
                             <Legend 
                                iconSize={10} 
                                layout="vertical" 
                                verticalAlign="middle" 
                                wrapperStyle={{ right: 0, top: '50%', transform: 'translate(0, -50%)', fontSize: '10px', fontWeight: 'bold' }} 
                             />
                          </RadialBarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                       <p className="text-2xl font-bold text-atlassian-text dark:text-white">{totalProgress}%</p>
                       <p className="text-[10px] text-atlassian-subtext uppercase">Общий прогресс</p>
                    </div>
                 </div>

                 <div className="atl-card p-6 bg-gradient-to-br from-atlassian-brand to-atlassian-info text-white border-none">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <span className="material-symbols-rounded">verified_user</span>
                       </div>
                       <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider">Сертификакация</h4>
                          <p className="text-[10px] opacity-80">Статус валидации</p>
                       </div>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed mb-6">
                       Для получения сертификата СОКБ необходимо заполнить все разделы анкеты и пройти верификацию экспертом.
                    </p>
                    <button className="w-full h-9 px-4 bg-white text-atlassian-brand text-xs font-bold rounded-lg uppercase tracking-wide hover:bg-white/90 transition-colors">
                       Запросить валидацию
                    </button>
                 </div>
              </div>

              <div className="xl:col-span-2 space-y-6">
                 <div className="p-6 bg-white dark:bg-atlassian-darkSurface rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                    <h2 className="text-xl font-bold text-atlassian-text dark:text-white leading-snug">
                        {currentTab?.label}
                    </h2>
                 </div>

                 <div className="space-y-4">
                    {visibleQuestions.length > 0 ? (
                      visibleQuestions.map((metric: any) => (
                        <div key={metric.id} className="p-6 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder bg-white dark:bg-atlassian-darkSurface shadow-sm hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
                          <div className="flex justify-between items-start mb-4">
                            <label className="text-sm font-medium text-atlassian-text dark:text-white leading-relaxed block max-w-[80%]">
                               {metric.label}
                            </label>
                            
                            <button 
                               className="flex items-center gap-2 px-2 py-1 rounded bg-transparent text-atlassian-subtext hover:text-atlassian-brand transition-all opacity-0 group-hover:opacity-100"
                               title="Показать описание и методику расчета"
                            >
                                <span className="material-symbols-rounded text-[16px]">info</span>
                                <span className="text-[10px] font-bold uppercase tracking-tight">О показателе</span>
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {metric.type === 'number' && (
                                   <div className="flex items-center gap-3">
                                       <div className="relative w-40 flex items-center">
                                          <button className="absolute left-1 top-1 bottom-1 w-8 h-8 rounded-lg hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder flex items-center justify-center text-atlassian-subtext transition-colors z-10">
                                            <span className="material-symbols-rounded text-[18px]">remove</span>
                                          </button>
                                          <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full h-10 pl-10 pr-10 text-center rounded-lg border border-atlassian-border dark:border-atlassian-darkBorder bg-atlassian-bg/50 dark:bg-atlassian-darkBg/50 focus:ring-2 focus:ring-atlassian-brand focus:border-transparent outline-none transition-all text-sm font-bold text-atlassian-text dark:text-white"
                                          />
                                          <button className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-lg hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder flex items-center justify-center text-atlassian-subtext transition-colors z-10">
                                            <span className="material-symbols-rounded text-[18px]">add</span>
                                          </button>
                                       </div>
                                       {metric.unit && (
                                           <span className="text-xs text-atlassian-subtext font-medium">{metric.unit}</span>
                                       )}
                                   </div>
                                )}

                                {metric.type === 'boolean' && (
                                   <div className="flex bg-atlassian-bg dark:bg-atlassian-darkBg p-1 rounded-lg">
                                      <button className="px-6 py-2 rounded-md text-xs font-bold text-atlassian-subtext hover:text-atlassian-text hover:bg-white dark:hover:bg-atlassian-darkSurface transition-all">Да</button>
                                      <button className="px-6 py-2 rounded-md text-xs font-bold text-atlassian-subtext hover:text-atlassian-text hover:bg-white dark:hover:bg-atlassian-darkSurface transition-all">Нет</button>
                                   </div>
                                )}

                                {metric.type === 'table' && (
                                   <div className="flex flex-wrap items-center gap-3">
                                      <div className="relative w-40 flex items-center">
                                          <button className="absolute left-1 top-1 bottom-1 w-8 h-8 rounded-lg hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder flex items-center justify-center text-atlassian-subtext transition-colors z-10">
                                            <span className="material-symbols-rounded text-[18px]">remove</span>
                                          </button>
                                          <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full h-10 pl-10 pr-10 text-center rounded-lg border border-atlassian-border dark:border-atlassian-darkBorder bg-atlassian-bg/50 dark:bg-atlassian-darkBg/50 focus:ring-2 focus:ring-atlassian-brand focus:border-transparent outline-none transition-all text-sm font-bold text-atlassian-text dark:text-white"
                                          />
                                          <button className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-lg hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder flex items-center justify-center text-atlassian-subtext transition-colors z-10">
                                            <span className="material-symbols-rounded text-[18px]">add</span>
                                          </button>
                                       </div>
                                       {metric.unit && (
                                           <span className="text-xs text-atlassian-subtext font-medium">{metric.unit}</span>
                                       )}
                                      <button className="flex items-center gap-2 h-10 px-4 bg-atlassian-brand/10 text-atlassian-brand text-xs font-bold rounded-lg hover:bg-atlassian-brand/20 transition-colors whitespace-nowrap ml-2">
                                         <span className="material-symbols-rounded text-[16px]">grid_on</span>
                                         Детализация
                                      </button>
                                   </div>
                                )}
                            </div>

                            {/* AI Estimate Badge - Скрывается для boolean типов */}
                            {uploadedFiles[metric.id] && uploadedFiles[metric.id].length > 0 && metric.type !== 'boolean' && (
                                <div className="mt-3 flex justify-start animate-in fade-in slide-in-from-top-1 duration-500">
                                    <div className="inline-flex items-center px-4 py-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50">
                                        <span className="material-symbols-rounded text-teal-700 dark:text-teal-300 mr-2 text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>show_chart</span>
                                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide mr-3">
                                            Расчёт AI Инстат
                                        </span>
                                        <div className="flex items-baseline gap-1.5 mr-4">
                                            <span className="text-sm font-bold text-atlassian-text dark:text-white">
                                                {getAiEstimate(metric)}
                                            </span>
                                            {metric.unit && (
                                                <span className="text-[10px] font-medium text-atlassian-text/60 dark:text-white/60">
                                                    {metric.unit}
                                                </span>
                                            )}
                                        </div>
                                        <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-black uppercase rounded shadow-sm transition-colors tracking-widest active:scale-95">
                                            Применить
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex flex-col gap-3 border-t border-atlassian-border/50 dark:border-atlassian-darkBorder/50 pt-4">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-3">
                                          <button className="flex items-center gap-2 h-9 px-4 bg-atlassian-brand/5 text-atlassian-brand dark:bg-atlassian-brand/10 dark:text-white text-xs font-bold rounded-lg hover:bg-atlassian-brand/10 dark:hover:bg-atlassian-brand/20 transition-colors">
                                              <span className="material-symbols-rounded text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>upload</span>
                                              Загрузить подтв. документы
                                          </button>
                                          <span className="text-[10px] text-atlassian-subtext select-none italic hidden sm:block">Перетащите файлы сюда</span>
                                     </div>
                                  </div>
                               </div>

                               {/* Группировка заголовка и файлов в контейнер с пунктирной рамкой */}
                               {uploadedFiles[metric.id] && uploadedFiles[metric.id].length > 0 && (
                                 <div className="mt-4 p-4 border border-dashed border-[#CBD1DB] rounded-[6px] bg-white/50 dark:bg-white/5">
                                   <div className="flex items-center gap-2 mb-3">
                                      <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">Загруженные файлы ({uploadedFiles[metric.id].length})</p>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                      {uploadedFiles[metric.id].map((file, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] dark:bg-atlassian-darkBg/50 border border-[#EDEBE9] dark:border-atlassian-darkBorder rounded-lg shadow-sm group/file animate-in fade-in zoom-in-95 duration-200">
                                           <span className="material-symbols-rounded text-atlassian-subtext text-[16px]">{file.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}</span>
                                           <span className="text-[11px] font-medium text-atlassian-text dark:text-atlassian-darkText truncate max-w-[200px]">{file}</span>
                                           <button 
                                              onClick={() => removeFile(metric.id, file)}
                                              className="ml-1 text-atlassian-subtext hover:text-atlassian-error opacity-0 group-hover/file:opacity-100 transition-all"
                                           >
                                              <span className="material-symbols-rounded text-[14px]">cancel</span>
                                           </button>
                                        </div>
                                      ))}
                                   </div>
                                 </div>
                               )}
                            </div>

                          </div>
                        </div>
                      ))
                    ) : (
                       <div className="atl-card p-20 flex flex-col items-center justify-center text-atlassian-subtext border-dashed border-2">
                          <span className="material-symbols-rounded text-6xl mb-4 opacity-20">construction</span>
                          <p className="font-bold uppercase tracking-widest opacity-40">Данный раздел будет доступен в ближайшее время</p>
                       </div>
                    )}
                    
                    {questionnaireMode === 'basic' && currentMetrics.length > 5 && (
                       <div className="p-4 rounded-lg border border-dashed border-atlassian-border dark:border-atlassian-darkBorder text-center text-atlassian-subtext text-xs italic">
                          * Часть вопросов скрыта в режиме "Базовый перечень"
                       </div>
                    )}
                 </div>
                 
                 <div className="p-4 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder bg-white dark:bg-atlassian-darkSurface flex justify-end shadow-sm">
                    <button className="h-10 px-6 bg-atlassian-brand text-white text-xs font-bold rounded-lg uppercase tracking-wide hover:bg-atlassian-brandHover transition-colors shadow-lg shadow-atlassian-brand/20">
                       Сохранить ответы
                    </button>
                 </div>
              </div>

           </div>

           {isModeConfirmOpen && (
              <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                 <div className="bg-white dark:bg-atlassian-darkSurface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-atlassian-border dark:border-atlassian-darkBorder">
                    <div className="p-6 text-center">
                       <div className="w-12 h-12 bg-atlassian-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 text-atlassian-warning">
                          <span className="material-symbols-rounded text-2xl">warning</span>
                       </div>
                       <h3 className="text-lg font-bold text-atlassian-text dark:text-white mb-2">Вы уверены?</h3>
                       <p className="text-sm text-atlassian-subtext dark:text-atlassian-darkSubtext mb-6">
                          При переключении типа перечня загруженные файлы сохранятся.
                       </p>
                       <div className="flex gap-3">
                          <button 
                             onClick={() => setIsModeConfirmOpen(false)}
                             className="flex-1 h-10 rounded-lg bg-atlassian-bg dark:bg-atlassian-darkBg text-atlassian-text dark:text-white text-xs font-bold hover:bg-atlassian-border dark:hover:bg-atlassian-darkBorder transition-all uppercase tracking-wide"
                          >
                             Отмена
                          </button>
                          <button 
                             onClick={confirmModeChange}
                             className="flex-1 h-10 rounded-lg bg-atlassian-brand text-white text-xs font-bold hover:bg-atlassian-brandHover transition-all uppercase tracking-wide"
                          >
                             Переключить
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
     );
  };

  const renderEnvironmentSection = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {renderConnectedExpertsBar('environment')}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 atl-card p-6 flex flex-col min-h-[750px]">
            <div className="flex items-center justify-between mb-6 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-4">
              <div>
                <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Экологический след</h3>
                <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">Динамика снижения выбросов CO2 и ключевые показатели эффективности</p>
              </div>
              <span className="material-symbols-rounded text-atlassian-success text-[28px]">eco</span>
            </div>
            
            {/* График теперь занимает больше места */}
            <div className="flex-1 min-h-[350px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.emissionReduction}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36B37E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#36B37E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                  <XAxis dataKey="date" stroke={chartText} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartText} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', border: 'none', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      backgroundColor: theme === 'dark' ? '#1D2125' : '#FFFFFF',
                      color: theme === 'dark' ? '#FFFFFF' : '#242424'
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#36B37E" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Дополнительные экологические метрики - 2 ряда по 5 пунктов */}
            <div className="space-y-10 pt-8 border-t border-atlassian-border dark:border-atlassian-darkBorder">
               {/* Ряд 1: Ресурсы, Выбросы, Энергия, Климат, Объекты */}
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-info text-[16px]">recycling</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Доля ВМР</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">18.4</p>
                        <span className="text-[10px] text-atlassian-subtext font-bold">%</span>
                     </div>
                     <div className="w-full bg-atlassian-bg dark:bg-atlassian-darkBg h-1.5 rounded-full overflow-hidden">
                        <div className="bg-atlassian-info h-full transition-all duration-1000" style={{ width: '18.4%' }}></div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-error text-[16px]">factory</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Масса выбросов</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">1,240.8</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">тонн</span>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">стационарные источники</p>
                  </div>

                  <div className="space-y-2 group/energy cursor-help relative">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-warning text-[16px]">bolt</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Энергопотребление</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">45,600</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">ГДж</span>
                     </div>
                     <div className="absolute top-full left-0 opacity-0 group-hover/energy:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-black/90 text-white text-[9px] p-3 rounded-lg z-20 pointer-events-none w-max shadow-2xl border border-white/10 backdrop-blur-sm">
                        <p className="font-bold mb-1 border-b border-white/20 pb-1">Детализация (ГДж):</p>
                        <p className="flex justify-between gap-4"><span>Тепловая энергия:</span> <span>12,400</span></p>
                        <p className="flex justify-between gap-4"><span>Электроэнергия:</span> <span>18,200</span></p>
                        <p className="flex justify-between gap-4"><span>Ископаемое топливо:</span> <span>15,000</span></p>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">без внешних поставок</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-error text-[16px]">tsunami</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Клим. ущерб</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">8,500</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">тыс. руб.</span>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">физические риски</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-warning text-[16px]">domain_disabled</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Уязвимые объекты</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">12</p>
                        <span className="text-[10px] text-atlassian-subtext font-bold uppercase tracking-tighter">ед. (4.2%)</span>
                     </div>
                     <div className="w-full bg-atlassian-bg dark:bg-atlassian-darkBg h-1 rounded-full overflow-hidden">
                        <div className="bg-atlassian-warning h-full" style={{ width: '4.2%' }}></div>
                     </div>
                  </div>
               </div>

               {/* Ряд 2: Инвестиции, Инциденты, Вода, Отходы, Контроль ВМР */}
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div className="space-y-2 group/invest cursor-help relative">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-success text-[16px]">payments</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Инвестиции (ООС)</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">125,000</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">тыс. руб.</span>
                     </div>
                     <div className="absolute bottom-full left-0 opacity-0 group-hover/invest:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 bg-black/90 text-white text-[9px] p-3 rounded-lg z-20 pointer-events-none w-max shadow-2xl border border-white/10 backdrop-blur-sm mb-2">
                        <p className="font-bold mb-1 border-b border-white/20 pb-1">Категории:</p>
                        <p className="flex justify-between gap-4"><span>Охрана воздуха:</span> <span>56,250</span></p>
                        <p className="flex justify-between gap-4"><span>Рац. водопользование:</span> <span>37,500</span></p>
                        <p className="flex justify-between gap-4"><span>Земля и биоресурсы:</span> <span>31,250</span></p>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">в основной капитал</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-error text-[16px]">report_problem</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Эко-инциденты</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">0</p>
                        <span className="text-[10px] text-atlassian-subtext font-bold uppercase tracking-widest">единиц</span>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">в т.ч. техногенные</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-info text-[16px]">water_drop</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Объем воды</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">840.5</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">тыс. м³</span>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">из всех источников</p>
                  </div>

                  <div className="space-y-2 group/waste cursor-help relative">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-warning text-[16px]">delete_sweep</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Отходы I–V</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">250.4</p>
                        <span className="text-[9px] text-atlassian-subtext font-bold uppercase tracking-tight">тонн</span>
                     </div>
                     <div className="absolute bottom-full left-0 opacity-0 group-hover/waste:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 bg-black/90 text-white text-[9px] p-3 rounded-lg z-20 pointer-events-none w-max shadow-2xl border border-white/10 backdrop-blur-sm mb-2">
                        <p className="font-bold mb-1 border-b border-white/20 pb-1">Классы опасности (т):</p>
                        <p className="flex justify-between gap-4"><span>I класс (чрезв. опасные):</span> <span>2.1</span></p>
                        <p className="flex justify-between gap-4"><span>II класс (высокоопасные):</span> <span>7.9</span></p>
                        <p className="flex justify-between gap-4"><span>III класс (умеренно опас.):</span> <span>40.4</span></p>
                        <p className="flex justify-between gap-4"><span>IV класс (малоопасные):</span> <span>120.0</span></p>
                        <p className="flex justify-between gap-4"><span>V класс (неопасные):</span> <span>80.0</span></p>
                     </div>
                     <p className="text-[9px] text-atlassian-subtext leading-none italic">всего образовано</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-rounded text-atlassian-success text-[16px]">rebase_edit</span>
                        <p className="text-[9px] font-bold text-atlassian-subtext uppercase truncate">Контроль ВМР</p>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <p className="text-base font-bold text-atlassian-text dark:text-white leading-none">18.4</p>
                        <span className="text-[10px] text-atlassian-subtext font-bold uppercase tracking-tighter">% доли</span>
                     </div>
                     <div className="w-full bg-atlassian-bg dark:bg-atlassian-darkBg h-1 rounded-full overflow-hidden">
                        <div className="bg-atlassian-success h-full" style={{ width: '18.4%' }}></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="atl-card p-6 flex flex-col gap-6">
            <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider mb-2">Риски и проекты</h3>
            <StatCard 
              title="Эко-риски" 
              value={data.environmentalRiskScore} 
              unit="/100" 
              change={-5} 
              icon="warning" 
              color="text-atlassian-warning"
              theme={theme}
              trendData={[{value: 20}, {value: 18}, {value: 16}, {value: 15}, {value: 15}, {value: 14}]} 
            />
            <StatCard 
              title="Проекты" 
              value={data.conservationProjects} 
              unit="ед." 
              change={2} 
              icon="forest" 
              color="text-atlassian-success"
              theme={theme}
              trendData={[{value: 5}, {value: 6}, {value: 6}, {value: 7}, {value: 7}, {value: 8}]} 
            />
            
            <div className="p-6 bg-gradient-to-br from-atlassian-success/20 to-atlassian-info/20 border-none rounded-xl mt-auto">
              <h4 className="text-[10px] font-bold text-atlassian-success uppercase tracking-widest mb-4">Цель 2030</h4>
              <p className="text-sm font-medium text-atlassian-text dark:text-atlassian-darkText leading-relaxed mb-4">
                Достижение углеродной нейтральности производственного цикла.
              </p>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <div className="bg-atlassian-success h-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-[10px] text-right mt-1 font-bold opacity-60">45% выполнено</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExperts = () => {
    const filteredExperts = expertsList.filter(expert => {
      // Логика фильтра СОКБ: эксперты с бейджем СОКБ или тегом СОКБ
      const matchesFilter = expertFilter === 'all' 
        ? true 
        : expertFilter === 'sokb'
          ? (expert.isAcademyMember || expert.tags.includes('СОКБ'))
          : expert.category === expertFilter;

      const matchesSearch = expert.name.toLowerCase().includes(expertSearchQuery.toLowerCase()) || 
                            expert.role.toLowerCase().includes(expertSearchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const categories = [
      { id: 'all', label: 'Все', icon: 'apps' },
      { id: 'sokb', label: 'СОКБ', icon: 'verified' },
      { id: 'ecology', label: 'Экология', icon: 'eco' },
      { id: 'social', label: 'Социум', icon: 'groups' },
      { id: 'governance', label: 'Управление', icon: 'account_balance' },
      { id: 'legal', label: 'Право', icon: 'gavel' }
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Консолидированная панель управления экспертами: ТАБЫ СЛЕВА, ПОИСК СПРАВА */}
        <div className="p-4 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder bg-white dark:bg-atlassian-darkSurface shadow-atl-card flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          
          <div className="flex flex-wrap gap-1 bg-atlassian-bg dark:bg-atlassian-darkBg p-1 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setExpertFilter(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                  expertFilter === cat.id 
                  ? 'bg-white text-atlassian-text shadow-sm dark:bg-atlassian-darkSurface dark:text-white' 
                  : 'text-atlassian-subtext dark:text-atlassian-darkSubtext hover:text-atlassian-text dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-rounded text-[16px] ${expertFilter === cat.id ? 'text-atlassian-brand' : ''}`}>{cat.icon}</span>
                <span className={expertFilter === cat.id ? 'text-atlassian-text dark:text-white' : ''}>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-atlassian-subtext text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Поиск"
              value={expertSearchQuery}
              onChange={(e) => setExpertSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-atlassian-bg dark:bg-atlassian-darkBg border-none rounded-lg text-xs font-medium text-atlassian-text dark:text-white placeholder:text-atlassian-subtext/60 focus:ring-1 focus:ring-atlassian-brand/30 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExperts.length > 0 ? (
            filteredExperts.map(expert => (
              <div key={expert.id} className="atl-card p-6 flex flex-col group hover:border-atlassian-brand transition-colors relative">
                {expert.isAcademyMember && (
                  <div className="absolute top-4 right-4 bg-atlassian-success/10 text-atlassian-success px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-rounded text-[14px]">school</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide">Академия СОКБ</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6 mt-1">
                  <div className="relative">
                    {expert.avatarUrl ? (
                      <img src={expert.avatarUrl} alt={expert.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-atlassian-bg dark:bg-white/5 flex items-center justify-center text-xl font-bold text-atlassian-subtext">
                        {expert.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-atlassian-darkSurface ${expert.status === 'online' ? 'bg-atlassian-success' : 'bg-gray-400'}`}></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-atlassian-text dark:text-white leading-tight">{expert.name}</h3>
                    <p className="text-xs text-atlassian-subtext mt-0.5">{expert.role}</p>
                    <div className="flex items-center gap-1 mt-1 text-atlassian-warning">
                      <span className="material-symbols-rounded text-[14px]">star</span>
                      <span className="text-xs font-bold">{expert.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-atlassian-bg dark:bg-atlassian-darkBg text-atlassian-subtext text-[10px] font-bold uppercase rounded tracking-wide">{tag}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs text-atlassian-subtext">
                    <span>Опыт: <span className="font-bold text-atlassian-text dark:text-white">{expert.exp}</span></span>
                    <button 
                      onClick={() => openContactModal(expert)}
                      className="text-[10px] font-bold text-atlassian-brand uppercase tracking-wide hover:underline transition-all"
                    >
                      Связаться
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => openConnectModal(expert)}
                  className="w-full h-9 bg-atlassian-brand/10 text-atlassian-brand dark:bg-atlassian-brand/20 dark:text-white text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-atlassian-brand/20 dark:hover:bg-atlassian-brand/30 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-rounded text-[16px]">person_add</span>
                  Подключить
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
               <span className="material-symbols-rounded text-6xl mb-4">search_off</span>
               <p className="font-bold uppercase tracking-widest">Ничего не найдено</p>
               <p className="text-xs mt-2">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'environment': return renderEnvironmentSection();
      case 'regions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 h-[calc(100vh-250px)]">
            <div className="lg:col-span-3">
               {renderConnectedExpertsBar('regions')}
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="atl-card p-6 flex flex-col flex-1 overflow-y-auto">
                {selectedRegion ? (
                  <div className="animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-atlassian-text dark:text-white leading-tight">{selectedRegion.name}</h3>
                      <span className="material-symbols-rounded text-atlassian-brand text-[28px]">location_on</span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Updated Style: Neutral */}
                      <div className="p-5 bg-[#F7F7F7] dark:bg-white/5 rounded-xl border border-transparent dark:border-white/10">
                        <p className="text-[10px] font-bold text-atlassian-subtext uppercase mb-2 tracking-wide flex items-center gap-1">
                           <span className="material-symbols-rounded text-[14px]">info</span>
                           Описание деятельности
                        </p>
                        <p className="text-xs text-atlassian-text dark:text-white leading-relaxed">
                          {selectedRegion.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Updated Style: White Cards */}
                        <div className="p-4 bg-white dark:bg-atlassian-darkSurface border border-atlassian-border dark:border-atlassian-darkBorder rounded-xl shadow-sm">
                            <p className="text-[10px] font-bold text-atlassian-subtext uppercase tracking-wide mb-1">Инвестиции</p>
                            <p className="text-lg font-bold text-atlassian-brand">{selectedRegion.investment} млн</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-atlassian-darkSurface border border-atlassian-border dark:border-atlassian-darkBorder rounded-xl shadow-sm">
                            <p className="text-[10px] font-bold text-atlassian-subtext uppercase tracking-wide mb-1">Проекты</p>
                            <p className="text-lg font-bold text-atlassian-success">{selectedRegion.projects} ед.</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                           <p className="text-[10px] font-bold text-atlassian-subtext uppercase tracking-wide">Индекс соц. влияния</p>
                           <p className="text-xs font-bold text-atlassian-success">{selectedRegion.impactScore}%</p>
                        </div>
                        <div className="w-full bg-[#E5E7EB] dark:bg-white/10 h-2 rounded-full overflow-hidden">
                           <div className="bg-atlassian-success h-full" style={{ width: `${selectedRegion.impactScore}%` }}></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-atlassian-border dark:border-atlassian-darkBorder">
                         <div className="flex items-center justify-between text-[10px] font-bold text-atlassian-subtext uppercase tracking-wide">
                            <span>Последнее обновление</span>
                            <span>{selectedRegion.lastUpdate}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <span className="material-symbols-rounded text-4xl mb-2">touch_app</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-center">Выберите регион на карте для просмотра деталей</p>
                  </div>
                )}
              </div>
              
              <div className="atl-card p-6">
                 <h4 className="text-[10px] font-bold text-atlassian-subtext uppercase mb-4 tracking-widest">Общий охват регионов</h4>
                 <div className="flex items-end justify-between">
                    <div>
                       <p className="text-2xl font-bold text-atlassian-text dark:text-white">12.5 млн</p>
                       <p className="text-[10px] text-atlassian-subtext uppercase tracking-wide">Общий бюджет</p>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-bold text-atlassian-success">24</p>
                       <p className="text-[10px] text-atlassian-subtext uppercase tracking-wide">Действующих проекта</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2 atl-card overflow-hidden relative group">
              <RegionsMap 
                regions={data.regions} 
                onSelectRegion={setSelectedRegion} 
                selectedRegionId={selectedRegion?.id}
              />
              <div className="absolute top-4 right-4 bg-white/80 dark:bg-atlassian-darkSurface/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-atlassian-border dark:border-atlassian-darkBorder pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-atlassian-subtext uppercase tracking-wide">Интерактивная карта</p>
              </div>
            </div>
          </div>
        );
      case 'strategy':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {renderConnectedExpertsBar('strategy')}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 atl-card p-6 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-6">
                  <div>
                    <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Стратегическое развитие</h3>
                    <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">Прогресс по национальным целям и KPI</p>
                  </div>
                  <span className="material-symbols-rounded text-atlassian-brand text-[28px]">track_changes</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-atlassian-subtext mb-4">Национальные приоритеты</h4>
                      {/* Updated Style: Blue Theme */}
                      <div className="p-6 bg-[#F5F8FF] dark:bg-[#182333] rounded-xl border border-[#DDEAFE] dark:border-[#2C333A]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-[#1E40AF] dark:text-[#93C5FD] uppercase tracking-wide">Прогресс к 2030</span>
                          <span className="text-2xl font-bold text-[#1E40AF] dark:text-[#93C5FD]">{data.nationalGoalsProgress}%</span>
                        </div>
                        <div className="w-full bg-[#DDEAFE] dark:bg-[#1E3A8A] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#2563EB] dark:bg-[#60A5FA] h-full" style={{ width: `${data.nationalGoalsProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-atlassian-subtext mb-4">Эффективность планирования</h4>
                      {/* Updated Style: Green Theme */}
                      <div className="p-6 bg-[#F6FBF7] dark:bg-[#1C2B23] border border-[#E3F2E6] dark:border-[#2C3B33] rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-[#166534] dark:text-[#4ADE80]">{data.strategicEfficiency}</p>
                          <p className="text-[10px] font-bold text-[#166534]/80 dark:text-[#4ADE80]/80 uppercase mt-1 tracking-wide">Индекс соответствия</p>
                        </div>
                        <span className="material-symbols-rounded text-[#166534] dark:text-[#4ADE80] text-3xl">verified</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Updated Style: Neutral/Glassy */}
                  <div className="bg-[#F7F7F7] dark:bg-white/5 p-6 rounded-xl border border-transparent dark:border-white/10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <span className="material-symbols-rounded text-6xl">timeline</span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-atlassian-subtext mb-4 relative z-10">Долгосрочный прогноз</h4>
                    <p className="text-sm text-atlassian-text dark:text-white leading-relaxed relative z-10">
                      Текущая стратегия полностью интегрирована в производственные процессы. Оценка устойчивости подтверждает готовность к масштабированию в новых регионах.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-atlassian-success relative z-10">
                      <span className="material-symbols-rounded text-sm">check_circle</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Цикл актуализации пройден (Q1 2024)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="atl-card p-6 flex flex-col">
                <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="material-symbols-rounded text-atlassian-brand">lightbulb</span>
                  Стратегический фокус
                </h3>
                <div className="space-y-3 flex-1">
                  {[
                    { t: 'Цифровая трансформация', d: 'Внедрение ИИ-мониторинга во всех цехах.', p: 85 },
                    { t: 'Эко-реновация', d: 'Замена фильтрационного оборудования.', p: 40 },
                    { t: 'Соц. лифты', d: 'Программы кадрового резерва.', p: 62 }
                  ].map((item, i) => (
                    // Updated Style: Lighter List Items
                    <div key={i} className="p-4 bg-white dark:bg-white/5 rounded-xl border border-atlassian-border dark:border-white/10 shadow-sm hover:border-atlassian-brand/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-4">
                          <span className="text-[10px] font-bold text-atlassian-text dark:text-white uppercase block tracking-wider leading-tight">{item.t}</span>
                          <p className="text-[9px] text-atlassian-subtext mt-1 leading-tight">{item.d}</p>
                        </div>
                        <span className="text-xl font-bold text-atlassian-brand">{item.p}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-atlassian-brand h-full" style={{ width: `${item.p}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'employees':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {renderConnectedExpertsBar('employees')}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 atl-card p-8">
                 <div className="flex items-center justify-between mb-8 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-6">
                  <div>
                    <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Корпоративная среда</h3>
                    <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">Программы благополучия и развития персонала</p>
                  </div>
                  <span className="material-symbols-rounded text-atlassian-brand text-[28px]">groups</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-atlassian-subtext">Ключевые льготы</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { i: 'child_care', t: 'Поддержка семей', d: 'Выплаты при рождении и путевки в лагеря.' },
                          { i: 'fitness_center', t: 'Спорт и ЗОЖ', d: 'Компенсация абонементов и свои спортзалы.' },
                          { i: 'psychology', t: 'Псих. поддержка', d: 'Консультации 24/7 для всех сотрудников.' }
                        ].map((benefit, i) => (
                          // Updated Style
                          <div key={i} className="flex gap-4 p-4 bg-[#F7F7F7] dark:bg-white/5 rounded-xl border border-transparent dark:border-white/10 transition-colors hover:bg-white hover:shadow-sm dark:hover:bg-white/10">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-atlassian-brand shrink-0 shadow-sm">
                               <span className="material-symbols-rounded text-[18px]">{benefit.i}</span>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-atlassian-text dark:text-white uppercase tracking-tighter">{benefit.t}</p>
                               <p className="text-[11px] text-atlassian-subtext mt-0.5 leading-tight">{benefit.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   
                   {/* Updated Style: Blue Theme for Turnover */}
                   <div className="bg-[#F5F8FF] dark:bg-[#182333] p-6 rounded-xl border border-[#DDEAFE] dark:border-[#2C333A] flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <span className="material-symbols-rounded text-8xl text-[#1E40AF] dark:text-[#93C5FD]">directions_run</span>
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#1E40AF] dark:text-[#93C5FD] mb-4">Текучесть персонала</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-4xl font-bold text-[#1E3A8A] dark:text-white">2.4%</span>
                           <span className="text-xs text-[#16AB16] font-bold uppercase bg-[#DCFCE7] dark:bg-[#14532D] px-2 py-1 rounded">-0.8% к Г/Г</span>
                        </div>
                        <p className="text-xs text-[#1E40AF]/80 dark:text-[#93C5FD]/80 leading-relaxed">
                          Показатель ниже среднего по отрасли на 1.5%. Основной фактор удержания — прозрачная система грейдирования.
                        </p>
                      </div>
                      <button className="w-full mt-6 h-9 bg-[#1E40AF] text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors relative z-10 shadow-lg shadow-blue-900/20">
                        Скачать полный отчет HR
                      </button>
                   </div>
                </div>
              </div>

              <div className="atl-card p-6 flex flex-col">
                <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider mb-6">Баланс команды</h3>
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                   <div className="w-40 h-40 relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie 
                              data={[ {v: 60}, {v: 40} ]} cx="50%" cy="50%" 
                              innerRadius={50} outerRadius={70} 
                              dataKey="v" stroke="none" paddingAngle={5}
                            >
                               <Cell fill="#0052CC" />
                               <Cell fill="#00B8D9" />
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-xs font-bold text-atlassian-subtext uppercase">Ж / М</span>
                         <span className="text-xl font-bold text-atlassian-text dark:text-white">60 / 40</span>
                      </div>
                   </div>
                   <div className="w-full mt-8 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-atlassian-subtext uppercase font-bold tracking-tighter">Средний возраст</span>
                         <span className="font-bold">34 года</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-atlassian-subtext uppercase font-bold tracking-tighter">Ср. стаж в компании</span>
                         <span className="font-bold">5.8 лет</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Объединенный контейнер StatCards */}
            <div className="atl-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-rounded text-atlassian-brand">badge</span>
                    Основные показатели персонала
                 </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Индекс здоровья" 
                  value={data.healthSafetyIndex} unit="%" change={4} 
                  icon="health_and_safety" color="text-atlassian-success" 
                  theme={theme}
                  trendData={[{value: 90}, {value: 92}, {value: 91}, {value: 94}, {value: 95}, {value: 96}]}
                />
                <StatCard 
                  title="Охват ДМС" 
                  value={data.vhiCoverage} unit="%" change={0} 
                  icon="medical_services" color="text-atlassian-info" 
                  theme={theme}
                  trendData={[{value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}, {value: 100}]}
                />
                <StatCard 
                  title="Обучение" 
                  value={data.trainingHours} unit="ч" change={12} 
                  icon="school" color="text-atlassian-brand" 
                  theme={theme}
                  trendData={[{value: 30}, {value: 34}, {value: 36}, {value: 38}, {value: 40}, {value: 42}]}
                />
                <StatCard 
                  title="Соц. бюджет" 
                  value="4.5" unit="млн" change={5} 
                  icon="payments" color="text-atlassian-warning" 
                  theme={theme}
                  trendData={[{value: 4.0}, {value: 4.1}, {value: 4.2}, {value: 4.3}, {value: 4.4}, {value: 4.5}]}
                />
              </div>
            </div>
          </div>
        );
      case 'ai-insights':
        const forecastMetrics = [
          {
            title: 'Здоровье и население',
            subtitle: 'Индекс благополучия',
            icon: 'favorite',
            color: '#0052CC',
            cagr: '+4.2%',
            subMetrics: [
                { label: 'Подд. семей', value: '85%', icon: 'family_restroom' },
                { label: 'Травматизм', value: '0.12', icon: 'healing' }
            ],
            data: [
              { year: '2021', fact: 82, forecast: null },
              { year: '2022', fact: 85, forecast: null },
              { year: '2023', fact: 88, forecast: null },
              { year: '2024', fact: 91, forecast: 91 },
              { year: '2025', fact: null, forecast: 94 },
              { year: '2026', fact: null, forecast: 96.5 },
              { year: '2027', fact: null, forecast: 98.2 },
            ]
          },
          {
            title: 'Экология и среда',
            subtitle: 'Индекс эко-эффективности',
            icon: 'eco',
            color: '#36B37E',
            colorClass: 'text-atlassian-success',
            cagr: '+3.8%',
            subMetrics: [
                { label: 'Переработка', value: '92%', icon: 'recycling' },
                { label: 'CO2 след', value: '-15%', icon: 'cloud_done' }
            ],
            data: [
              { year: '2021', fact: 60, forecast: null },
              { year: '2022', fact: 65, forecast: null },
              { year: '2023', fact: 72, forecast: null },
              { year: '2024', fact: 78, forecast: 78 },
              { year: '2025', fact: null, forecast: 82 },
              { year: '2026', fact: null, forecast: 85.5 },
              { year: '2027', fact: null, forecast: 88 },
            ]
          },
          {
            title: 'Потенциал человека',
            subtitle: 'Индекс развития талантов',
            icon: 'school',
            color: '#FFAB00',
            colorClass: 'text-atlassian-warning',
            cagr: '+5.5%',
            subMetrics: [
                { label: 'Обучение', value: '42ч/чел', icon: 'history_edu' },
                { label: 'Инклюзия', value: '94%', icon: 'diversity_3' }
            ],
            data: [
              { year: '2021', fact: 65, forecast: null },
              { year: '2022', fact: 70, forecast: null },
              { year: '2023', fact: 74, forecast: null },
              { year: '2024', fact: 78, forecast: 78 },
              { year: '2025', fact: null, forecast: 82 },
              { year: '2026', fact: null, forecast: 86.5 },
              { year: '2027', fact: null, forecast: 90 },
            ]
          },
          {
            title: 'Устойчивая экономика',
            subtitle: 'Эффективность инвестиций',
            icon: 'trending_up',
            color: '#00B8D9',
            colorClass: 'text-atlassian-info',
            cagr: '+3.1%',
            subMetrics: [
                { label: 'МСП закупки', value: '48%', icon: 'storefront' },
                { label: 'НИОКР инвест', value: '12%', icon: 'biotech' }
            ],
            data: [
              { year: '2021', fact: 12, forecast: null },
              { year: '2022', fact: 13.5, forecast: null },
              { year: '2023', fact: 14.2, forecast: null },
              { year: '2024', fact: 15.1, forecast: 15.1 },
              { year: '2025', fact: null, forecast: 15.8 },
              { year: '2026', fact: null, forecast: 16.4 },
              { year: '2027', fact: null, forecast: 17.0 },
            ]
          }
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             {/* Header Bar */}
             <div className="atl-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gradient-to-tr from-atlassian-brand to-atlassian-info rounded-xl flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-rounded text-3xl">auto_awesome</span>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider">Интеллект Инстат</h3>
                      <p className="text-xs text-atlassian-subtext dark:text-atlassian-darkSubtext mt-1">Стратегический отчет и прогнозирование</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                       onClick={() => alert("Генерация PDF отчета началась. Файл будет загружен автоматически.")}
                       className="h-10 px-4 bg-atlassian-bg dark:bg-atlassian-darkBg border border-atlassian-border dark:border-atlassian-darkBorder text-atlassian-text dark:text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-atlassian-border dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                       <span className="material-symbols-rounded text-[18px]">picture_as_pdf</span>
                       Скачать PDF
                    </button>
                    <button 
                       onClick={fetchInsights} 
                       disabled={isAnalyzing} 
                       className={`h-10 px-4 bg-atlassian-brand text-white text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all flex items-center gap-2 ${isAnalyzing ? 'opacity-50' : 'hover:bg-atlassian-brandHover active:scale-95 shadow-md shadow-atlassian-brand/20'}`}
                    >
                       <span className="material-symbols-rounded text-[18px]">{isAnalyzing ? 'sync' : 'bolt'}</span>
                       {isAnalyzing ? 'Анализ...' : 'Обновить'}
                    </button>
                </div>
             </div>

             {/* Блок прогнозов - Updated to match the Overview KPI style */}
             <div className="atl-card p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-rounded text-atlassian-brand">insights</span>
                      Прогноз устойчивого развития 2025-2027
                   </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {forecastMetrics.map((metric, idx) => (
                      <StatCard 
                        key={idx}
                        title={metric.title}
                        subtitle={metric.subtitle}
                        value={metric.data[3].fact || 0}
                        change={parseFloat(metric.cagr)}
                        icon={metric.icon}
                        color={metric.colorClass || 'text-atlassian-brand'}
                        theme={theme}
                        trendData={metric.data.map(d => ({ value: d.fact || d.forecast || 0 }))}
                        subMetrics={metric.subMetrics}
                      />
                  ))}
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                 {/* Основной отчет */}
                 <div className="xl:col-span-2 atl-card p-8 min-h-[600px] flex flex-col">
                    <h3 className="text-sm font-bold text-atlassian-text dark:text-atlassian-darkText uppercase tracking-wider mb-6 border-b border-atlassian-border dark:border-atlassian-darkBorder pb-4 flex justify-between items-center">
                       <span>Отчет о состоянии СОКБ</span>
                       <span className="text-[10px] bg-atlassian-success/10 text-atlassian-success px-2 py-1 rounded">СТАТУС: ГОТОВО</span>
                    </h3>
                    
                    {isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                           <div className="w-10 h-10 border-4 border-atlassian-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                           <p className="text-xs font-bold text-atlassian-subtext uppercase tracking-widest animate-pulse">Генерация отчета...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-atlassian-text dark:text-atlassian-darkText leading-relaxed text-sm overflow-y-auto pr-2 custom-scrollbar">
                           {insights ? (
                              <div className="whitespace-pre-wrap">{insights}</div>
                           ) : (
                              <div className="text-center py-10 opacity-60">
                                 <span className="material-symbols-rounded text-4xl mb-2">description</span>
                                 <p>Нажмите "Обновить" для получения актуального стратегического отчета.</p>
                              </div>
                           )}
                        </div>
                    )}
                 </div>

                 {/* Боковая колонка */}
                 <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-atlassian-success/20 to-atlassian-brand/5 border border-atlassian-success/20 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-[10px] font-bold text-atlassian-success uppercase tracking-widest">Индекс доверия</h4>
                           <span className="material-symbols-rounded text-atlassian-success">verified_user</span>
                        </div>
                        <p className="text-3xl font-bold text-atlassian-text dark:text-white mb-1">98/100</p>
                        <p className="text-[10px] text-atlassian-subtext opacity-80">Высокая достоверность данных</p>
                    </div>

                    <div className="p-6 bg-white dark:bg-atlassian-darkSurface border border-atlassian-border dark:border-atlassian-darkBorder rounded-lg shadow-sm">
                       <h4 className="text-[10px] font-bold text-atlassian-subtext uppercase tracking-widest mb-4">Методология</h4>
                       <p className="text-xs text-atlassian-subtext leading-relaxed">
                          Расчет прогноза основан на исторических данных за 2021-2023 годы с использованием линейной экстраполяции и коэффициента CAGR (среднегодового темпа роста).
                       </p>
                       <button className="mt-4 text-[10px] font-bold text-atlassian-brand uppercase hover:underline">Подробнее о модели</button>
                    </div>
                 </div>
             </div>
          </div>
        );
      case 'questionnaire': return renderQuestionnaire();
      case 'experts': return renderExperts();
      default: return (
        <div className="atl-card p-20 flex flex-col items-center justify-center text-atlassian-subtext border-dashed border-2">
          <span className="material-symbols-rounded text-6xl mb-4 opacity-20">construction</span>
          <p className="font-bold uppercase tracking-widest opacity-40">Данный раздел находится в активной разработке</p>
        </div>
      );
    }
  };

  const getSectionTitle = (section: Section) => {
    switch(section) {
      case 'overview': return 'Статистика устойчивого развития';
      case 'strategy': return 'Стратегические цели';
      case 'employees': return 'Карточка персонала';
      case 'regions': return 'Влияние на регионы';
      case 'environment': return 'Эко-менеджмент';
      case 'ai-insights': return 'ИИ-Аналитика';
      case 'questionnaire': return 'Стандарт общественного капитала бизнеса';
      case 'experts': return 'База экспертов';
      default: return '';
    }
  };

  const getBreadcrumbLabel = (section: Section) => {
    switch(section) {
      case 'overview': return 'Обзор';
      case 'strategy': return 'Стратегия';
      case 'employees': return 'Сотрудники';
      case 'regions': return 'Регионы';
      case 'environment': return 'Экология';
      case 'ai-insights': return 'ИИ-Аналитика';
      case 'questionnaire': return 'Анкета СОКБ';
      case 'experts': return 'Эксперты';
      default: return '';
    }
  };

  const activeTitle = getSectionTitle(activeSection);
  const breadcrumbLabel = getBreadcrumbLabel(activeSection);

  return (
    <div className="min-h-screen bg-atlassian-bg dark:bg-atlassian-darkBg text-atlassian-text dark:text-atlassian-darkText transition-colors flex relative">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'} p-8 transition-all duration-300`}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext font-bold uppercase tracking-wider mb-2">
              <span>Главная</span>
              <span className="material-symbols-rounded text-[12px]">chevron_right</span>
              <span>Отчеты</span>
              <span className="material-symbols-rounded text-[12px]">chevron_right</span>
              <span className="bg-atlassian-text text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1 dark:bg-atlassian-darkBorder">
                <span className="material-symbols-rounded text-[12px] text-white">check_circle</span>
                {breadcrumbLabel}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-atlassian-text dark:text-white tracking-tight leading-tight">{activeTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-atlassian-subtext hover:bg-white dark:hover:bg-atlassian-darkBorder transition-colors bg-white/50 dark:bg-atlassian-darkSurface border border-atlassian-border dark:border-atlassian-darkBorder">
              <span className="material-symbols-rounded text-[20px]">settings</span>
            </button>
            <button onClick={toggleTheme} className="w-10 h-10 rounded-lg flex items-center justify-center text-atlassian-subtext hover:bg-white dark:hover:bg-atlassian-darkBorder transition-colors bg-white/50 dark:bg-atlassian-darkSurface border border-atlassian-border dark:border-atlassian-darkBorder">
              <span className="material-symbols-rounded text-[20px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
            </button>
          </div>
        </header>

        {renderSectionContent()}

        <footer className="mt-20 pt-8 border-t border-atlassian-border dark:border-atlassian-darkBorder text-atlassian-subtext text-[10px] uppercase font-bold tracking-widest flex justify-between items-center opacity-60">
          <div className="flex items-center gap-4">
            <span>версия 0.0.1</span>
          </div>
          <span>© 2026 • Платформа управления устойчивым развитием Инстат</span>
        </footer>
      </main>
      
      <AIAssistantWidget data={data} theme={theme} />

      {/* Модальное окно подключения к разделу */}
      {isConnectModalOpen && selectedExpertForConnection && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-atlassian-darkSurface rounded-2xl shadow-2xl w-full max-md overflow-hidden animate-in zoom-in-95 duration-200 border border-atlassian-border dark:border-atlassian-darkBorder">
              <div className="p-6 border-b border-atlassian-border dark:border-atlassian-darkBorder flex justify-between items-center bg-atlassian-bg dark:bg-atlassian-darkBg">
                 <h3 className="text-lg font-bold text-atlassian-text dark:text-white">Подключение специалиста</h3>
                 <button onClick={() => setIsConnectModalOpen(false)} className="text-atlassian-subtext hover:text-atlassian-text transition-colors">
                    <span className="material-symbols-rounded">close</span>
                 </button>
              </div>
              <div className="p-6">
                 <div className="flex items-center gap-4 mb-6">
                    {selectedExpertForConnection.avatarUrl ? (
                       <img src={selectedExpertForConnection.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                       <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
                          {selectedExpertForConnection.name.charAt(0)}
                       </div>
                    )}
                    <div>
                       <h4 className="font-bold text-atlassian-text dark:text-white text-lg">{selectedExpertForConnection.name}</h4>
                       <p className="text-sm text-atlassian-subtext">{selectedExpertForConnection.role}</p>
                    </div>
                 </div>
                 
                 <p className="text-xs font-bold text-atlassian-subtext uppercase mb-3 tracking-wide">Выберите раздел для подключения:</p>
                 <div className="space-y-2">
                    {[
                      { id: 'strategy', label: 'Стратегия', icon: 'track_changes' },
                      { id: 'employees', label: 'Сотрудники', icon: 'groups' },
                      { id: 'regions', label: 'Регионы', icon: 'location_on' },
                      { id: 'environment', label: 'Экология', icon: 'eco' },
                      { id: 'questionnaire', label: 'Анкета СОКБ', icon: 'assignment' }
                    ].map(section => (
                       <button 
                          key={section.id}
                          onClick={() => connectExpertToSection(section.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-atlassian-border dark:border-atlassian-darkBorder hover:border-atlassian-brand hover:bg-atlassian-brand/5 transition-all group"
                       >
                          <span className="material-symbols-rounded text-atlassian-subtext group-hover:text-atlassian-brand">{section.icon}</span>
                          <span className="text-sm font-medium text-atlassian-text dark:text-white group-hover:text-atlassian-brand">{section.label}</span>
                          {connectedExperts[section.id]?.includes(selectedExpertForConnection.id) && (
                             <span className="ml-auto text-xs text-atlassian-success font-bold flex items-center gap-1 uppercase tracking-wide">
                                <span className="material-symbols-rounded text-[14px]">check</span>
                                Подключен
                             </span>
                          )}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Модальное окно контактов специалиста */}
      {isContactModalOpen && selectedExpertForContact && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-atlassian-darkSurface rounded-2xl shadow-2xl w-full max-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-atlassian-border dark:border-atlassian-darkBorder relative">
              <button 
                onClick={() => setIsContactModalOpen(false)} 
                className="absolute top-4 right-4 text-atlassian-subtext hover:text-atlassian-text transition-colors z-10"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
              <div className="p-8 flex flex-col items-center">
                 <div className="mb-4">
                    {selectedExpertForContact.avatarUrl ? (
                       <img src={selectedExpertForContact.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-atlassian-bg dark:border-atlassian-darkBg shadow-md" />
                    ) : (
                       <div className="w-24 h-24 rounded-full bg-atlassian-bg dark:bg-white/5 flex items-center justify-center text-3xl font-bold text-atlassian-subtext">
                          {selectedExpertForContact.name.charAt(0)}
                       </div>
                    )}
                 </div>
                 
                 <h3 className="text-xl font-bold text-atlassian-text dark:text-white text-center mb-1">{selectedExpertForContact.name}</h3>
                 <p className="text-sm text-atlassian-subtext text-center mb-6">{selectedExpertForContact.role}</p>
                 
                 <div className="w-full space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-atlassian-bg dark:bg-white/5 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder">
                       <span className="material-symbols-rounded text-atlassian-brand">phone_iphone</span>
                       <span className="text-sm font-bold text-atlassian-text dark:text-white">{selectedExpertForContact.phone || '+7 XXX XXX XX XX'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-atlassian-bg dark:bg-white/5 rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder">
                       <span className="material-symbols-rounded text-atlassian-brand">mail</span>
                       <span className="text-sm font-bold text-atlassian-text dark:text-white truncate">{selectedExpertForContact.email || 'expert@инстат.рф'}</span>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                       <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.24.24-.43.24l.197-2.91 5.292-4.773c.23-.204-.05-.316-.354-.113L8.514 13.91l-2.822-.88c-.614-.19-.626-.614.128-.9l11.02-4.25c.51-.19.957.114.773.88z"/></svg>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                       <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
