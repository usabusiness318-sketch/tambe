import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Plus, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { InvoiceStatus } from '../types';
import jsPDF from 'jspdf';

export function InvoicesView() {
  const { clients, projects, invoices, addInvoice, updateInvoiceStatus } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !amount || !dueDate) return;
    
    addInvoice({
      clientId,
      projectId: projectId || undefined,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate).getTime(),
      issueDate: Date.now(),
      status: 'draft',
    });
    
    setClientId('');
    setProjectId('');
    setAmount('');
    setDueDate('');
    setIsAdding(false);
  };

  const generatePDF = (invoice: any) => {
    const client = clients.find(c => c.id === invoice.clientId);
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("INVOICE", 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.id.slice(0, 8).toUpperCase()}`, 20, 45);
    doc.text(`Issue Date: ${format(invoice.issueDate, 'MMM dd, yyyy')}`, 20, 52);
    doc.text(`Due Date: ${format(invoice.dueDate, 'MMM dd, yyyy')}`, 20, 59);

    doc.text("Billed To:", 20, 80);
    doc.setFontSize(14);
    doc.text(client?.name || 'Unknown', 20, 88);
    doc.setFontSize(12);
    if (client?.company) doc.text(client.company, 20, 95);
    doc.text(client?.email || '', 20, 102);

    doc.text("Description", 20, 130);
    doc.text("Amount", 170, 130);
    doc.line(20, 135, 190, 135);
    
    const proj = projects.find(p => p.id === invoice.projectId);
    doc.text(`Project Services - ${proj?.name || 'General Consulting'}`, 20, 145);
    doc.text(formatCurrency(invoice.amount), 170, 145);
    
    doc.line(20, 155, 190, 155);
    doc.setFontSize(14);
    doc.text("Total:", 140, 165);
    doc.text(formatCurrency(invoice.amount), 170, 165);

    doc.save(`Invoice_${invoice.id.slice(0, 8)}.pdf`);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles = {
      'draft': 'bg-slate-800 text-slate-300 border border-slate-700',
      'sent': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'paid': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      'overdue': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider", styles[status])}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Invoices</h2>
          <p className="text-sm text-slate-400 mt-1">Generate and manage client invoices.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={clients.length === 0}
          className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 disabled:opacity-50 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">New Invoice</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              >
                <option value="" disabled>Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project (Optional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">None</option>
                {projects.filter(p => !clientId || p.clientId === clientId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="1000.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
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
              Save Invoice
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No invoices yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">Create an invoice to request payments from tools and clients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map(invoice => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  return (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white">{client?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-white font-medium">{formatCurrency(invoice.amount)}</td>
                      <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">{format(invoice.dueDate, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <select 
                            value={invoice.status}
                            onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                            className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>
                          <button
                            onClick={() => generatePDF(invoice)}
                            className="text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Download PDF"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
