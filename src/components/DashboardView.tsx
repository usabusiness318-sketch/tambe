import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Briefcase, Users, LayoutList, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAI } from '../hooks/useAI';

export function DashboardView() {
  const { clients, projects, transactions } = useApp();
  const { generateInsight, loading } = useAI();
  const [insight, setInsight] = useState<string>('');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const handleGenerateInsight = async () => {
    try {
      const data = {
        totalIncome,
        totalExpense,
        netRevenue: totalIncome - totalExpense,
        activeProjects,
        transactionsCount: transactions.length,
        recentActivity: transactions.slice(0, 5).map(t => ({ desc: t.description || t.category, amount: t.amount, type: t.type }))
      };
      const result = await generateInsight(data, 'dashboard');
      setInsight(result);
    } catch (e: any) {
      alert("Failed to generate insight: " + e.message);
    }
  };

  // Generate chart data (last 7 days logic simplified to just group by date)
  const chartData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number }> = {};
    transactions.forEach(t => {
      const dateStr = format(t.date, 'MMM dd');
      if (!data[dateStr]) data[dateStr] = { name: dateStr, income: 0, expense: 0 };
      if (t.type === 'income') data[dateStr].income += t.amount;
      else data[dateStr].expense += t.amount;
    });
    return Object.values(data).slice(-7); // Last 7 unique dates with txs
  }, [transactions]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Overview of your business performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Net Revenue" value={formatCurrency(totalIncome - totalExpense)} icon={ArrowUpRight} trend="+12.5%" />
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={ArrowUpRight} trend="+5.2%" />
        <StatCard title="Active Projects" value={activeProjects.toString()} icon={Briefcase} />
        <StatCard title="Total Clients" value={clients.length.toString()} icon={Users} />
      </div>

      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/10 p-6 text-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Financial Analyst
            </h3>
            <p className="text-slate-300 text-sm mt-1 mb-4">
              Get an instant AI-powered health check on your business finances and operations based on recent activities.
            </p>
            {insight ? (
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line border border-white/10 shadow-inner">
                {insight}
              </div>
            ) : null}
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={loading}
            className="flex-shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Generate Insights"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 relative overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-6 tracking-tight">Revenue Overview</h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#818cf8" strokeWidth={3} dot={{ strokeWidth: 3, r: 4, fill: '#1e1b4b', stroke: '#818cf8' }} activeDot={{ r: 6, fill: '#818cf8' }} className="drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                  <Line type="monotone" dataKey="expense" stroke="#475569" strokeWidth={3} dot={{ strokeWidth: 3, r: 4, fill: '#0f172a', stroke: '#475569' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                No transaction data available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white tracking-tight">Recent Activity</h3>
            <LayoutList className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">{tx.description || tx.category}</span>
                  <span className="text-xs text-slate-400">{format(tx.date, 'MMM dd, yyyy')}</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  tx.type === 'income' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]' : 'text-slate-400'
                )}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-sm text-slate-500 mt-4 text-center">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] group-hover:bg-white/10 transition-colors pointer-events-none"></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm relative z-10">
          <span className="text-indigo-300 font-medium bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md flex items-center shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            {trend}
          </span>
          <span className="text-slate-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}
