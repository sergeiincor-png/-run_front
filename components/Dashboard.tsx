import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface Workout {
  id: string;
  day: number;
  month: number;
  year: number;
  type: string;
  title: string;
  distance?: string;
  source: 'FACT' | 'PLAN'; 
}

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchData = async () => {
    if (!userId) return;
    setIsLoading(true);
    
    try {
      // 1. Грузим всё из базы одновременно
      const [factRes, planRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('training_plans').select('*').eq('user_id', userId)
      ]);

      // 2. Форматируем ТГ-бота (Зеленые)
      const formattedFacts: Workout[] = (factRes.data || []).map((item: any) => {
        const parts = item.activity_date.split('-');
        return {
          id: `f-${item.id}`,
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1,
          year: parseInt(parts[0]),
          type: item.activity_type || 'Бег',
          title: item.title || 'Тренировка',
          distance: item.distance_km ? item.distance_km.toString() : '0',
          source: 'FACT'
        };
      });

      // 3. Форматируем ИИ-план (Синие)
      const formattedPlans: Workout[] = (planRes.data || []).map((item: any) => {
        const datePart = item.scheduled_date.split('T')[0];
        const parts = datePart.split('-');
        return {
          id: `p-${item.id}`,
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1,
          year: parseInt(parts[0]),
          type: 'План',
          title: item.activity || 'План ИИ',
          distance: item.distance || '0',
          source: 'PLAN'
        };
      });

      setWorkouts([...formattedFacts, ...formattedPlans]);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, userId]);

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const daysArr = [];
  for (let i = 0; i < startOffset; i++) daysArr.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArr.push(i);

  const totalDist = workouts
    .filter(w => w.source === 'FACT' && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear())
    .reduce((acc, w) => acc + parseFloat(w.distance || '0'), 0);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      {/* Шапка один-в-один как была */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronRight /></button>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold">КМ ЗА МЕСЯЦ (ФАКТ)</p>
          <p className="text-3xl font-black">{totalDist.toFixed(1)} <span className="text-sm">км</span></p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-600 text-xs font-bold mb-2">{d}</div>)}
        {daysArr.map((day, idx) => (
          <div 
            key={idx} 
            className={`min-h-[100px] p-2 border border-white/5 rounded-xl transition-all ${day ? 'bg-white/5 cursor-pointer hover:border-white/20' : 'bg-transparent border-none'}`}
          >
            {day && <span className="text-xs font-bold text-slate-500">{day}</span>}
            {day && workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear()).map(w => (
              <div 
                key={w.id} 
                className={`mt-1 p-1 border rounded text-[10px] font-bold truncate ${
                  w.source === 'FACT' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400 border-dashed opacity-80'
                }`}
              >
                {w.source === 'PLAN' ? '🤖 ' : ''}{w.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-between items-center px-2 opacity-50">
        <div className="flex gap-4">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-sm"></div> Бот
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-500">
                <div className="w-2 h-2 bg-blue-500 border border-dashed rounded-sm"></div> План ИИ
            </div>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold uppercase hover:text-red-500 transition-colors">Выйти</button>
      </div>
    </div>
  );
};

export default Dashboard;
