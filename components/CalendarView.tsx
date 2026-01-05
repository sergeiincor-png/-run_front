import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock Data
  const workouts = [
    { day: 5, type: 'run', title: 'Легкий бег 5 км', status: 'completed' },
    { day: 8, type: 'strength', title: 'ОФП (Ноги)', status: 'completed' },
    { day: 12, type: 'run', title: 'Интервалы 6x400м', status: 'missed' },
    { day: 14, type: 'run', title: 'Длительная 10 км', status: 'planned' },
    { day: 16, type: 'rest', title: 'Отдых', status: 'planned' },
    // Добавим тренировку в конец месяца для теста прокрутки
    { day: 28, type: 'run', title: 'Тестовый забег', status: 'planned' },
    { day: 30, type: 'strength', title: 'Йога и растяжка', status: 'planned' },
  ];

  // Helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    if (day === 0) day = 7;
    return day - 1;
  };

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  return (
    // ИЗМЕНЕНИЕ 1: Убрали h-full, добавили отступ снизу pb-10
    <div className="flex flex-col gap-8 pb-10">
      {/* --- Шапка --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Сводка (адаптивная) */}
        <div className="flex gap-6 p-4 md:p-0 bg-white/5 md:bg-transparent rounded-2xl md:rounded-none">
            <div className="text-left md:text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Дистанция</p>
                <p className="text-xl font-bold text-white">42.5 км</p>
            </div>
            <div className="text-left md:text-right border-l md:border-none border-white/10 pl-6 md:pl-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Время</p>
                <p className="text-xl font-bold text-white">4ч 20м</p>
            </div>
        </div>
      </div>

      {/* --- Контейнер сетки --- */}
      {/* ИЗМЕНЕНИЕ 2: Убрали flex-grow и overflow-hidden. Сделали паддинги адаптивными */}
      <div className="bg-white/5 rounded-[2rem] p-4 md:p-6 border border-white/5 flex flex-col">
        {/* Дни недели */}
        <div className="grid grid-cols-7 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Сама сетка */}
        {/* ИЗМЕНЕНИЕ 3: Убрали grid-rows-5 и flex-grow. 
            Добавили auto-rows-[minmax(120px,auto)] - это магия Tailwind. 
            Она говорит: "Делай ряды минимум 120px высотой, но если контента много - растягивайся". 
        */}
        <div className="grid grid-cols-7 gap-2 auto-rows-[minmax(120px,auto)]">
          {/* Пустые ячейки */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-transparent hidden md:block" />
          ))}

          {/* Дни месяца */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const workout = workouts.find(w => w.day === dayNum);
            const isToday = isCurrentMonth && dayNum === today.getDate();

            return (
              <div 
                key={dayNum} 
                // ИЗМЕНЕНИЕ 4: Добавили overflow-hidden ячейке и gap-2 для контента внутри
                className={`relative rounded-2xl p-2 md:p-3 flex flex-col gap-2 transition-all hover:bg-white/5 group border overflow-hidden min-h-[100px] md:min-h-0
                  ${isToday ? 'bg-blue-600/10 border-blue-500' : 'bg-white/5 border-transparent hover:border-white/10'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                    {dayNum}
                  </span>
                  {workout?.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
                  {workout?.status === 'missed' && <Clock size={16} className="text-red-400 opacity-50" />}
                  {workout?.status === 'planned' && <div className="w-2 h-2 rounded-full bg-slate-500 mt-1" />}
                </div>

                {workout ? (
                  <div className="mt-1 md:mt-2">
                    <p className="text-[11px] md:text-xs font-bold text-white line-clamp-3 leading-tight">
                      {workout.title}
                    </p>
                    {/* Тип тренировки скрываем на мобилках, чтобы не загромождать */}
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider hidden md:block">
                      {workout.type}
                    </p>
                  </div>
                ) : (
                  <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <button className="w-full py-1 rounded bg-white/10 text-[10px] font-bold text-slate-400 hover:text-white">
                      +
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
