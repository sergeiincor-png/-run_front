import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, X, Trash2, Activity, Flag } from 'lucide-react';

// ==========================================
// 👇 ДАННЫЕ ВАШЕГО ПРОЕКТА
// ==========================================
const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  pace?: string;
  hr?: string;
  description?: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('workouts').select('*');

    if (error) {
      console.error('Ошибка загрузки:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      const formattedData: Workout[] = data.map((item: any) => {
        const dateParts = item.activity_date.split('-');
        return {
          id: item.id.toString(),
          day: parseInt(dateParts[2]),
          month: parseInt(dateParts[1]) - 1, 
          year: parseInt(dateParts[0]),
          type: (item.activity_type || '').toLowerCase().includes('сил') ? 'strength' : 'run',
          title: item.title || 'Тренировка',
          status: 'completed', 
          distance: item.distance_km ? item.distance_km.toString() : undefined,
          description: item.description
        };
      });
      setWorkouts(formattedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
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

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  const calculateVolume = (days: (number | null)[]) => {
    let dist = 0;
    days.forEach(day => {
        if (!day) return;
        workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear())
                .forEach(w => { if (w.distance) dist += parseFloat(w.distance); });
    });
    return { dist: dist.toFixed(1) };
  };

  const saveWorkout = async () => {
    if (!editingWorkout || !editingWorkout.title) return;

    const dateStr = `${editingWorkout.year}-${String(editingWorkout.month! + 1).padStart(2, '0')}-${String(editingWorkout.day).padStart(2, '0')}`;

    const payload = {
        activity_date: dateStr,
        title: editingWorkout.title,
        activity_type: editingWorkout.type === 'run' ? 'Бег' : editingWorkout.type === 'strength' ? 'Силовая' : 'Старт',
        distance_km: editingWorkout.distance ? parseFloat(editingWorkout.distance) : 0,
        description: editingWorkout.description || '',
        user_id: 'c98220ba-2f65-471e-898d-65ec07e55876', // Тестовый ID профиля
        // 👇 Добавляем заглушки для полей, которые могут быть NOT NULL в базе
        duration_minutes: 0,
        pace: '0:00',
        hr: 0
    };

    const { error } = await supabase
        .from('workouts')
        .upsert({ id: editingWorkout.id, ...payload });

    if (error) {
        console.error("Ошибка сохранения:", error);
        alert(`Ошибка: ${error.message}`);
        return;
    }

    fetchWorkouts();
    setIsModalOpen(false);
  };

  const deleteWorkout = async () => { 
      if (!editingWorkout?.id) return; 
      const { error } = await supabase.from('workouts').delete().eq('id', editingWorkout.id);
      if (error) { alert("Не удалось удалить"); return; }
      setWorkouts(prev => prev.filter(w => w.id !== editingWorkout.id));
      setIsModalOpen(false); 
  };

  const openNewWorkoutModal = (day: number) => {
    setEditingWorkout({ id: crypto.randomUUID(), day, month: currentDate.getMonth(), year: currentDate.getFullYear(), type: 'run', status: 'planned', title: '', distance: '', description: '' });
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
    <div className="flex flex-col gap-6 pb-10 bg-[#09090b] min-h-screen text-slate-200 p-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter text-white">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-600">{currentDate.getFullYear()}</span>
          </h2>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Всего за месяц</p>
            <div className="flex items-baseline justify-end gap-2">
                <span className="text-3xl font-black text-white">{calculateVolume(Array.from({length: daysInMonth}, (_, i) => i + 1)).dist}</span>
                <span className="text-sm font-bold text-slate-500">км</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">{d}</div>)}
      </div>

      <div className="flex flex-col gap-4">
        {calendarWeeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col md:flex-row gap-4">
            <div className="grid grid-cols-7 gap-2 flex-grow min-h-[120px]">
              {week.map((day, dIdx) => {
                if (!day) return <div key={dIdx} />;
                const dayWorkouts = workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear());
                return (
                  <div key={dIdx} onClick={() => openNewWorkoutModal(day)} className={`relative rounded-xl p-2 border bg-[#121214] border-white/5 hover:border-white/20 transition-all group min-h-[100px] cursor-pointer ${isCurrentMonth && day === today.getDate() ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
                    <span className="text-xs font-bold text-slate-500">{day}</span>
                    {dayWorkouts.map(w => (
                      <div key={w.id} onClick={(e) => { e.stopPropagation(); setEditingWorkout(w); setIsModalOpen(true); }} className="mt-1 p-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 truncate">
                        {w.title} {w.distance && `(${w.distance}км)`}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="w-full md:w-[100px] bg-white/5 rounded-xl p-3 flex flex-col justify-center text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Неделя</p>
                <p className="text-lg font-bold text-white font-mono">{calculateVolume(week).dist}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181b] w-full max-w-md rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Параметры тренировки</h3>
              <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <input className="w-full bg-black/40 border border-white/10 rounded-lg p-2" placeholder="Название" value={editingWorkout.title} onChange={e => setEditingWorkout({...editingWorkout, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <select className="bg-black/40 border border-white/10 rounded-lg p-2" value={editingWorkout.type} onChange={e => setEditingWorkout({...editingWorkout, type: e.target.value as any})}>
                <option value="run">Бег</option><option value="strength">Силовая</option><option value="start">🏆 Старт</option>
              </select>
              <input type="number" className="bg-black/40 border border-white/10 rounded-lg p-2" placeholder="Км" value={editingWorkout.distance} onChange={e => setEditingWorkout({...editingWorkout, distance: e.target.value})} />
            </div>
            <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-2" placeholder="Описание" rows={3} value={editingWorkout.description} onChange={e => setEditingWorkout({...editingWorkout, description: e.target.value})} />
            <div className="flex justify-between pt-4">
              <button onClick={deleteWorkout} className="text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={16}/> Удалить</button>
              <button onClick={saveWorkout} className="bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-500">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
