import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Все иконки импортированы строго с большой буквы
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Zap, 
  AlertTriangle,
  LogOut,
  Clock,
  MapPin
} from 'lucide-react';

interface Entry {
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  distance?: string;
  duration?: string;
  source: 'FACT' | 'PLAN'; 
}

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<Entry[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    setErrorInfo(null);
    
    try {
      const userId = session.user.id;

      // Загружаем данные из обеих таблиц одновременно
      const [workoutsRes, plansRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('training_plans').select('*').eq('user_id', userId)
      ]);

      if (workoutsRes.error) throw new Error("Ошибка Workouts: " + workoutsRes.error.message);
      if (plansRes.error) throw new Error("Ошибка Plans: " + plansRes.error.message);

      // Маппинг ФАКТОВ (Telegram)
      const facts: Entry[] = (workoutsRes.data || []).map((item: any) => {
        if (!item.activity_date) return null;
        const parts = item.activity_date.split('-');
        return {
          id: `fact-${item.id}`,
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1,
          year: parseInt(parts[0]),
          title: item.title || 'Пробежка',
          distance: item.distance_km?.toString(),
          duration: item.duration_minutes?.toString(),
          source: 'FACT'
        };
      }).filter(Boolean) as Entry[];

      // Маппинг ПЛАНОВ (AI)
      const plans: Entry[] = (plansRes.data || []).map((item: any) => {
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
          duration: item.duration,
          source: 'PLAN'
        };
      }).filter(Boolean) as Entry[];

      setItems([...facts, ...plans]);
    } catch (err: any) {
      setErrorInfo(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, session]);

  // Если код упадет, мы увидим это сообщение вместо черного экрана
  if (errorInfo) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Ошибка в Dashboard</h2>
        <p className="text-sm opacity-70 font-mono bg-white/5 p-4 rounded-lg">{errorInfo}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/10 rounded-xl text-white">Обновить</button>
      </div>
    );
  }

  // Названия и сетка календаря
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg border border-white/5"><ChevronLeft /></button>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg border border-white/5"><ChevronRight /></button>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Дистанция (Факт)</p>
          <p className="text-3xl font-black leading-none">
            {items.filter(i => i.source === 'FACT' && i.month === currentDate.getMonth()).reduce((acc, i) => acc + parseFloat(i.distance || '0'), 0).toFixed(1)}
            <span className="text-sm ml-1 text-slate-500">км</span>
          </p>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-slate-700 text-[10px] font-black py-2 uppercase tracking-widest">{d}</div>
        ))}
        
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[120px] p-2 border rounded-2xl transition-all ${day ? 'bg-[#111] border-white/5' : 'bg-transparent border-none'}`}>
            {day && (
              <>
                <span className="text-xs font-bold text-slate-600 mb-2 block">{day}</span>
                <div className="space-y-1.5">
                  {items.filter(i => i.day === day && i.month === currentDate.getMonth() && i.year === currentDate.getFullYear()).map(item => (
                    <div 
                      key={item.id}
                      className={`p-2 rounded-xl text-[10px] font-black leading-tight border transition-transform active:scale-95 ${
                        item.source === 'FACT' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                        : 'bg-blue-600/10 border-blue-500/20 text-blue-300 border-dashed'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.source === 'FACT' ? <CheckCircle2 size={10}/> : <Zap size={10} className="text-blue-400 fill-current"/>}
                        <span className="truncate">{item.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-60 font-medium">
                        {item.distance && <div className="flex items-center gap-0.5"><MapPin size={8}/>{item.distance}</div>}
                        {item.duration && <div className="flex items-center gap-0.5"><Clock size={8}/>{item.duration}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-8 flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded" />
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Telegram / Факт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/10 border border-blue-500/30 border-dashed rounded" />
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">AI План</span>
          </div>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-4 py-2 rounded-xl"
        >
          <LogOut size={12} />
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
