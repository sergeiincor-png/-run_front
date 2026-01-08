import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  User, 
  LayoutDashboard 
} from 'lucide-react';
// Импортируем Profile с большой буквы 'P'
import Profile from './Profile'; 

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  // Состояние переключения: показать календарь или профиль
  const [showProfile, setShowProfile] = useState(false);
  
  // Состояния для календаря и ИИ-тренировок
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setIsLoading(true);

    try {
      // Загружаем одновременно реальные тренировки (fact) и планы ИИ (plan)
      const [factRes, planRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('training_plans').select('*').eq('user_id', userId)
      ]);

      const combined = [
        ...(factRes.data || []).map((f: any) => ({ ...f, source: 'FACT', date: f.activity_date })),
        ...(planRes.data || []).map((p: any) => ({ ...p, source: 'PLAN', date: p.scheduled_date.split('T')[0] }))
      ];
      setWorkouts(combined);
    } catch (e) {
      console.error("Ошибка загрузки данных:", e);
    }
    setIsLoading(false);
  };

  // Загружаем данные только если мы не в режиме просмотра профиля
  useEffect(() => { 
    if (!showProfile) {
      fetchData(); 
    }
  }, [currentDate, session, showProfile]);

  // 1. Если включен режим профиля — показываем компонент Profile
  if (showProfile) {
    return <Profile session={session} onBack={() => setShowProfile(false)} />;
  }

  // 2. Логика календаря
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      
      {/* ШАПКА */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard size={18} />
             </div>
             <span className="font-black italic text-xl tracking-tighter">RUN COACH</span>
          </div>
          
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
          >
            <ChevronLeft />
          </button>
          
          <h2 className="text-xl font-bold italic uppercase min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
          >
            <ChevronRight />
          </button>
          
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>

        {/* КНОПКА ПРОФИЛЯ */}
        <button 
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 transition-all"
        >
          <User size={18} className="text-blue-400" />
          <span className="text-xs font-black uppercase tracking-widest hidden md:block">Профиль</span>
        </button>
      </div>

      {/* КАЛЕНДАРЬ */}
      <div className="grid grid-cols-7 gap-2 max-w-6xl mx-auto">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-slate-700 text-[10px] font-black mb-2 uppercase tracking-widest">{d}</div>
        ))}
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[120px] p-2 border border-white/5 rounded-xl transition-colors ${day ? 'bg-[#0a0a0a] hover:border-white/20' : 'bg-transparent border-none'}`}>
            {day && <span className="text-xs font-bold text-slate-600 mb-2 block">{day}</span>}
            {day && workouts.filter(w => {
               const d = new Date(w.date);
               return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            }).map(w => (
              <div 
                key={w.id} 
                className={`mt-1 p-2 border rounded-lg text-[10px] font-bold leading-tight ${
                  w.source === 'FACT' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-blue-500/5 border-blue-500/10 text-blue-400 border-dashed'
                }`}
              >
                <div className="flex items-center gap-1">
                  {w.source === 'PLAN' && <span title="AI Plan">🤖</span>}
                  <span className="truncate">{w.title || w.activity}</span>
                </div>
                {w.distance && <div className="text-[8px] opacity-60 mt-0.5">{w.distance} км</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
