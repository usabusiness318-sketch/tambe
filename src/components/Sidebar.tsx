import React from 'react';
import { cn } from '../lib/utils';
import { LayoutDashboard, Users, FolderKanban, Wallet, Mail, Settings as SettingsIcon, FileText, UserCircle2, Layers } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'finances', label: 'Finances', icon: Wallet },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'employees', label: 'Employees', icon: UserCircle2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-full z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          Tambe
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden",
                isActive 
                  ? "text-white bg-white/10 border border-white/5 shadow-[inset_0_1px_rgba(255,255,255,0.1)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-colors duration-300 relative z-10", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 bg-black/20">
        <button 
          onClick={() => onChangeView('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border group",
            currentView === 'settings' 
              ? "bg-white/10 text-white shadow-[inset_0_1px_rgba(255,255,255,0.1)] border-white/5" 
              : "border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
          )}
        >
          <SettingsIcon className={cn("w-5 h-5 transition-colors duration-300", currentView === 'settings' ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
          Preferences
        </button>
      </div>
    </aside>
  );
}
