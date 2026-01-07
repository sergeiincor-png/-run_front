import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Activity, Calendar, Clock, MapPin, CheckCircle, 
  Circle, MessageSquare, LogOut, TrendingUp, ChevronRight 
} from 'lucide-react';

interface DashboardProps {
  session: any;
}

// Единый интерфейс для отображения в ленте
interface ActivityEntry {
  id: string;
  source: 'AI_PLAN' | 'TG_FACT';
  date: string;
  title: string;
  distance: string;
  duration: string;
  description: string;
  is_completed: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalKm: 0, count: 0 });

  const loadData = async () => {
    setLoading(true);
    const userId = session.user.id;

    // 1. Загружаем ПЛАНЫ от ИИ
    const { data: plans } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId);

    // 2. Загружаем РЕАЛЬНЫЕ тренировки (TG / Ручные)
    const { data: facts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId);

    // 3. Форматируем всё в один массив
    const formattedPlans: ActivityEntry[] = (plans || []).map(p => ({
      id: p.id,
      source: 'AI_PLAN',
      date: p.scheduled_date,
      title: p.activity,
      distance: p.distance,
      duration: p.duration,
      description: p.description,
      is_completed: p.is_completed
    }));

    const formattedFacts: ActivityEntry[] = (facts || []).map(f => ({
      id: f.id,
      source: 'TG_FACT',
      date: f.activity_date,
      title: f.title || 'Тренировка из TG',
      distance: f.distance_km ? `${f.distance_km} км` : '',
      duration: f.duration_minutes ? `${f.duration_minutes} мин` : '',
      description: 'Данные синхронизированы из Telegram',
      is_completed: true // Реальный факт всегда выполнен
    }));

    // Смешиваем и сортируем (новые вверху)
    const combined = [...formattedPlans, ...formattedFacts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Считаем статистику по фактам
    const totalKm = (facts || []).reduce((acc, f) => acc + (f.distance_km || 0), 0);
    setStats({ totalKm, count: facts?.length || 0 });

    setActivities(combined);
    setLoading(false);
  };

  // Переключение статуса выполнения для плана
  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, is_completed: !currentStatus } : a));
    
    await supabase
      .from('training_plans')
      .update({ is_completed: !currentStatus })
      .eq('id', id);
  };

  useEffect(() => {
    loadData();
  }, [session]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-20">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter">МОЙ ПЛАН</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        
        {/* --- STATS CARD --- */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-2xl shadow-blue-900/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded-full uppercase">Общая активность</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter">{stats.totalKm.toFixed(1)} <span className="text-lg opacity-60">км</span></h2>
            <p className="text-blue-100/60 text-xs font-medium uppercase tracking-widest">Всего за месяц</p>
          </div>
        </section>

        {/* --- ACTIVITY FEED --- */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Лента активностей</h2>
          
          {loading ? (
            <div className="flex flex-col items-center py-20 opacity-30 animate-pulse">
              <Activity size={40} className="animate-spin mb-4" />
              <p className="text-xs font-bold uppercase">Синхронизация...</p>
            </div>
          ) : (
            activities.map((item) => (
              <div 
                key={`${item.source}-${item.id}`}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  item.source === 'TG_FACT' 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : item.is_completed 
                    ? 'bg-blue-500/10 border-blue-500/30 opacity-70' 
                    : 'bg-white/[0.03] border-white/5'
                }`}
              >
                {/* Badge */}
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-tighter">
                  {item.source === 'TG_FACT' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><MessageSquare size={10}/> TG FACT</span>
                  ) : (
                    <span className="text-blue-400 flex items-center gap-1"><Activity size={10}/> AI PLAN</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-3">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold mb-1 ${item.source === 'TG_FACT' ? 'text-emerald-50' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    {item.distance && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-xs font-black">{item.distance}</span>
                      </div>
                    )}
                    {item.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-500" />
                        <span className="text-xs font-black">{item.duration}</span>
                      </div>
                    )}

                    {/* Checkbox (только для планов) */}
                    {item.source === 'AI_PLAN' && (
                      <button 
                        onClick={() => togglePlanStatus(item.id, item.is_completed)}
                        className="ml-auto transition-transform active:scale-90"
                      >
                        {item.is_completed ? (
                          <CheckCircle className="text-emerald-500" size={24} />
                        ) : (
                          <Circle className="text-white/10" size={24} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Floating Plus Button (на будущее - ручное добавление) */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
          <Activity size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
