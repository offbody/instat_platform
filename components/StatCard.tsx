
import React, { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, YAxis, XAxis, Tooltip } from 'recharts';

interface SubMetric {
  label: string;
  value: string | number;
  icon?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: string;
  color: string; // Tailwind text- class
  trendData?: { value: number }[];
  theme?: 'light' | 'dark';
  subtitle?: string;
  subMetrics?: SubMetric[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, change, icon, color, trendData, theme = 'light', subtitle, subMetrics }) => {
  const isPositive = change !== undefined && change >= 0;
  const uniqueId = useId().replace(/:/g, '');
  
  const chartData = trendData || [
    { value: 10 }, { value: 15 }, { value: 13 }, { value: 20 }, { value: 18 }, { value: 25 }, { value: 22 }
  ];

  const chartGrid = theme === 'dark' ? '#2C333A' : '#EBECF0';

  const getChartColor = (cls: string) => {
    if (cls.includes('success')) return '#16AB16';
    if (cls.includes('error')) return '#BF2600';
    if (cls.includes('warning')) return '#FF991F';
    if (cls.includes('info')) return '#00B8D9';
    if (cls.includes('brand')) return '#0052CC';
    return '#0052CC';
  };

  const chartColor = getChartColor(color);
  const gradientId = `grad-${uniqueId}`;

  // Helper to get background color class from text color class
  const getIconBgClass = (textColorClass: string) => {
    return textColorClass.replace('text-', 'bg-') + '/10';
  };

  const iconBgClass = getIconBgClass(color);

  return (
    <div className="p-5 bg-white dark:bg-atlassian-darkSurface rounded-xl border border-atlassian-border dark:border-atlassian-darkBorder flex flex-col transition-all hover:shadow-atl-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3 items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0 border border-transparent ${iconBgClass} dark:bg-white/5`}>
            <span className={`material-symbols-rounded text-[20px] ${color}`}>{icon}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-atlassian-text dark:text-atlassian-darkText leading-tight tracking-wider">
              {title}
            </p>
            <p className="text-[10px] text-atlassian-subtext dark:text-atlassian-darkSubtext/50 font-medium mt-0.5">
              {subtitle || 'Текущий показатель'}
            </p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className="text-right">
            <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${isPositive ? 'text-atlassian-success' : 'text-atlassian-error'}`}>
               <span className="material-symbols-rounded text-[16px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
               {Math.abs(change)}%
            </div>
            <p className="text-[9px] font-bold text-atlassian-subtext uppercase tracking-wider">CAGR</p>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-atlassian-text dark:text-white tracking-tight">{value}</span>
          {unit && <span className="text-[10px] text-atlassian-subtext font-black uppercase tracking-widest">{unit}</span>}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[60px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} opacity={0.5} />
            <XAxis hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', border: 'none', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: theme === 'dark' ? '#1D2125' : '#FFFFFF',
                color: theme === 'dark' ? '#FFFFFF' : '#242424',
                fontSize: '11px',
                fontWeight: 600
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={2} 
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-metrics section */}
      {subMetrics && subMetrics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-atlassian-border/50 dark:border-atlassian-darkBorder/50 grid grid-cols-2 gap-2">
          {subMetrics.map((sm, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                {sm.icon && <span className="material-symbols-rounded text-[14px] opacity-60">{sm.icon}</span>}
                <span className="text-[9px] font-bold text-atlassian-subtext uppercase truncate leading-none tracking-wide">{sm.label}</span>
              </div>
              <span className="text-[12px] font-bold text-atlassian-text dark:text-white leading-none">{sm.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
