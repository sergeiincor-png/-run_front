import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronLeft, ChevronRight, Activity, Brain, 
  Calendar as CalendarIcon, Timer, MapPin, Trophy 
} from 'lucide-react';
import Profile from './Profile'; 
import Sidebar from './Sidebar';
import WorkoutDetail from './WorkoutDetail'; 

// Инициализация
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

      // Синхронизация полей для отображения
      const factData = (factRes.data || []).map((f: any) => ({ 
        ...f, 
        source: 'FACT', 
        date: f.activity_date ? f.activity_date.split('T')[0] : null 
      }));

      const planData = (planRes.data || []).map((p: any) => ({ 
        ...p, 
        source: 'PLAN', 
        date: p.scheduled_date ? p.scheduled_date.split('T')[0] : null 
      }));
      
      setWorkouts([...factData, ...planData]);
      if (profileRes.data) setUserProfile(profileRes.data);
    } catch (e) { console.error("Load Error:", e); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate, session, activeTab]);

  // Расчет статистики только по ФАКТИЧЕСКИМ тренировкам
  const stats = workouts
    .filter(w => w.source === 'FACT')
    .filter(w => {
      if (!w.date) return false;
      const d = new Date(w.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    })
    .reduce((acc, curr) => ({
      dist: acc.dist + (Number(curr.distance_km) || 0),
      time: acc.time + (Number(curr.duration_minutes) || 0),
      count: acc.count + 1
    }), { dist: 0, time: 0, count: 0 });

  const renderCalendar = () => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              {monthNames[currentDate.getMonth()]} <span className="text-blue-600">{currentDate.getFullYear()}</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Твой тренировочный прогресс</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-xl"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase px-4">Сегодня</button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-xl"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500"><MapPin size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Дистанция</p>
              <p className="text-2xl font-black italic">{stats.dist.toFixed(1)} км</p>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500"><Timer size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Время</p>
              <p className="text-2xl font-black italic">{Math.floor(stats.time / 60)}ч {stats.time % 60}м</p>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500"><Trophy size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Забеги</p>
              <p className="text-2xl font-black italic">{stats.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-4 shadow-2xl overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[1000px]">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-600 text-[10px] font-black py-4 uppercase">{d}</div>)}
            {daysArr.map((day, idx) => {
              const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const isToday = dateStr === todayStr;
              return (
                <div key={idx} onClick={() => dateStr && setSelectedDate(dateStr)} className={`min-h-[160px] p-3 border rounded-[1.8rem] transition-all relative cursor-pointer flex flex-col ${day ? 'bg-[#111]/50 border-white/[0.03] hover:border-blue-500/30' : 'bg-transparent border-none'} ${isToday ? 'ring-1 ring-blue-500/50' : ''}`}>
                  {day && <span className={`text-[11px] font-black mb-2 ${isToday ? 'text-blue-500' : 'text-slate-700'}`}>{day}</span>}
                  <div className="space-y-2">
                    {day && workouts.filter(w => w.date === dateStr).map((w, i) => (
                      <div key={i} className={`p-3 rounded-2xl border flex flex-col gap-1 ${w.source === 'FACT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 border-blue-600/20 text-blue-400 border-dashed'}`}>
                        <div className="flex items-center gap-1.5">
                          {w.source === 'PLAN' ? <span>🤖</span> : <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>}
                          <span className="truncate uppercase text-[9px] font-black">{w.title || w.activity_type}</span>
                        </div>
                        <div className="flex justify-between items-end font-black italic">
                          <div className="text-[14px]">{w.distance_km || '—'}<span className="text-[8px] ml-0.5">КМ</span></div>
                          <div className="text-[9px] opacity-40">{w.duration_minutes}<span className="text-[7px] ml-0.5">МИН</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
    <div className="flex min-h-screen bg-[#09090b] text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} />
      <main className="flex-1 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
