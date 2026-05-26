import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { TransactionType } from '../types';

export function FinancesView() {
  const { transactions, projects, addTransaction } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [projectId, setProjectId] = useState('');

  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    
    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).getTime(),
      projectId: projectId || undefined,
    });
    
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setProjectId('');
    setIsAdding(false);
  };

  const filteredTransactions = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => b.date - a.date);

  const balance = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        format(t.date, 'yyyy-MM-dd'),
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.type,
        t.amount.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finances_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Finances</h2>
          <p className="text-sm text-slate-400 mt-1">Track your income and expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors shadow-inner"
          >
            Export CSV
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-white rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.15)] p-6 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-indigo-200">Total Balance</p>
            <p className="text-4xl font-bold mt-2 tracking-tight text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{formatCurrency(balance)}</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
          <p className="text-sm font-medium text-slate-400">Total Income</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2 tracking-tight drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
          <p className="text-sm font-medium text-slate-400">Total Expenses</p>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">New Transaction</h3>
          
          <div className="flex gap-4 mb-6 relative z-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type === 'income'} onChange={() => setType('income')} className="text-indigo-500 bg-black/40 border-white/20 focus:ring-indigo-500 focus:ring-offset-black" />
              <span className="text-sm font-medium text-slate-300">Income</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={type === 'expense'} onChange={() => setType('expense')} className="text-indigo-500 bg-black/40 border-white/20 focus:ring-indigo-500 focus:ring-offset-black" />
              <span className="text-sm font-medium text-slate-300">Expense</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="150.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="e.g. Software, Consulting"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project (Optional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Brief details about this transaction..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h3 className="font-semibold text-white">Transaction History</h3>
          <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                  filter === f ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                          tx.type === 'income' ? 'bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20' : 'bg-white/5 border-white/10 group-hover:bg-white/10'
                        )}>
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{tx.description || 'No description'}</p>
                          {tx.projectId && (
                            <p className="text-xs text-indigo-300/70 border border-indigo-500/20 bg-indigo-500/10 rounded px-1.5 py-0.5 mt-1 inline-block">
                              {projects.find(p => p.id === tx.projectId)?.name || 'Unknown Project'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300 transition-colors">
                      {format(tx.date, 'MMM dd, yyyy')}
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-bold text-base tracking-tight transition-colors",
                      tx.type === 'income' ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]" : "text-white"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
