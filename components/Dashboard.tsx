import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeft, ChevronRight, Activity, Trash2, CheckCircle2, BrainCircle } from 'lucide-react';
import { generateInitialPlan } from './aiCoach';

interface Entry {
  id: string;
  day: number;
  month: number;
  year: number;
  type: string;
  title: string;
  distance?: string;
  source: 'FACT' | 'PLAN'; // Отличаем ТГ от ИИ
  is_completed?: boolean;
}

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<Entry[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Entry> | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const userId = session.user.id;

    // 1. Грузим ФАКТЫ (из ТГ бота - таблица workouts)
    const { data: workoutsData } = await supabase.from('workouts').select('*').eq('user_id', userId);
    
    // 2. Грузим ПЛАН (от ИИ - таблица training_plans)
    const { data: plansData } = await supabase.from('training_plans').select('*').eq('user_id', userId);

    // 3. Если планов совсем нет - генерируем первый раз
    if (!plansData || plansData.length === 0) {
        await generateInitialPlan(userId);
        // После генерации перезагрузим, чтобы данные появились
        window.location.reload();
    }

    // Форматируем ФАКТЫ
    const facts: Entry[] = (workoutsData || []).map((item: any) => {
      const parts = item.activity_date.split('-');
      return {
        id: item.id.toString(),
        day: parseInt(parts[2]),
        month: parseInt(parts[1]) - 1,
        year: parseInt(parts[0]),
        type: item.activity_type || 'Бег',
        title: item.title || 'Пробежка',
        distance: item.distance_km?.toString(),
        source: 'FACT'
      };
    });

    // Форматируем ПЛАНЫ
    const plans: Entry[] = (plansData || []).map((item: any) => {
      const parts = item.scheduled_date.split('T')[0].split('-');
      return {
        id: item.id.toString(),
        day: parseInt(parts[2]),
        month: parseInt(parts[1]) - 1,
        year: parseInt(parts[0]),
        type: item.activity || 'План',
        title: item.activity,
        distance: item.distance,
        source: 'PLAN',
        is_completed: item.is_completed
      };
    });

    setItems([...facts, ...plans]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, session]);

  // Календарная сетка
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      {/* Шапка с общей дистанцией (только по Фактам) */}
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronLeft size={20}/></button>
          <h2 className="text-xl font-black uppercase tracking-tighter">{monthNames[currentDate.getMonth()]}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronRight size={20}/></button>
        </div>
        <div className="text-right">
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Пробег (Факт)</span>
            <p className="text-2xl font-black">
                {items.filter(i => i.source === 'FACT' && i.month === currentDate.getMonth()).reduce((acc, i) => acc + parseFloat(i.distance || '0'), 0).toFixed(1)} км
            </p>
        </div>
      </div>

      {/* Сетка календаря */}
      <div className="grid grid-cols-7 gap-1.5">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-700 text-[10px] font-black py-2">{d}</div>)}
        
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[110px] p-1.5 rounded-2xl border transition-all ${day ? 'bg-[#111] border-white/5' : 'bg-transparent border-none'}`}>
            {day && (
              <>
                <span className="text-[10px] font-bold text-slate-600 mb-1 block">{day}</span>
                <div className="space-y-1">
                  {items.filter(i => i.day === day && i.month === currentDate.getMonth() && i.year === currentDate.getFullYear()).map(item => (
                    <div 
                      key={item.id}
                      className={`p-1.5 rounded-lg text-[9px] font-black leading-tight border ${
                        item.source === 'FACT' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' // СТИЛЬ ТЕЛЕГРАМ БОТА
                        : 'bg-blue-600/10 border-blue-500/20 text-blue-400 border-dashed' // СТИЛЬ ИИ ПЛАНА
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {item.source === 'FACT' ? <CheckCircle2 size={8}/> : <Activity size={8}/>}
                        {item.title}
                      </div>
                      {item.distance && <div className="mt-0.5 opacity-60">{item.distance}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка выхода */}
      <button 
        onClick={() => supabase.auth.signOut()}
        className="mt-8 w-full py-4 rounded-2xl bg-white/5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default Dashboard;
