import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // Импорт Supabase
import { ChevronLeft, ChevronRight, X, Trash2, Activity, Flag } from 'lucide-react';

// --- 1. НАСТРОЙКА SUPABASE ---
// Лучше вынести это в отдельный файл lib/supabase.ts, но для примера оставлю тут
const supabaseUrl = 'ТВОЙ_SUPABASE_URL_ИЗ_НАСТРОЕК';
const supabaseKey = 'ТВОЙ_SUPABASE_ANON_KEY_ИЗ_НАСТРОЕК';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Типы данных ---
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
  const [workouts, setWorkouts] = useState<Workout[]>([]); // Изначально пустой массив
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  // --- 2. ЗАГРУЗКА ДАННЫХ ИЗ БАЗЫ ---
  const fetchWorkouts = async () => {
    setIsLoading(true);
    
    // Запрашиваем данные из таблицы workouts
    // Можно добавить .eq('user_id', 'ID_ЮЗЕРА'), если у тебя есть авторизация на фронте
    const { data, error } = await supabase
      .from('workouts')
      .select('*');

    if (error) {
      console.error('Ошибка загрузки:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
      // Преобразуем данные из формата БД (snake_case) в формат календаря
      const formattedData: Workout[] = data.map((item: any) => {
        // Парсим дату "2026-01-06"
        const dateParts = item.activity_date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Месяцы в JS от 0 до 11
        const day = parseInt(dateParts[2]);

        // Определяем тип (в базе может быть русский текст от ИИ)
        let type: Workout['type'] = 'run';
        const lowerTitle = (item.title || '').toLowerCase();
        const lowerType = (item.activity_type || '').toLowerCase();
        
        if (lowerType.includes('сил') || lowerTitle.includes('офп')) type = 'strength';
        else if (lowerType.includes('бег') || lowerTitle.includes('бег')) type = 'run';
        else if (lowerTitle.includes('старт')) type = 'start';

        return {
          id: item.id.toString(), // Supabase может возвращать number ID
          day,
          month,
          year,
          type,
          title: item.title || 'Тренировка',
          status: 'completed', // Если пришло из бота (скриншот), значит выполнено
          distance: item.distance_km ? item.distance_km.toString() : undefined,
          duration: item.duration_minutes ? convertMinsToTime(item.duration_minutes) : undefined,
          calories: item.calories, // Можно добавить в интерфейс, если нужно
          description: item.activity_type // Используем тип из ИИ как описание
        };
      });

      setWorkouts(formattedData);
    }
    setIsLoading(false);
  };

  // Хелпер для минут -> "HH:MM:SS" или просто текст
  const convertMinsToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? h + 'ч ' : ''}${m}мин`;
  };

  // Запускаем при загрузке компонента
  useEffect(() => {
    fetchWorkouts();
    
    // ОПЦИОНАЛЬНО: Подписка на обновления в реальном времени
    const subscription = supabase
      .channel('workouts_update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, () => {
        fetchWorkouts(); // Перезагрузить, если бот добавил что-то новое
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);


  const [draggedWorkoutId, setDraggedWorkoutId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  // --- Хелперы дат ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    if (day === 0) day = 7;
    return day - 1;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  // --- Логика разбивки на недели ---
  const buildWeeks = () => {
    const weeks: (number | null)[][] = [];
    const totalSlots = Math.ceil((startDay + daysInMonth) / 7) * 7;
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < totalSlots; i++) {
        const dayNum = i - startDay + 1;
        if (i < startDay || dayNum > daysInMonth) {
            currentWeek.push(null);
        } else {
            currentWeek.push(dayNum);
        }
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    return weeks;
  };

  const calendarWeeks = buildWeeks();

  // Подсчет объемов
  const calculateVolume = (days: (number | null)[]) => {
    let dist = 0;
    
    days.forEach(day => {
        if (!day) return;
        const dayWorkouts = workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear());
        dayWorkouts.forEach(w => {
            if (w.distance) dist += parseFloat(w.distance);
        });
    });
    return { dist: dist.toFixed(1) };
  };

  const monthlyTotal = calculateVolume(Array.from({length: daysInMonth}, (_, i) => i + 1));


  // --- Drag-and-Drop (Пока только визуально, в базу не сохраняет перемещение) ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWorkoutId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    if (!draggedWorkoutId) return;
    setWorkouts(prev => prev.map(w => {
      if (w.id === draggedWorkoutId) return { ...w, day: targetDay, month: currentDate.getMonth(), year: currentDate.getFullYear() };
      return w;
    }));
    // ТУТ НАДО БУДЕТ ДОБАВИТЬ ЗАПРОС К SUPABASE НА ОБНОВЛЕНИЕ ДАТЫ
    setDraggedWorkoutId(null);
  };

  // --- Modal Logic ---
  const openNewWorkoutModal = (day: number) => {
    setEditingWorkout({ id: crypto.randomUUID(), day, month: currentDate.getMonth(), year: currentDate.getFullYear(), type: 'run', status: 'planned', title: '', distance: '', pace: '', hr: '', description: '' });
    setIsModalOpen(true);
  };
  const openEditModal = (workout: Workout) => { setEditingWorkout({ ...workout }); setIsModalOpen(true); };
  
  const saveWorkout = async () => {
    if (!editingWorkout || !editingWorkout.title) return;
    
    // Оптимистичное обновление UI
    setWorkouts(prev => {
      const idx = prev.findIndex(w => w.id === editingWorkout.id);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = editingWorkout as Workout; return updated; }
      return [...prev, editingWorkout as Workout];
    });

    // ТУТ НУЖНО ДОБАВИТЬ supabase.from('workouts').upsert(...) 
    
    setIsModalOpen(false);
  };
  
  const deleteWorkout = async () => { 
      if (!editingWorkout) return; 
      
      // Оптимистичное удаление
      setWorkouts(prev => prev.filter(w => w.id !== editingWorkout.id));
      
      // ТУТ НУЖНО ДОБАВИТЬ supabase.from('workouts').delete().eq('id', editingWorkout.id)

      setIsModalOpen(false); 
  };


  return (
    <div className="flex flex-col gap-6 pb-10 relative">
      
      {/* --- ШАПКА --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tighter">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-600">{currentDate.getFullYear()}</span>
          </h2>
          {isLoading && <Activity className="animate-spin text-blue-500" />}
        </div>

        <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Всего за месяц</p>
                <div className="flex items-baseline justify-end gap-2">
                    <span className="text-3xl font-black text-white">{monthlyTotal.dist}</span>
                    <span className="text-sm font-bold text-slate-500">км</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- ТЕЛО КАЛЕНДАРЯ --- */}
      <div className="flex flex-col gap-4">
        {/* Заголовки дней недели */}
        <div className="grid grid-cols-[1fr_120px] gap-4">
             <div className="grid grid-cols-7">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider pb-2">{day}</div>
                ))}
             </div>
             <div className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider pb-2">Итоги</div>
        </div>

        {/* Рендер недель */}
        {calendarWeeks.map((week, weekIdx) => {
             const weekStats = calculateVolume(week);
             
             return (
                <div key={weekIdx} className="flex flex-col md:flex-row gap-4">
                    
                    {/* СЕТКА НЕДЕЛИ */}
                    <div className="grid grid-cols-7 gap-2 flex-grow min-h-[140px]">
                        {week.map((day, dayIdx) => {
                            if (!day) return <div key={dayIdx} className="bg-transparent" />;

                            const dayWorkouts = workouts.filter(w => w.day === day && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear());
                            const isToday = isCurrentMonth && day === today.getDate();

                            return (
                                <div 
                                    key={dayIdx}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                    onClick={(e) => { if (e.target === e.currentTarget) openNewWorkoutModal(day); }}
                                    className={`relative rounded-xl p-2 border transition-all group flex flex-col gap-1.5 overflow-hidden
                                        ${isToday ? 'bg-blue-600/5 border-blue-500/50' : 'bg-[#121214] border-white/5 hover:border-white/10'}
                                    `}
                                >
                                    <div className="flex justify-between items-center pointer-events-none">
                                        <span className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{day}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openNewWorkoutModal(day); }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-slate-400 transition-all"
                                        >
                                            <div className="w-3 h-3 border-2 border-slate-500 rounded-full"/>
                                        </button>
                                    </div>

                                    {dayWorkouts.map(workout => {
                                        const isStart = workout.type === 'start';
                                        return (
                                            <div
                                                key={workout.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, workout.id)}
                                                onClick={(e) => { e.stopPropagation(); openEditModal(workout); }}
                                                className={`
                                                    p-1.5 rounded-lg text-left border cursor-grab active:cursor-grabbing relative group/card
                                                    ${isStart 
                                                        ? 'bg-amber-500/10 border-amber-500/40' 
                                                        : workout.status === 'completed' 
                                                            ? 'bg-green-500/10 border-green-500/20' 
                                                            : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isStart ? 'text-amber-400' : 'text-slate-400'}`}>
                                                        {workout.type === 'run' ? 'Бег' : workout.type === 'start' ? 'Старт' : 'Силовая'}
                                                    </span>
                                                    {isStart && <Flag size={8} className="fill-amber-400 text-amber-400" />}
                                                </div>
                                                <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isStart ? 'text-white' : 'text-slate-300'}`}>{workout.title}</p>
                                                {workout.distance && <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{workout.distance} км</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* ПРАВАЯ КОЛОНКА */}
                    <div className="w-full md:w-[120px] shrink-0 bg-[#121214] border border-white/5 rounded-xl p-3 flex flex-col justify-center gap-3">
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Дистанция</p>
                            <p className="text-xl font-bold text-white font-mono">{weekStats.dist} <span className="text-xs text-slate-600">км</span></p>
                        </div>
                        {weekStats.dist !== "0.0" && (
                            <div className="mt-auto pt-2">
                                <Activity size={16} className="text-green-500 mb-1" />
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-2/3" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             );
        })}

      </div>

      {/* --- МОДАЛЬНОЕ ОКНО (То же самое) --- */}
      {isModalOpen && editingWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#202023]">
              <h3 className="text-lg font-bold text-white">Тренировка</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs text-slate-500">Название</label><input className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" value={editingWorkout.title} onChange={e => setEditingWorkout({...editingWorkout, title: e.target.value})} /></div>
                 <div><label className="text-xs text-slate-500">Тип</label>
                 <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" value={editingWorkout.type} onChange={e => setEditingWorkout({...editingWorkout, type: e.target.value as any})}>
                    <option value="run">Бег</option><option value="strength">Силовая</option><option value="start">🏆 СТАРТ</option>
                 </select>
                 </div>
               </div>
               <div><label className="text-xs text-slate-500">Дистанция (км)</label><input className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" type="number" value={editingWorkout.distance} onChange={e => setEditingWorkout({...editingWorkout, distance: e.target.value})} /></div>
               <div><label className="text-xs text-slate-500">Описание</label><textarea className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" rows={3} value={editingWorkout.description} onChange={e => setEditingWorkout({...editingWorkout, description: e.target.value})} /></div>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-between">
                <button onClick={deleteWorkout} className="text-red-400 flex gap-2 items-center"><Trash2 size={16}/> Удалить</button>
                <button onClick={saveWorkout} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
