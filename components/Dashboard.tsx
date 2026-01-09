import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Brain,
  Calendar as CalendarIcon,
  Timer,
  MapPin,
  Trophy
} from 'lucide-react';
import Profile from './Profile'; 
import Sidebar from './Sidebar';
import WorkoutDetail from './WorkoutDetail'; 

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
        ...(factRes.data || []).map((f: any) => ({ ...f, source: 'FACT', date: f.activity_date })),
        ...(planRes.data || []).map((p: any) => ({ ...p, source: 'PLAN', date: p.scheduled_date.split('T')[0] }))
      ];
      
      setWorkouts(combined);
      if (profileRes.data) setUserProfile(profileRes.data);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, [currentDate, session, activeTab]);

  const stats = workouts
    .filter(w => w.source === 'FACT')
    .filter(w => {
      const d = new Date(w.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    })
    .reduce((acc, curr) => ({
      dist: acc.dist + (curr.distance_km || 0),
      time: acc.time + (curr.duration_minutes || 0),
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
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <CalendarIcon size={12}/> Твой тренировочный прогресс
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black uppercase px-4 py-2 hover:text-blue-400 transition-colors">Сегодня</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5 shadow-xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500"><MapPin size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Дистанция</p>
              <p className="text-2xl font-black italic uppercase">{stats.dist.toFixed(1)} <span className="text-xs text-slate-600">км</span></p>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5 shadow-xl">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500"><Timer size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Время</p>
              <p className="text-2xl font-black italic uppercase">{Math.floor(stats.time / 60)}ч {stats.time % 60}м</p>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5 shadow-xl">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500"><Trophy size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Активность</p>
              <p className="text-2xl font-black italic uppercase">{stats.count} <span className="text-xs text-slate-600">забегов</span></p>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-4 shadow-2xl">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
              <div key={d} className="text-center text-slate-600 text-[10px] font-black py-4 uppercase tracking-tighter opacity-50">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysArr.map((day, idx) => {
              const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const isToday = dateStr === todayStr;

              return (
                <div 
                  key={idx} 
                  onClick={() => dateStr && setSelectedDate(dateStr)}
                  className={`min-h-[140px] p-3 border rounded-[1.5rem] transition-all relative group cursor-pointer
                    ${day ? 'bg-[#111]/50 border-white/[0.03] hover:bg-[#161618] hover:border-blue-500/30' : 'bg-transparent border-none pointer-events-none'}
                    ${isToday ? 'ring-1 ring-blue-500/50 bg-blue-500/[0.03]' : ''}
                  `}
                >
                  {day && (
                    <span className={`text-[11px] font-black ${isToday ? 'text-blue-500' : 'text-slate-700'} group-hover:text-slate-400 transition-colors`}>
                      {day}
                    </span>
                  )}
                  
                  <div className="mt-2 space-y-2">
                    {day && workouts.filter(w => w.date === dateStr).map((w, i) => (
                      <div 
                        key={`${w.id}-${i}`} 
                        className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5
                          ${w.source === 'FACT' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-900/10' 
                            : 'bg-blue-600/10 border-blue-600/20 text-blue-400 border-dashed'}
                        `}
                      >
                        {/* Тип тренировки */}
                        <div className="flex items-center gap-1.5">
                          {w.source === 'PLAN' ? <span className="text-xs">🤖</span> : <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>}
                          <span className="truncate uppercase tracking-tighter text-[10px] font-extrabold">{w.title || w.activity}</span>
                        </div>

                        {/* Дистанция и Темп */}
                        <div className="flex justify-between items-baseline">
                          <div className="text-[13px] font-black italic">
                            {w.distance_km || w.distance || '0'} <span className="text-[8px] opacity-60 not-italic">КМ</span>
                          </div>
                          {(w.pace || w.target_pace) && (
                            <div className="text-[10px] font-bold opacity-80">{w.pace || w.target_pace}</div>
                          )}
                        </div>

                        {/* Описание (несколько строк) */}
                        {(w.description || w.notes) && (
                          <div className="text-[9px] font-medium leading-snug opacity-60 line-clamp-2 border-t border-white/5 pt-1 mt-0.5">
                            {w.description || w.notes}
                          </div>
                        )}
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
    if (selectedDate) {
      return <WorkoutDetail date={selectedDate} session={session} onBack={() => setSelectedDate(null)} />;
    }

    switch (activeTab) {
      case 'profile': return <Profile session={session} onBack={() => setActiveTab('dashboard')} />;
      case 'dashboard': return renderCalendar();
      case 'coach':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
             <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
                <Brain size={40} />
             </div>
             <h2 className="text-3xl font-black italic uppercase mb-2">AI Тренер</h2>
             <p className="text-slate-400 max-w-md font-medium text-sm">Ваш персональный интеллект анализирует выполненные тренировки и адаптирует план.</p>
          </div>
        );
      default: return <div className="p-8">В разработке...</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedDate(null); }} 
        userProfile={userProfile} 
      />
      <main className="flex-1 overflow-y-auto relative">
        {isLoading && <div className="absolute top-8 right-8"><Activity className="animate-spin text-blue-500" size={20} /></div>}
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
