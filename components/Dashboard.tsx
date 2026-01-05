
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  Search 
} from 'lucide-react';
import CalendarView from './CalendarView';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('calendar');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'calendar', icon: <CalendarIcon size={24} />, label: 'Календарь' },
    { id: 'analytics', icon: <BarChart3 size={24} />, label: 'Аналитика' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Настройки' },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-24 border-r border-white/5 flex flex-col items-center py-10 gap-10 bg-black/20 backdrop-blur-xl z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold italic text-white shadow-lg shadow-blue-600/20">RC</div>
        
        <nav className="flex-grow flex flex-col gap-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[70]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-zinc-950/30">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">Dashboard</h1>
            <div className="h-6 w-px bg-white/10" />
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-6 text-sm outline-none focus:border-white/10 w-64" placeholder="Поиск тренировок..." />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#09090b]" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Уровень: Базовый</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <main className="flex-grow overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'analytics' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
               <BarChart3 size={64} />
               <p className="font-bold uppercase tracking-widest text-sm">Модуль аналитики будет доступен в MVP 2.0</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto glass-card p-10 rounded-[3rem] border-white/5">
               <h2 className="text-2xl font-bold mb-10 text-white">Настройки профиля</h2>
               <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                     <div>
                        <p className="text-sm font-bold text-white">Интеграция Garmin</p>
                        <p className="text-xs text-slate-500">Автосинхронизация тренировок</p>
                     </div>
                     <button className="text-blue-500 text-xs font-bold uppercase tracking-widest">Подключить</button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                     <div>
                        <p className="text-sm font-bold text-white">Уведомления AI</p>
                        <p className="text-xs text-slate-500">Отправлять отчеты в Telegram</p>
                     </div>
                     <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                     </div>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
