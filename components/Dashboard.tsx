import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Импорт необходимых иконок
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  User, 
  LayoutDashboard,
  LogOut 
} from 'lucide-react';
// ВАЖНО: Импорт Profile с большой буквы, так как файл называется Profile.tsx
import Profile from './Profile';

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  // Состояние для переключения между Календарем и Профилем
  const [showProfile, setShowProfile] = useState(false);
  
  // Состояния для календаря и тренировок (из вашей предыдущей версии)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Функция загрузки данных из таблиц workouts (факт) и training_plans (план ИИ)
  const fetchData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setIsLoading(true);

    try {
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
      console.error("Ошибка при загрузке данных:", e);
    }
    setIsLoading(false);
  };

  // Загружаем данные только если профиль закрыт
  useEffect(() => { 
    if (!showProfile) fetchData(); 
  }, [currentDate, session, showProfile]);

  // Если нажата кнопка "Профиль", отображаем компонент Profile
  if (showProfile) {
    return (
      <Profile 
        session={session} 
        onBack={() => setShowProfile(false)} 
      />
    );
  }

  // Названия месяцев для заголовка
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  // Расчет сетки календаря
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 font-sans">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ (HEADER) */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <LayoutDashboard size={22} />
             </div>
             <span className="font-black italic text-2xl tracking-tighter hidden sm:block">RUN COACH</span>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {isLoading && <Activity className="animate-spin text-blue-500" size={20} />}
        </div>

        {/* КНОПКА ПЕРЕХОДА В ПРОФИЛЬ */}
        <button 
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1.5 pr-5 rounded-2xl transition-all border border-white/5 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <User size={20} />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-[10px] uppercase font-black text-blue-400 leading-none mb-1">Атлет</p>
            <p className="text-sm font-bold leading-none">Настройки</p>
          </div>
        </button>
      </div>

      {/* СЕТКА КАЛЕНДАРЯ */}
      <div className="grid grid-cols-7 gap-3 max-w-6xl mx-auto">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-slate-600 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">{d}</div>
        ))}
        
        {daysArr.map((day, idx) => (
          <div 
            key={idx} 
            className={`min-h-[110px] p-3 border border-white/5 rounded-2xl transition-all ${
              day ? 'bg-[#111111]/50 hover:border-white/20' : 'bg-transparent border-none'
            }`}
          >
            {day && <span className="text-xs font-black text-slate-700">{day}</span>}
            
            {day && workouts.filter(w => {
               const d = new Date(w.date);
               return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            }).map(w => (
              <div 
                key={w.id} 
                className={`mt-2 p-2 border rounded-xl text-[10px] font-bold leading-tight shadow-sm ${
                  w.source === 'FACT' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-blue-500/5 border-blue-500/10 text-blue-400 border-dashed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {w.source === 'PLAN' && <span className="text-[12px]" title="AI Plan">🤖</span>}
                  <span className="truncate">{w.title || w.activity}</span>
                </div>
                {w.distance && <div className="text-[8px] opacity-50 mt-1 font-black">{w.distance} КМ</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
