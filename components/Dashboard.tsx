import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// 👇 ВАЖНО: Activity добавлена в этот список
import { ChevronLeft, ChevronRight, Activity, LogOut } from 'lucide-react';

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
  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

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
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate, session]);

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold italic uppercase">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronRight /></button>
          
          {/* Теперь это не вызовет ошибку, так как Activity импортирована */}
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><LogOut size={20}/></button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-700 text-[10px] font-black mb-2 uppercase">{d}</div>)}
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[100px] p-2 border border-white/5 rounded-xl ${day ? 'bg-[#0a0a0a]' : 'bg-transparent border-none'}`}>
            {day && <span className="text-xs font-bold text-slate-600">{day}</span>}
            {day && workouts.filter(w => {
               const d = new Date(w.date);
               return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            }).map(w => (
              <div key={w.id} className={`mt-1 p-1 border rounded text-[9px] font-bold truncate ${w.source === 'FACT' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 border-dashed'}`}>
                {w.source === 'PLAN' ? '🤖 ' : ''}{w.title || w.activity}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
