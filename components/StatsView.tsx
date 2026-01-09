import React, { useMemo, useState } from 'react';
import { Transaction, Tag, Account, ChartType } from '../types';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PieChart, Wallet, TrendingUp, AlertTriangle, Edit3, BarChart2, LineChart as LineChartIcon, Activity } from 'lucide-react';

interface StatsViewProps {
  transactions: Transaction[];
  tags: Tag[];
  accounts: Account[];
  themeStyles: any;
  text: any;
  onUpdateBudget: (tagId: string, limit: number) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ transactions, tags, accounts, themeStyles: T, text, onUpdateBudget }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // --- Budget Logic ---
  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
       t.tags.forEach(tagId => {
          map.set(tagId, (map.get(tagId) || 0) + t.amount);
       });
    });
    return Array.from(map.entries()).map(([tagId, spent]) => {
        const tag = tags.find(t => t.id === tagId);
        return {
            id: tagId,
            name: tag?.name || text.unsorted,
            spent,
            limit: tag?.budgetLimit || 0,
            color: tag?.color || ''
        };
    }).sort((a, b) => b.spent - a.spent);
  }, [transactions, tags, text]);

  // --- Monthly Chart Data ---
  const chartData = useMemo(() => {
     const data = new Array(6).fill(0).map((_, i) => {
         const d = new Date();
         d.setMonth(d.getMonth() - i);
         return {
             name: d.toLocaleDateString(undefined, { month: 'short' }),
             income: 0,
             expense: 0
         };
     }).reverse();

     transactions.forEach(t => {
         const d = new Date(t.date);
         const monthStr = d.toLocaleDateString(undefined, { month: 'short' });
         const entry = data.find(item => item.name === monthStr);
         if (entry) {
             if (t.type === 'income') entry.income += t.amount;
             if (t.type === 'expense') entry.expense += t.amount;
         }
     });
     return data;
  }, [transactions]);

  const handleBudgetClick = (tagId: string) => {
      const newLimitStr = prompt("Set monthly budget for this category:", "");
      if (newLimitStr !== null) {
          const limit = parseFloat(newLimitStr);
          if (!isNaN(limit)) {
              onUpdateBudget(tagId, limit);
          }
      }
  };

  const renderChart = () => {
      const commonProps = {
          data: chartData,
          margin: { top: 10, right: 10, left: -20, bottom: 0 }
      };

      if (chartType === 'line') {
          return (
              <LineChart {...commonProps}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                 <RechartsTooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                 <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                 <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{r:4}} />
              </LineChart>
          );
      }
      if (chartType === 'area') {
        return (
            <AreaChart {...commonProps}>
               <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
               <RechartsTooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
               <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
               <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
        );
      }

      // Default Bar
      return (
        <BarChart {...commonProps}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      );
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* 1. ASSET MANAGEMENT */}
      <div className={`p-6 rounded-3xl ${T.card} shadow-sm`}>
         <div className="flex items-center gap-2 mb-4 opacity-50">
            <Wallet size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">{text.assetStatus}</span>
         </div>
         <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">{text.totalAssets}</span>
                <div className="text-xl font-black text-slate-700">
                   {accounts.filter(a => a.balance > 0).reduce((acc, a) => acc + a.balance, 0).toLocaleString()}
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">{text.liabilities}</span>
                <div className="text-xl font-black text-red-500">
                   {Math.abs(accounts.filter(a => a.balance < 0).reduce((acc, a) => acc + a.balance, 0)).toLocaleString()}
                </div>
             </div>
         </div>
      </div>

      {/* 2. BUDGET CONTROL */}
      <div className={`p-6 rounded-3xl ${T.card} shadow-sm`}>
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 opacity-50">
                <PieChart size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{text.budgetControl}</span>
            </div>
            <span className="text-[10px] opacity-40 italic">Tap bar to edit</span>
         </div>
         
         <div className="space-y-6">
            {categorySpending.slice(0, 5).map(cat => {
                const percent = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
                const isOver = percent >= 100;
                const isWarning = percent >= 80;
                
                return (
                    <div key={cat.id} className="cursor-pointer group" onClick={() => handleBudgetClick(cat.id)}>
                       <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1">
                             {cat.name}
                             <Edit3 size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                          </span>
                          <span className={isOver ? 'text-red-500' : isWarning ? 'text-orange-500' : 'opacity-60'}>
                             ${cat.spent.toLocaleString()} <span className="opacity-40">/ {cat.limit || '∞'}</span>
                          </span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                          <div 
                             className={`h-full rounded-full ${isOver ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`}
                             style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                       </div>
                       {isWarning && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-orange-500">
                             <AlertTriangle size={10} />
                             {isOver ? text.budgetExceeded : text.nearLimit}
                          </div>
                       )}
                    </div>
                );
            })}
         </div>
      </div>

      {/* 3. TRENDS */}
      <div className={`p-6 rounded-3xl ${T.card} shadow-sm`}>
         <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 opacity-50">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{text.cashFlow}</span>
             </div>
             
             <div className="flex bg-slate-100 rounded-lg p-0.5">
                 <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white shadow-sm' : 'opacity-50'}`}><BarChart2 size={14}/></button>
                 <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-white shadow-sm' : 'opacity-50'}`}><LineChartIcon size={14}/></button>
                 <button onClick={() => setChartType('area')} className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-white shadow-sm' : 'opacity-50'}`}><Activity size={14}/></button>
             </div>
         </div>
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
               {renderChart()}
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};