import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Brain, 
  User,
  LogOut
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userProfile }) => {
  const items = [
    { id: 'dashboard', label: 'Календарь', icon: <LayoutDashboard size={20} /> },
    { id: 'workouts', label: 'Тренировки', icon: <Activity size={20} /> },
    { id: 'coach', label: 'AI Тренер', icon: <Brain size={20} /> },
    { id: 'profile', label: 'Профиль', icon: <User size={20} /> },
  ];

  return (
    <aside className="w-64 border-r border-white/5 hidden md:flex flex-col bg-[#09090b] p-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl italic shadow-lg shadow-blue-500/20 text-white">
          RC
        </div>
        <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Run Coach</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Mini-Profile & Logout */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Ava" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-blue-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase truncate text-white">
              {userProfile?.first_name || 'Атлет'}
            </p>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Premium Plan</p>
          </div>
        </div>
        
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold uppercase text-[10px] tracking-widest"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
