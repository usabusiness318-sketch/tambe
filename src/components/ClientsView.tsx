import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Building2, Mail, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function ClientsView() {
  const { clients, addClient } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    addClient({ name, email, company });
    setName('');
    setEmail('');
    setCompany('');
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Clients</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your business contacts and organizations.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">New Client Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Acme Corp"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400"
            >
              Save Client
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No clients yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">Add your first client to start tracking projects and invoices against their account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Added On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-400/70" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400/70" />
                        {client.company || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(client.createdAt, 'MMM dd, yyyy')}
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
