import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ChevronLeft, ChevronRight, Activity, MapPin, 
  Timer, Trophy, Calendar as CalendarIcon, LogOut 
} from 'lucide-react';

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
        ...(factRes.data || []).map((f: any) => ({ 
          ...f, 
          source: 'FACT', 
          // Принудительно берем только дату YYYY-MM-DD
          cleanDate: f.activity_date.split('T')[0] 
        })),
        ...(planRes.data || []).map((p: any) => ({ 
          ...p, 
          source: 'PLAN', 
          cleanDate: p.scheduled_date.split('T')[0] 
        }))
      ];
      setWorkouts(combined);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [currentDate, session]);

  // СТАТИСТИКА (используем distance_km)
  const stats = workouts
    .filter(w => w.source === 'FACT')
    .filter(w => w.cleanDate.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`))
    .reduce((acc, curr) => ({
      dist: acc.dist + (Number(curr.distance_km) || 0),
      time: acc.time + (Number(curr.duration_minutes) || 0),
      count: acc.count + 1
    }), { dist: 0, time: 0, count: 0 });

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full text-white">
      {/* СТАТИСТИКА ВЕРХУ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
          <MapPin className="text-blue-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Дистанция</p>
            <p className="text-2xl font-black">{stats.dist.toFixed(1)} км</p>
          </div>
        </div>
        <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
          <Timer className="text-indigo-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Время</p>
            <p className="text-2xl font-black">{Math.floor(stats.time / 60)}ч {stats.time % 60}м</p>
          </div>
        </div>
        <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
          <Trophy className="text-emerald-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Забеги</p>
            <p className="text-2xl font-black">{stats.count}</p>
          </div>
        </div>
      </div>

      {/* КАЛЕНДАРЬ */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-4 relative">
        <div className="flex justify-between items-center mb-6 px-4">
            <h2 className="text-2xl font-black italic uppercase">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="flex gap-2">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronLeft/></button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-xl"><ChevronRight/></button>
                <button onClick={() => supabase.auth.signOut()} className="p-2 text-red-500"><LogOut size={20}/></button>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d} className="text-center text-slate-700 text-[10px] font-black py-2 uppercase">{d}</div>
          ))}
          {daysArr.map((day, idx) => {
            const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            return (
              <div key={idx} className={`min-h-[120px] p-2 border rounded-3xl ${day ? 'bg-[#111]/50 border-white/5' : 'border-none opacity-0'}`}>
                {day && <span className="text-[10px] font-black text-slate-600">{day}</span>}
                {day && workouts.filter(w => w.cleanDate === dateStr).map((w, i) => (
                  <div key={i} className={`mt-1 p-2 rounded-xl border text-[9px] font-bold ${w.source === 'FACT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 border-blue-600/20 text-blue-400 border-dashed'}`}>
                    <div className="truncate uppercase">{w.title || w.activity_type}</div>
                    <div className="mt-1 flex justify-between">
                        <span>{w.distance_km || w.distance} км</span>
                        <span className="opacity-60">{w.pace}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {isLoading && <Activity className="absolute bottom-4 right-4 animate-spin text-blue-500" />}
      </div>
    </div>
  );
};

export default Dashboard;
