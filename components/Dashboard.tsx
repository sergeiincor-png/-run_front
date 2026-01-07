import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Activity, CheckCircle2, Zap } from 'lucide-react';
import { generateInitialPlan } from './aiCoach';

interface Entry {
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  distance?: string;
  source: 'FACT' | 'PLAN'; 
  is_completed?: boolean;
}

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<Entry[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    
    try {
      const userId = session.user.id;

      // 1. Загружаем ФАКТЫ (из таблицы workouts - твой ТГ бот)
      const { data: workoutsData } = await supabase.from('workouts').select('*').eq('user_id', userId);
      
      // 2. Загружаем ПЛАНЫ (из таблицы training_plans - ИИ)
      const { data: plansData } = await supabase.from('training_plans').select('*').eq('user_id', userId);

      // Форматируем ФАКТЫ (ТГ)
      const facts: Entry[] = (workoutsData || []).map((item: any) => {
        if (!item.activity_date) return null;
        const parts = item.activity_date.split('-');
        return {
          id: `fact-${item.id}`,
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1,
          year: parseInt(parts[0]),
          title: item.title || 'Пробежка',
          distance: item.distance_km?.toString(),
          source: 'FACT'
        };
      }).filter(Boolean) as Entry[];

      // Форматируем ПЛАНЫ (ИИ)
      const plans: Entry[] = (plansData || []).map((item: any) => {
        if (!item.scheduled_date) return null;
        const datePart = item.scheduled_date.split('T')[0];
        const parts = datePart.split('-');
        return {
          id: `plan-${item.id}`,
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1,
          year: parseInt(parts[0]),
          title: item.activity || 'План',
          distance: item.distance,
          source: 'PLAN',
          is_completed: item.is_completed
        };
      }).filter(Boolean) as Entry[];

      setItems([...facts, ...plans]);
    } catch (err) {
      console.error("Ошибка при сборке данных календаря:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, session]);

  // Логика календаря
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronRight /></button>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Пробег (Факт)</p>
          <p className="text-3xl font-black">
            {items.filter(i => i.source === 'FACT' && i.month === currentDate.getMonth()).reduce((acc, i) => acc + parseFloat(i.distance || '0'), 0).toFixed(1)}
            <span className="text-sm ml-1">км</span>
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-slate-600 text-xs font-bold mb-2 uppercase tracking-tighter">{d}</div>
        ))}
        
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[120px] p-2 border border-white/5 rounded-xl transition-all ${day ? 'bg-white/5' : 'bg-transparent border-none'}`}>
            {day && (
              <>
                <span className="text-xs font-bold text-slate-500">{day}</span>
                <div className="mt-2 space-y-1.5">
                  {items.filter(i => i.day === day && i.month === currentDate.getMonth() && i.year === currentDate.getFullYear()).map(item => (
                    <div 
                      key={item.id}
                      className={`p-1.5 rounded-lg text-[10px] font-bold leading-tight border ${
                        item.source === 'FACT' 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-300 border-dashed opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {item.source === 'FACT' ? <CheckCircle2 size={10}/> : <Zap size={10} className="text-blue-400"/>}
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.distance && <div className="mt-0.5 opacity-70">{item.distance}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Бот / Факт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/10 border border-blue-500/30 border-dashed rounded" />
            <span className="text-[10px] uppercase font-bold text-slate-400">AI План</span>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
