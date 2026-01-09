import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Activity, Brain } from 'lucide-react';
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

  const renderCalendar = () => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

    return (
      <div className="p-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic uppercase">Тренировочный план</h2>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/10 rounded-md"><ChevronLeft size={18} /></button>
            <h2 className="text-xs font-black uppercase tracking-widest min-w-[120px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/10 rounded-md"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d} className="text-center text-slate-700 text-[10px] font-black mb-2 uppercase">{d}</div>
          ))}
          {daysArr.map((day, idx) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            return (
              <div 
                key={idx} 
                onClick={() => dateStr && setSelectedDate(dateStr)}
                className={`min-h-[110px] p-2 border border-white/5 rounded-xl transition-all cursor-pointer ${day ? 'bg-[#0a0a0a] hover:border-blue-500/30' : 'bg-transparent border-none'}`}
              >
                {day && <span className="text-[10px] font-bold text-slate-600">{day}</span>}
                {day && workouts.filter(w => w.date === dateStr).map(w => (
                  <div key={w.id} className={`mt-1.5 p-1.5 border rounded-lg text-[9px] font-bold leading-tight ${w.source === 'FACT' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/5 border-blue-500/10 text-blue-400 border-dashed'}`}>
                    <div className="flex items-center gap-1 truncate">
                      {w.source === 'PLAN' && <span>🤖</span>}
                      <span>{w.title || w.activity}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    // Если выбрана дата, показываем WorkoutDetail ПОВЕРХ всего остального в контентной зоне
    if (selectedDate) {
      return <WorkoutDetail date={selectedDate} session={session} onBack={() => setSelectedDate(null)} />;
    }

    switch (activeTab) {
      case 'profile': return <Profile session={session} onBack={() => setActiveTab('dashboard')} />;
      case 'dashboard': return renderCalendar();
      case 'coach':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
             <Brain size={40} className="text-blue-500 mb-4" />
             <h2 className="text-3xl font-black italic uppercase">AI Тренер</h2>
             <p className="text-slate-400 max-w-md mt-2">Анализ текущей формы и построение плана...</p>
          </div>
        );
      default: return <div className="p-8">Раздел в разработке...</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-sans">
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
