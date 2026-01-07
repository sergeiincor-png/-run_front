import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, X, Trash2, Activity } from 'lucide-react';

// ==========================================
// 👇 НАСТРОЙКИ SUPABASE
// ==========================================
const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Workout {
  id: string;
  day: number;
  month: number;
  year: number;
  type: string;
  title: string;
  distance?: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  // ЗАГРУЗКА
  const fetchWorkouts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('workouts').select('*');
    if (!error && data) {
      const formatted: Workout[] = data.map((item: any) => {
        const parts = item.activity_date.split('-');
        return {
          id: item.id.toString(),
          day: parseInt(parts[2]),
          month: parseInt(parts[1]) - 1, 
          year: parseInt(parts[0]),
          type: item.activity_type || 'Бег',
          title: item.title || 'Тренировка',
          distance: item.distance_km ? item.distance_km.toString() : '0',
        };
      });
      setWorkouts(formatted);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, [currentDate]);

  // СОХРАНЕНИЕ
  const saveWorkout = async () => {
    if (!editingWorkout || !editingWorkout.title) return;
    const dateStr = `${editingWorkout.year}-${String(editingWorkout.month! + 1).padStart(2, '0')}-${String(editingWorkout.day).padStart(2, '0')}`;

    const payload = {
        activity_date: dateStr,
        title: editingWorkout.title,
        activity_type: editingWorkout.type || 'Бег',
        distance_km: editingWorkout.distance ? parseFloat(editingWorkout.distance) : 0,
        user_id: 'c98220ba-2f65-471e-898d-65ec07e55876', // Твой ID
        duration_minutes: 0, 
        calories: 0,          
    };

    const { error } = await supabase.from('workouts').upsert({ id: editingWorkout.id, ...payload });
    if (error) {
        alert("Ошибка: " + error.message);
    } else {
        fetchWorkouts();
        setIsModalOpen(false);
    }
  };

  const deleteWorkout = async () => { 
      if (!editingWorkout?.id) return; 
      await supabase.from('workouts').delete().eq('id', editingWorkout.id);
      fetchWorkouts();
      setIsModalOpen(false); 
  };

  // КАЛЕНДАРЬ
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const totalDist = workouts
    .filter(w => w.month === currentDate.getMonth() && w.year === currentDate.getFullYear())
    .reduce((acc, w) => acc + parseFloat(w.distance || '0'), 0);

  const daysArr = [];
  for (let i = 0; i < startOffset; i++) daysArr.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArr.push(i);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 bg-white/5 rounded-lg"><ChevronRight /></button>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase">Дистанция за месяц</p>
          <p className="text-3xl font-black">{totalDist.toFixed(1)} <span className="text-sm">км</span></p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d} className="text-center text-slate-600 text-xs font-bold mb-2">{d}</div>)}
        {daysArr.map((day, idx) => (
          <div 
            key={idx} 
            onClick={() => day && (setEditingWorkout({ id: crypto.randomUUID(), day, month: currentDate.getMonth(), year: currentDate.getFullYear(), type: 'Бег', title: '', distance: '' }), setIsModalOpen(true))}
            className={`min-h-[100px] p-2 border border-white/5 rounded-xl transition-all ${day ? 'bg-white/5 cursor-pointer hover:border-white/20' : 'bg-transparent border-none'}`}
          >
            {day && <span className="text-xs font-bold text-slate-500">{day}</span>}
            {day && workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear()).map(w => (
              <div key={w.id} onClick={(e) => { e.stopPropagation(); setEditingWorkout(w); setIsModalOpen(true); }} className="mt-1 p-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] font-bold text-green-400 truncate">
                {w.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {isModalOpen && editingWorkout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c1c1e] p-6 rounded-2xl w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold mb-4 text-white">Тренировка</h3>
            <input className="w-full bg-black/40 border border-white/10 rounded-lg p-3 mb-4 text-white" placeholder="Название" value={editingWorkout.title} onChange={e => setEditingWorkout({...editingWorkout, title: e.target.value})} />
            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 mb-4 text-white" placeholder="Километры" value={editingWorkout.distance} onChange={e => setEditingWorkout({...editingWorkout, distance: e.target.value})} />
            <div className="flex justify-between">
              <button onClick={deleteWorkout} className="text-red-500 font-bold flex items-center gap-1"><Trash2 size={16}/> Удалить</button>
              <div className="flex gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">Отмена</button>
                <button onClick={saveWorkout} className="bg-blue-600 px-6 py-2 rounded-xl font-bold">ОК</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
