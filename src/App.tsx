import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ProjectsView } from './components/ProjectsView';
import { FinancesView } from './components/FinancesView';
import { InboxView } from './components/InboxView';
import { InvoicesView } from './components/InvoicesView';
import { EmployeesView } from './components/EmployeesView';
import { SettingsView } from './components/SettingsView';
import { AppProvider } from './context/AppContext';
import { initAuth, googleSignIn } from './lib/firebase';
import { User } from 'firebase/auth';
import { Mail, Layers } from 'lucide-react';

function MainLayout() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'inbox' && <InboxView />}
        {currentView === 'clients' && <ClientsView />}
        {currentView === 'projects' && <ProjectsView />}
        {currentView === 'finances' && <FinancesView />}
        {currentView === 'invoices' && <InvoicesView />}
        {currentView === 'employees' && <EmployeesView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] z-0 pointer-events-none"></div>
        
        <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10 text-center space-y-6 relative z-10 transition-all">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to Tambe</h1>
            <p className="text-slate-400 mt-2">Sign in to access your futuristic business tracker and analytics.</p>
          </div>
          
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button w-full flex items-center justify-center px-4 py-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 group hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center gap-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors">{isLoggingIn ? "Authenticating..." : "Continue with Google"}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
