
import React from 'react';
import { Section } from '../types';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isCollapsed, toggleSidebar }) => {
  const menuItems: { id: Section; label: string; icon: string }[] = [
    { id: 'overview', label: 'Обзор', icon: 'dashboard' },
    { id: 'strategy', label: 'Стратегия', icon: 'track_changes' },
    { id: 'employees', label: 'Сотрудники', icon: 'groups' },
    { id: 'regions', label: 'Регионы', icon: 'location_on' },
    { id: 'environment', label: 'Экология', icon: 'eco' },
    { id: 'ai-insights', label: 'ИИ-Аналитика', icon: 'auto_awesome' },
    { id: 'questionnaire', label: 'Анкета СОКБ', icon: 'assignment' },
    { id: 'experts', label: 'База экспертов', icon: 'school' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-atlassian-darkSurface h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 border-r border-atlassian-border dark:border-atlassian-darkBorder shadow-xl shadow-black/5`}>
      <div className={`p-5 border-b border-atlassian-border dark:border-atlassian-darkBorder relative flex flex-col ${isCollapsed ? 'items-center gap-2' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center mb-0' : 'mb-6'}`}>
          <div className="w-10 h-10 bg-atlassian-brand rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-atlassian-brand/30">
            <span className="material-symbols-rounded text-[24px]">trending_up</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-base font-bold tracking-tight text-atlassian-text dark:text-atlassian-darkText uppercase leading-none">Инстат</h1>
              <p className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext uppercase tracking-widest font-bold mt-0.5">Платформа</p>
            </div>
          )}
        </div>

        {/* Обновленный блок Инстат-Индекс по макету "Инстат Статус" */}
        {!isCollapsed && (
          <div className="bg-[#F7F7F7] dark:bg-white/5 rounded-xl p-5 relative animate-in fade-in zoom-in-95 duration-300 border border-transparent dark:border-atlassian-darkBorder/50">
             <div className="mb-4">
               <h3 className="text-[12px] font-bold text-atlassian-text dark:text-white uppercase leading-tight mb-1 tracking-tight truncate" title="ООО «МОЯ КОМПАНИЯ»">
                  ООО «МОЯ КОМПАНИЯ»
               </h3>
               <p className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext font-bold leading-tight tracking-tight opacity-80">
                 ОГРН 1234567898765
               </p>
             </div>

             <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-0.5 bg-[#DCFCE7] dark:bg-[#14532D] text-[#166534] dark:text-[#BBF7D0] rounded text-[9px] font-bold uppercase tracking-wide">РАЗВИТИЕ+</span>
                <span className="px-2 py-0.5 bg-[#F3E8FF] dark:bg-[#581C87] text-[#6B21A8] dark:text-[#E9D5FF] rounded text-[9px] font-bold uppercase tracking-wide">ТОП-50</span>
             </div>

             <div className="w-full bg-[#E5E7EB] dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-3">
                 <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '85%' }}></div>
             </div>

             <div className="flex justify-between items-center gap-2">
                <p className="text-[9px] text-atlassian-subtext dark:text-atlassian-darkSubtext font-medium opacity-80 uppercase tracking-tight whitespace-nowrap">Обновлено 24.02.26</p>
                <span className="px-2 py-0.5 bg-[#E5E7EB] dark:bg-[#374151] text-[#374151] dark:text-[#D1D5DB] rounded text-[9px] font-bold uppercase tracking-wider truncate">КРУПНЫЙ БИЗНЕС</span>
             </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3 mt-4 overflow-y-auto scrollbar-hide">
        <p className={`text-[10px] font-bold text-atlassian-subtext uppercase tracking-widest mb-2 px-3 ${isCollapsed ? 'hidden' : ''}`}>Меню</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} h-10 rounded-lg transition-all text-[11px] font-bold uppercase tracking-wide ${
                  activeSection === item.id
                    ? 'bg-atlassian-text text-white shadow-md dark:bg-atlassian-darkBorder dark:text-white'
                    : 'text-atlassian-subtext dark:text-atlassian-darkSubtext hover:bg-atlassian-bg dark:hover:bg-white/5 hover:text-atlassian-text dark:hover:text-atlassian-darkText'
                }`}
              >
                <span className={`material-symbols-rounded ${activeSection === item.id ? 'opacity-100' : 'opacity-70'} shrink-0 text-[20px]`}>{item.icon}</span>
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis animate-in fade-in duration-300">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Toggle Button */}
      <div className={`p-4 mt-auto border-t border-atlassian-border dark:border-atlassian-darkBorder flex ${isCollapsed ? 'justify-center' : 'justify-between items-center'}`}>
        {!isCollapsed && (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm border border-white dark:border-gray-600">MK</div>
                <div className="flex flex-col">
                   <span className="text-[11px] font-bold text-atlassian-text dark:text-white leading-none">Моя Компания</span>
                   <span className="text-[9px] text-atlassian-subtext">Corp ID: 9942</span>
                </div>
            </div>
        )}
        <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-atlassian-subtext hover:bg-atlassian-bg dark:hover:bg-white/10 transition-all cursor-pointer hover:text-atlassian-text"
        >
             <span className="material-symbols-rounded text-[20px]">{isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
