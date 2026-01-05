import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, X, Save, Trash2, Activity, Timer, Hash, Trophy, Flag } from 'lucide-react';

// --- Типы данных ---
interface Workout {
  id: string;
  day: number;
  month: number;
  year: number;
  // ИЗМЕНЕНИЕ: Заменили 'race' на 'start'
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
  
  // Данные тренировок
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: '1', day: 5, month: 0, year: 2026, type: 'run', title: 'Легкий бег 5 км', status: 'completed', distance: '5.0', pace: '6:30', hr: '135', description: 'Легко, в разговорном темпе' },
    { id: '2', day: 8, month: 0, year: 2026, type: 'strength', title: 'ОФП (Ноги)', status: 'completed', duration: '00:45:00', description: 'Приседания, выпады, планка' },
    { id: '3', day: 12, month: 0, year: 2026, type: 'run', title: 'Интервалы 6x400м', status: 'missed', distance: '8.0', pace: '4:15', hr: '175' },
    { id: '4', day: 14, month: 0, year: 2026, type: 'run', title: 'Длительная 10 км', status: 'planned', distance: '10.0', pace: '6:00', hr: '145' },
    { id: '5', day: 16, month: 0, year: 2026, type: 'rest', title: 'Отдых', status: 'planned' },
    // ИЗМЕНЕНИЕ: Тип 'start'
    { id: '6', day: 25, month: 0, year: 2026, type: 'start', title: 'Зимний полумарафон', status: 'planned', distance: '21.1', pace: '5:30', hr: '165', description: 'Целевой старт месяца!' },
  ]);

  const [draggedWorkoutId, setDraggedWorkoutId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  // Хелперы
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

  // Drag-and-Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWorkoutId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    if (!draggedWorkoutId) return;
    setWorkouts(prev => prev.map(w => {
      if (w.id === draggedWorkoutId) {
        return { ...w, day: targetDay, month: currentDate.getMonth(), year: currentDate.getFullYear() };
      }
      return w;
    }));
    setDraggedWorkoutId(null);
  };

  // Модальное окно
  const openNewWorkoutModal = (day: number) => {
    setEditingWorkout({
      id: crypto.randomUUID(),
      day, month: currentDate.getMonth(), year: currentDate.getFullYear(),
      type: 'run', status: 'planned', title: '',
      distance: '', pace: '', hr: '', description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (workout: Workout) => {
    setEditingWorkout({ ...workout });
    setIsModalOpen(true);
  };

  const saveWorkout = () => {
    if (!editingWorkout || !editingWorkout.title) return;
    setWorkouts(prev => {
      const idx = prev.findIndex(w => w.id === editingWorkout.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = editingWorkout as Workout;
        return updated;
      }
      return [...prev, editingWorkout as Workout];
    });
    setIsModalOpen(false);
  };

  const deleteWorkout = () => {
    if (!editingWorkout) return;
    setWorkouts(prev => prev.filter(w => w.id !== editingWorkout.id));
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-10 relative">
      {/* --- ШАПКА --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-500">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* БЛОК ЦЕЛИ */}
        <div className="flex items-center gap-5 bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/> 
              Моя цель
            </p>
            <div className="flex items-center gap-6">
               <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Дата</p><p className="font-bold text-white text-sm">25 Янв</p></div>
               <div className="w-px h-8 bg-white/10" />
               <div><p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Старт</p><p className="font-bold text-amber-400 text-sm">21.1 км</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- СЕТКА --- */}
      <div className="bg-white/5 rounded-[2rem] p-4 md:p-6 border border-white/5 flex flex-col shadow-2xl">
        <div className="grid grid-cols-7 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 auto-rows-[minmax(120px,auto)]">
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="hidden md:block" />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayWorkouts = workouts.filter(w => w.day === dayNum && w.month === currentDate.getMonth() && w.year === currentDate.getFullYear());
            const isToday = isCurrentMonth && dayNum === today.getDate();

            return (
              <div 
                key={dayNum}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dayNum)}
                onClick={(e) => { if (e.target === e.currentTarget) openNewWorkoutModal(dayNum); }}
                className={`relative rounded-2xl p-2 md:p-3 flex flex-col gap-2 transition-all group border min-h-[100px] md:min-h-0 cursor-pointer
                  ${isToday ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}
                `}
              >
                <div className="flex justify-between items-start pointer-events-none">
                  <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{dayNum}</span>
                </div>

                {dayWorkouts.map(workout => {
                  // ПРОВЕРКА: Если это СТАРТ
                  const isStart = workout.type === 'start';

                  return (
                    <div
                      key={workout.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, workout.id)}
                      onClick={(e) => { e.stopPropagation(); openEditModal(workout); }}
                      className={`
                        p-2 rounded-xl text-left shadow-lg cursor-grab active:cursor-grabbing border transition-transform hover:scale-[1.02] relative overflow-hidden
                        ${isStart 
                           ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' // Стили для СТАРТА (Золотой)
                           : workout.status === 'completed' 
                             ? 'bg-green-500/10 border-green-500/20' 
                             : workout.status === 'missed' 
                               ? 'bg-red-500/10 border-red-500/20' 
                               : 'bg-zinc-800 border-white/5'
                        }
                      `}
                    >
                      {/* Свечение для Старта */}
                      {isStart && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/30 blur-xl rounded-full -mr-2 -mt-2"></div>}

                      <div className="flex items-center justify-between mb-1 relative z-10">
                         <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                           isStart ? 'text-amber-400' : 
                           workout.type === 'run' ? 'text-blue-400' : 
                           workout.type === 'strength' ? 'text-orange-400' : 'text-slate-400'
                         }`}>
                           {isStart && <Flag size={10} className="fill-amber-400 stroke-amber-400" />} 
                           {/* ИЗМЕНЕНИЕ: Пишем СТАРТ */}
                           {workout.type === 'start' ? 'СТАРТ' : workout.type}
                         </span>
                         {workout.status === 'completed' && !isStart && <CheckCircle2 size={12} className="text-green-500" />}
                      </div>
                      <p className={`text-xs font-bold line-clamp-2 leading-tight ${isStart ? 'text-white' : 'text-slate-200'}`}>
                        {workout.title}
                      </p>
                      {workout.distance && (
                        <p className={`text-[10px] mt-1 font-medium ${isStart ? 'text-amber-200' : 'text-slate-500'}`}>
                          {workout.distance} км
                        </p>
                      )}
                    </div>
                  );
                })}
                
                <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openNewWorkoutModal(dayNum); }}
                      className="w-full py-1 rounded-lg bg-white/10 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
                    >
                      + Добавить
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО --- */}
      {isModalOpen && editingWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#202023]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingWorkout.type === 'start' && <Flag size={20} className="text-amber-400 fill-amber-400" />}
                  {editingWorkout.id && workouts.find(w => w.id === editingWorkout.id) ? 'Редактировать' : 'Новое событие'}
                </h3>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{editingWorkout.day} {monthNames[editingWorkout.month!]} {editingWorkout.year}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Название</label>
                    <input type="text" value={editingWorkout.title} onChange={e => setEditingWorkout({...editingWorkout, title: e.target.value})} placeholder="Название события" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-bold text-lg" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Тип события</label>
                    <select 
                      value={editingWorkout.type} 
                      onChange={e => setEditingWorkout({...editingWorkout, type: e.target.value as any})} 
                      className={`w-full border rounded-xl p-3 text-white outline-none appearance-none font-bold
                        ${editingWorkout.type === 'start' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-black/20 border-white/10 focus:border-blue-500'}
                      `}
                    >
                      <option value="run">Бег</option>
                      <option value="strength">Силовая</option>
                      <option value="cross">Кросс</option>
                      <option value="rest">Отдых</option>
                      {/* ИЗМЕНЕНИЕ: Value='start', Label='СТАРТ' */}
                      <option value="start">🏆 СТАРТ</option>
                    </select>
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1"><Hash size={14} /><span className="text-[10px] uppercase font-bold tracking-widest">Дист. (км)</span></div>
                    <input type="number" value={editingWorkout.distance || ''} onChange={e => setEditingWorkout({...editingWorkout, distance: e.target.value})} placeholder="0.0" className="w-full bg-transparent border-b border-white/20 py-1 text-xl font-mono text-white focus:border-blue-500 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1"><Timer size={14} /><span className="text-[10px] uppercase font-bold tracking-widest">Темп</span></div>
                    <input type="text" value={editingWorkout.pace || ''} onChange={e => setEditingWorkout({...editingWorkout, pace: e.target.value})} placeholder="--:--" className="w-full bg-transparent border-b border-white/20 py-1 text-xl font-mono text-white focus:border-blue-500 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1"><Activity size={14} /><span className="text-[10px] uppercase font-bold tracking-widest">ЧСС</span></div>
                    <input type="number" value={editingWorkout.hr || ''} onChange={e => setEditingWorkout({...editingWorkout, hr: e.target.value})} placeholder="---" className="w-full bg-transparent border-b border-white/20 py-1 text-xl font-mono text-white focus:border-blue-500 outline-none" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Описание / Заметки</label>
                 <textarea rows={4} value={editingWorkout.description || ''} onChange={e => setEditingWorkout({...editingWorkout, description: e.target.value})} placeholder="Детали..." className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none" />
              </div>
              
              <div className="flex gap-4">
                {['planned', 'completed', 'missed'].map((status) => (
                  <button key={status} onClick={() => setEditingWorkout({...editingWorkout, status: status as any})} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${editingWorkout.status === status ? (status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-400' : status === 'missed' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-blue-500/20 border-blue-500 text-blue-400') : 'border-white/10 text-slate-500 hover:bg-white/5'}`}>{status === 'planned' ? 'План' : status === 'completed' ? 'Выполнено' : 'Пропуск'}</button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-[#202023] flex justify-between">
               <button onClick={deleteWorkout} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold"><Trash2 size={18} /> Удалить</button>
               <div className="flex gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors">Отмена</button>
                 <button onClick={saveWorkout} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"><Save size={18} /> Сохранить</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
