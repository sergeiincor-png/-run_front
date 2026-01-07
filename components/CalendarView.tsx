import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, X, Trash2, Activity, Flag } from 'lucide-react';

// ==========================================
// 👇 ДАННЫЕ ПРОЕКТА (URL И КЛЮЧ)
// ==========================================
const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Интерфейс для работы в React ---
interface Workout {
  id: string;
  day: number;
  month: number;
  year: number;
  type: 'run' | 'strength' | 'rest' | 'cross' | 'start';
  title: string;
  status: 'completed' | 'missed' | 'planned';
  distance?: string;
  duration?: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. ЗАГРУЗКА ДАННЫХ ---
  const fetchWorkouts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('workouts')
      .select('*');

    if (error) {
      console.error('Ошибка загрузки:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const formattedData: Workout[] = data.map((item: any) => {
        const dateParts = item.activity_date.split('-');
        const titleFromDb = item.title || 'Тренировка';
        const typeFromDb = (item.activity_type || '').toLowerCase();

        let type: Workout['type'] = 'run';
        if (typeFromDb.includes('сил')) type = 'strength';
        if (titleFromDb.toLowerCase().includes('старт')) type = 'start';

        return {
          id: item.id.toString(),
          day: parseInt(dateParts[2]),
          month: parseInt(dateParts[1]) - 1, 
          year: parseInt(dateParts[0]),
          type: type,
          title: titleFromDb,
          status: 'completed', 
          distance: item.distance_km ? item.distance_km.toString() : undefined,
        };
      });
      setWorkouts(formattedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
    // Подписка на изменения в реальном времени
    const subscription = supabase
      .channel('workouts_update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
        fetchWorkouts(); 
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  // --- ХЕЛПЕРЫ ДЛЯ КАЛЕНДАРЯ ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Начинаем с понедельника
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);

  const calculateVolume = (days: (number | null)[]) => {
    let dist = 0;
    days.forEach(day => {
        if (!day) return;
        workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear())
                .forEach(w => { if (w.distance) dist += parseFloat(w.distance); });
    });
    return { dist: dist.toFixed(1) };
  };

  // --- 2. СОХРАНЕНИЕ В БАЗУ ---
  const saveWorkout = async () => {
    if (!editingWorkout || !editingWorkout.title) return;

    const dateStr = `${editingWorkout.year}-${String(editingWorkout.month! + 1).padStart(2, '0')}-${String(editingWorkout.day).padStart(2, '0')}`;

    // Формируем объект строго под структуру твоей БД
    const payload = {
        activity_date: dateStr,
        title: editingWorkout.title,
        activity_type: editingWorkout.type === 'run' ? 'Бег' : editingWorkout.type === 'strength' ? 'Силовая' : 'Старт',
        distance_km: editingWorkout.distance ? parseFloat(editingWorkout.distance) : 0,
        user_id: 'c98220ba-2f65-471e-898d-65ec07e55876', // Твой ID профиля
        duration_minutes: 0, // Поле из БД
        calories: 0,          // Поле из БД
    };

    const { error } = await supabase
        .from('workouts')
        .upsert({ id: editingWorkout.id, ...payload });

    if (error) {
        console.error("Ошибка сохранения:", error);
        alert(`Ошибка базы данных: ${error.message}`);
        return;
    }

    fetchWorkouts();
    setIsModalOpen(false);
  };

  // --- 3. УДАЛЕНИЕ ---
  const deleteWorkout = async () => { 
      if (!editingWorkout?.id) return; 
      const { error } = await supabase.from('workouts').delete().eq('id', editingWorkout.id);
      if (error) { 
        alert("Не удалось удалить запись"); 
        return; 
      }
      setWorkouts(prev => prev.filter(w => w.id !== editingWorkout.id));
      setIsModalOpen(false); 
  };

  const openNewWorkoutModal = (day: number) => {
    setEditingWorkout({ 
      id: crypto.randomUUID(), 
      day, 
      month: currentDate.getMonth(), 
      year: currentDate.getFullYear(), 
      type: 'run', 
      title: '', 
      distance: '' 
    });
    setIsModalOpen(true);
  };

  const calendarWeeks = (() => {
    const weeks: (number | null)[][] = [];
    const totalSlots = Math.ceil((startDay + daysInMonth) / 7) * 7;
    let week: (number | null)[] = [];
    for (let i = 0; i < totalSlots; i++) {
        const dayNum = i - startDay + 1;
        week.push(i < startDay || dayNum > daysInMonth ? null : dayNum);
        if (week.length === 7) { weeks.push(week); week = []; }
    }
    return weeks;
  })();

  return (
    <div className="flex flex-col gap-6 pb-10 bg-[#09090b] min-h-screen text-slate-200 p-4 font-sans">
      {/* Шапка календаря */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter text-white">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-600">{currentDate.getFullYear()}</span>
          </h2>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Всего за месяц</p>
            <div className="flex items-baseline justify-end gap-2">
                <span className="text-3xl font-black text-white">
                  {calculateVolume(Array.from({length: daysInMonth}, (_, i) => i + 1)).dist}
                </span>
                <span className="text-sm font-bold text-slate-500">км</span>
            </div>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="flex flex-col gap-4">
        {calendarWeeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col md:flex-row gap-4">
            <div className="grid grid-cols-7 gap-2 flex-grow min-h-[120px]">
              {week.map((day, dIdx) => {
                if (!day) return <div key={dIdx} />;
                const dayWorkouts = workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear());
                const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                
                return (
                  <div 
                    key={dIdx} 
                    onClick={() => openNewWorkoutModal(day)} 
                    className={`relative rounded-xl p-2 border bg-[#121214] border-white/5 hover:border-white/20 transition-all min-h-[100px] cursor-pointer
                      ${isToday ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{day}</span>
                    {dayWorkouts.map(w => (
                      <div 
                        key={w.id} 
                        onClick={(e) => { e.stopPropagation(); setEditingWorkout(w); setIsModalOpen(true); }} 
                        className={`mt-1 p-1 rounded border text-[10px] font-bold truncate transition-all
                          ${w.type === 'start' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}
                      >
                        {w.title} {w.distance && `(${w.distance}км)`}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="w-full md:w-[100px] bg-white/5 rounded-xl p-3 flex flex-col justify-center text-center border border-white/5">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Неделя</p>
                <p className="text-lg font-bold text-white font-mono leading-none">{calculateVolume(week).dist}</p>
                <p className="text-[8px] text-slate-600 font-bold mt-1">км</p>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      {isModalOpen && editingWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181b] w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Параметры тренировки</h3>
              <X className="cursor-pointer text-slate-400 hover:text-white" onClick={() => setIsModalOpen(false)} />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Название</label>
              <input className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all" value={editingWorkout.title} onChange={e => setEditingWorkout({...editingWorkout, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Тип</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none" value={editingWorkout.type} onChange={e => setEditingWorkout({...editingWorkout, type: e.target.value as any})}>
                  <option value="run">Бег</option><option value="strength">Силовая</option><option value="start">🏆 Старт</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Дистанция (км)</label>
                <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none" value={editingWorkout.distance} onChange={e => setEditingWorkout({...editingWorkout, distance: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button onClick={deleteWorkout} className="text-red-500 hover:text-red-400 font-bold text-sm flex items-center gap-2 transition-colors">
                <Trash2 size={18}/> Удалить
              </button>
              <button onClick={saveWorkout} className="bg-blue-600 px-8 py-3 rounded-xl font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
