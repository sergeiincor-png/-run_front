import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronLeft, ChevronRight, Activity, Brain, 
  Calendar as CalendarIcon, Timer, MapPin, Trophy, Sparkles
} from 'lucide-react';
// 👇 Импортируем функцию генерации
import { generateInitialPlan } from './aiCoach';
import Profile from './Profile'; 
import Sidebar from './Sidebar';
import WorkoutDetail from './WorkoutDetail'; 

const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 👇 Состояние для анимации кнопки обновления
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setIsLoading(true);
    try {
      const [factRes, planRes, profileRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('training_plans').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);

      const combined = [
        ...(factRes.data || []).map((f: any) => ({ 
          ...f, 
          source: 'FACT', 
          date: f.activity_date ? f.activity_date.split('T')[0] : null 
        })),
        ...(planRes.data || []).map((p: any) => ({ 
          ...p, 
          source: 'PLAN', 
          date: p.scheduled_date ? p.scheduled_date.split('T')[0] : null 
        }))
      ];
      
      setWorkouts(combined);
      if (profileRes.data) setUserProfile(profileRes.data);
    } catch (e) { console.error("Data Load Error:", e); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate, session, activeTab]);

  // 👇 Функция для кнопки "Обновить план"
  const handleRefreshPlan = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    if (!window.confirm("Создать новый план на неделю? Текущий план будет заменен.")) return;

    setIsGenerating(true);
    const result = await generateInitialPlan(userId);
    if (result.success) {
      await fetchData(); // Перезагружаем данные в календаре
    }
    setIsGenerating(false);
  };

  const renderCalendar = () => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase">
              {monthNames[currentDate.getMonth()]} <span className="text-blue-600">{currentDate.getFullYear()}</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Твой тренировочный прогресс</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* 👇 НОВАЯ КНОПКА ОБНОВЛЕНИЯ ПЛАНА */}
            <button 
              onClick={handleRefreshPlan}
              disabled={isGenerating || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
            >
              {isGenerating ? <Activity className="animate-spin" size={14}/> : <Sparkles size={14} className="fill-current"/>}
              {isGenerating ? 'Генерация...' : 'Обновить план'}
            </button>

            <div className="flex gap-2 ml-auto">
               <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"><ChevronLeft size={20}/></button>
               <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-600 text-[10px] font-black py-4 uppercase tracking-widest opacity-40">{d}</div>)}
          {daysArr.map((day, idx) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            const isToday = dateStr === todayStr;
            return (
              <div key={idx} onClick={() => dateStr && setSelectedDate(dateStr)} className={`min-h-[160px] p-3 border rounded-[2rem] transition-all relative cursor-pointer flex flex-col ${day ? 'bg-[#111]/50 border-white/[0.03] hover:border-blue-500/40 hover:bg-[#161618]' : 'bg-transparent border-none pointer-events-none'} ${isToday ? 'ring-2 ring-blue-500/30 bg-blue-500/[0.02]' : ''}`}>
                {day && <span className={`text-[11px] font-black mb-3 ${isToday ? 'text-blue-500' : 'text-slate-700'}`}>{day}</span>}
                <div className="space-y-2">
                  {day && workouts.filter(w => w.date === dateStr).map((w, i) => (
                    <div key={i} className={`p-3 rounded-2xl border flex flex-col gap-1.5 transition-transform hover:scale-[1.02] ${w.source === 'FACT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 border-blue-600/20 text-blue-400 border-dashed'}`}>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {w.source === 'PLAN' ? <Sparkles size={10} className="text-blue-400 fill-current"/> : <Activity size={10} className="text-emerald-400"/>}
                        <span className="truncate uppercase text-[9px] font-black tracking-tight">{w.activity || w.title}</span>
                      </div>
                      <div className="flex justify-between items-end font-black italic">
                        <div className="text-[14px] leading-none">{w.target_distance_km || w.distance_km || '—'}<span className="text-[8px] ml-0.5 opacity-60">КМ</span></div>
                        <div className="text-[10px] opacity-40 leading-none">{w.duration || w.duration_minutes}<span className="text-[7px] ml-0.5"></span></div>
                      </div>
                      {w.description && <div className="text-[9px] opacity-50 line-clamp-2 leading-relaxed font-medium">{w.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (selectedDate) return <WorkoutDetail date={selectedDate} session={session} onBack={() => setSelectedDate(null)} />;
    switch (activeTab) {
      case 'profile': return <Profile session={session} onBack={() => setActiveTab('dashboard')} />;
      case 'dashboard': return renderCalendar();
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} />
      <main className="flex-1 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
