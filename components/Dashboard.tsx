import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ChevronLeft, ChevronRight, Activity, Brain, 
  Calendar as CalendarIcon, Timer, MapPin, Trophy 
} from 'lucide-react';
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

  const stats = workouts
    .filter(w => w.source === 'FACT')
    .filter(w => w.date && new Date(w.date).getMonth() === currentDate.getMonth())
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
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black italic uppercase">{monthNames[currentDate.getMonth()]} <span className="text-blue-600">{currentDate.getFullYear()}</span></h2>
          <div className="flex gap-2">
             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronLeft/></button>
             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronRight/></button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-600 text-[10px] font-black py-4 uppercase">{d}</div>)}
          {daysArr.map((day, idx) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            return (
              <div key={idx} onClick={() => dateStr && setSelectedDate(dateStr)} className={`min-h-[160px] p-3 border rounded-[1.8rem] transition-all relative cursor-pointer flex flex-col ${day ? 'bg-[#111]/50 border-white/[0.03] hover:border-blue-500/30' : 'bg-transparent border-none'}`}>
                {day && <span className="text-[11px] font-black mb-2 text-slate-700">{day}</span>}
                <div className="space-y-2">
                  {day && workouts.filter(w => w.date === dateStr).map((w, i) => (
                    <div key={i} className={`p-3 rounded-2xl border flex flex-col gap-1 ${w.source === 'FACT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 border-blue-600/20 text-blue-400 border-dashed'}`}>
                      <div className="flex items-center gap-1.5">
                        {w.source === 'PLAN' ? <span>🤖</span> : <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>}
                        <span className="truncate uppercase text-[9px] font-black">{w.activity || w.title || w.activity_type}</span>
                      </div>
                      <div className="flex justify-between items-end font-black italic">
                        <div className="text-[14px]">{w.target_distance_km || w.distance_km || '—'}<span className="text-[8px] ml-0.5">КМ</span></div>
                        <div className="text-[9px] opacity-40">{w.duration}<span className="text-[7px] ml-0.5"></span></div>
                      </div>
                      {w.description && <div className="text-[9px] opacity-60 line-clamp-2">{w.description}</div>}
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

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' ? renderCalendar() : <Profile session={session} onBack={() => setActiveTab('dashboard')} />}
      </main>
    </div>
  );
};

export default Dashboard;
