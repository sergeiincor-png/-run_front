import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Trophy } from 'lucide-react';

const CalendarView: React.FC = () => {
  // 1. Инициализируем календарь ТЕКУЩЕЙ датой
  const [currentDate, setCurrentDate] = useState(new Date());

  // Данные для примера (Mock Data) - чтобы календарь не был пустым
  const workouts = [
    { day: 5, type: 'run', title: 'Легкий бег 5 км', status: 'completed' },
    { day: 8, type: 'strength', title: 'ОФП (Ноги)', status: 'completed' },
    { day: 12, type: 'run', title: 'Интервалы 6x400м', status: 'missed' },
    { day: 14, type: 'run', title: 'Длительная 10 км', status: 'planned' },
    { day: 16, type: 'rest', title: 'Отдых', status: 'planned' },
  ];

  // Хелперы для работы с датами
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 - воскресенье, 1 - понедельник... нам нужно, чтобы пн был первым (сдвиг)
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    if (day === 0) day = 7;
    return day - 1;
  };

  // 2. Логика переключения месяцев
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Форматирование заголовка (например: "Январь 2026")
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="flex flex-col h-full gap-6">
      {/* --- Шапка календаря с навигацией --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {monthNames[currentDate.getMonth()]} <span className="text-slate-500">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth} 
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextMonth} 
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Сводка за месяц (справа) */}
        <div className="hidden md:flex gap-6">
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Дистанция</p>
                <p className="text-xl font-bold text-white">42.5 км</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Время</p>
                <p className="text-xl font-bold text-white">4ч 20м</p>
            </div>
        </div>
      </div>

      {/* --- Сетка календаря --- */}
      <div className="flex-grow bg-white/5 rounded-[2rem] p-6 border border-white/5 overflow-hidden flex flex-col">
        {/* Дни недели */}
        <div className="grid grid-cols-7 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Ячейки */}
        <div className="grid grid-cols-7 grid-rows-5 flex-grow gap-2">
          {/* Пустые ячейки для сдвига начала месяца */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-transparent" />
          ))}

          {/* Дни месяца */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const workout = workouts.find(w => w.day === dayNum);
            const isToday = isCurrentMonth && dayNum === today.getDate();

            return (
              <div 
                key={dayNum} 
                className={`relative rounded-2xl p-3 flex flex-col justify-between transition-all hover:bg-white/5 group border
                  ${isToday ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-transparent hover:border-white/10'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                    {dayNum}
                  </span>
                  {workout?.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
                  {workout?.status === 'missed' && <Clock size={16} className="text-red-400 opacity-50" />}
                  {workout?.status === 'planned' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                </div>

                {workout ? (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {workout.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      {workout.type}
                    </p>
                  </div>
                ) : (
                  <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full py-1 rounded bg-white/10 text-[10px] font-bold text-slate-400 hover:text-white">
                      + Добавить
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
