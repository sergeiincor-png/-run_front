
import React from 'react';
import { ChevronLeft, ChevronRight, Trophy, Zap, Activity } from 'lucide-react';

interface Workout {
  day: number;
  type: 'Run' | 'Strength' | 'Rest';
  title: string;
  duration?: string;
  status: 'completed' | 'planned' | 'missed';
}

const MOCK_WORKOUTS: Workout[] = [
  { day: 12, type: 'Run', title: 'Легкий бег 5км', duration: '35 мин', status: 'completed' },
  { day: 14, type: 'Strength', title: 'ОФП: Колени и стопы', duration: '20 мин', status: 'completed' },
  { day: 15, type: 'Run', title: 'Интервалы 400м x 6', duration: '45 мин', status: 'planned' },
  { day: 17, type: 'Run', title: 'Длинная 10км', duration: '75 мин', status: 'planned' },
];

const CalendarView: React.FC = () => {
  const days = Array.from({ length: 35 }, (_, i) => i - 3); // Фейковая сетка
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Март 2025</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-1">Мезоцикл: Базовая подготовка</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg border border-white/5 transition-colors"><ChevronLeft size={20}/></button>
            <button className="p-2 hover:bg-white/5 rounded-lg border border-white/5 transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {weekDays.map(wd => (
            <div key={wd} className="bg-zinc-900/50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">{wd}</div>
          ))}
          {days.map((day, i) => {
            const workout = MOCK_WORKOUTS.find(w => w.day === day);
            const isCurrentMonth = day > 0 && day <= 31;
            return (
              <div key={i} className={`min-h-[140px] bg-zinc-900/30 p-3 flex flex-col gap-2 transition-all border-r border-b border-white/5 ${!isCurrentMonth ? 'opacity-20' : 'hover:bg-white/[0.02]'}`}>
                <span className={`text-xs font-bold ${day === 15 ? 'text-blue-500' : 'text-slate-500'}`}>{isCurrentMonth ? day : ''}</span>
                {workout && (
                  <div className={`p-2 rounded-xl border flex flex-col gap-1 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform ${
                    workout.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${workout.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-tight text-white">{workout.type}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-200 leading-tight">{workout.title}</p>
                    <span className="text-[9px] text-slate-400 font-medium">{workout.duration}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full" />
          <h3 className="text-xl font-bold mb-6 text-white">Итоги недели</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500"><Activity size={20}/></div>
                <span className="text-sm font-medium text-slate-400">Пробег</span>
              </div>
              <span className="font-black text-white">24.5 <span className="text-[10px] text-slate-500">КМ</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500"><Zap size={20}/></div>
                <span className="text-sm font-medium text-slate-400">Нагрузка</span>
              </div>
              <span className="font-black text-white text-orange-400">342 <span className="text-[10px] text-slate-500 text-white/50">TSS</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-600/10 flex items-center justify-center text-yellow-500"><Trophy size={20}/></div>
                <span className="text-sm font-medium text-slate-400">Прогресс</span>
              </div>
              <span className="font-black text-white">100%</span>
            </div>
          </div>
          <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Весь анализ</button>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-600/5">
          <h4 className="font-bold text-white mb-2">Совет тренера</h4>
          <p className="text-sm text-slate-400 leading-relaxed italic">"Твой пульс покоя снизился на 2 удара за неделю. Организм адаптируется отлично! В субботу добавим немного темпа."</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
