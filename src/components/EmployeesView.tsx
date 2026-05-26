import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Users, Mail, CircleDollarSign, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { EmployeeRole, EmployeeStatus } from '../types';

export function EmployeesView() {
  const { employees, addEmployee, updateEmployeeStatus } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<EmployeeRole>('Developer');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !salary || !joinDate) return;
    
    addEmployee({
      name,
      email,
      role,
      status: 'active',
      salary: parseFloat(salary),
      joinDate: new Date(joinDate).getTime(),
    });
    
    setName('');
    setEmail('');
    setRole('Developer');
    setSalary('');
    setJoinDate(format(new Date(), 'yyyy-MM-dd'));
    setIsAdding(false);
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    const map = {
      'active': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      'on-leave': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      'terminated': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider", map[status])}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Employees</h2>
          <p className="text-sm text-slate-400 mt-1">Manage team members and their roles.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 flex-shrink-0 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">New Employee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as EmployeeRole)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              >
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Yearly Salary (USD)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="80000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Join Date</label>
              <input
                type="date"
                value={joinDate}
                onChange={e => setJoinDate(e.target.value)}
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
              Save Employee
            </button>
          </div>
        </form>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex-1 overflow-hidden flex flex-col">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 h-64 text-slate-400">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No employees yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm text-center">Add your team members to manage roles, salaries, and statuses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Join Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{emp.name}</div>
                      <div className="text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-2 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        {emp.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-indigo-200 font-medium">{emp.role}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4 text-indigo-400" />
                        {formatCurrency(emp.salary)} / yr
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-indigo-400" />
                        {format(emp.joinDate, 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(emp.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={emp.status}
                        onChange={(e) => updateEmployeeStatus(emp.id, e.target.value as EmployeeStatus)}
                        className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="active">Active</option>
                        <option value="on-leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                      </select>
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
