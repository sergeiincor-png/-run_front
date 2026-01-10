import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Circle, Timer, 
  MapPin, Zap, Info, Dumbbell, Activity 
} from 'lucide-react';

const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

interface WorkoutDetailProps {
  date: string;
  session: any;
  onBack: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ date, session, onBack }) => {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [date]);

  const fetchWorkout = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('scheduled_date', date)
      .maybeSingle();

    if (data) {
      setWorkout(data);
      if (data.is_completed) setCompletedItems(['__full__']); // Помечаем как полностью готовое
    }
    setLoading(false);
  };

  // Функция для разбивки описания на чек-лист
  const getChecklist = (text: string) => {
    if (!text) return [];
    // Ищем предложения или фразы после СБУ/ОФП или просто разделенные точкой/запятой
    return text
      .split(/[.;]|\n/)
      .map(item => item.trim())
      .filter(item => item.length > 10); // Убираем слишком короткие обрывки
  };

  const toggleItem = (item: string) => {
    setCompletedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleCompleteWorkout = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('training_plans')
      .update({ is_completed: true })
      .eq('id', workout.id);
    
    if (!error) {
      setWorkout({ ...workout, is_completed: true });
    }
    setIsSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Activity className="animate-spin text-blue-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Загрузка плана...</p>
    </div>
  );

  if (!workout) return (
    <div className="p-8 text-center">
      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Тренировка не найдена на эту дату</p>
      <button onClick={onBack} className="mt-6 text-blue-500 font-black uppercase text-[10px] tracking-widest">Вернуться</button>
    </div>
  );

  const checklist = getChecklist(workout.description);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6 md:p-10"
    >
      {/* Шапка */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">План на сегодня</div>
          <div className="text-sm font-bold text-slate-400 uppercase italic tracking-tighter">{date}</div>
        </div>
      </div>

      {/* Основная карточка */}
      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap size={120} className="text-blue-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
              {workout.activity || 'Бег'}
            </span>
            {workout.is_completed && (
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 size={12} /> Выполнено
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase mb-10 leading-none tracking-tighter">
            {workout.activity}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><MapPin size={12}/> Дистанция</p>
              <p className="text-3xl font-black italic">{workout.target_distance_km || '—'} <span className="text-xs text-slate-600 italic">КМ</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Timer size={12}/> Время</p>
              <p className="text-3xl font-black italic">{workout.duration || '—'}</p>
            </div>
          </div>

          {/* Чек-лист упражнений */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Dumbbell size={18} className="text-blue-500" />
              <h3 className="text-sm font-black uppercase italic tracking-widest">Задание на тренировку</h3>
            </div>
            
            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => toggleItem(item)}
                  className={`w-full p-5 rounded-[1.5rem] border text-left transition-all flex items-start gap-4 group ${completedItems.includes(item) ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-white/5 border-white/5 hover:border-blue-500/30'}`}
                >
                  <div className="mt-0.5">
                    {completedItems.includes(item) ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                    )}
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${completedItems.includes(item) ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {item}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка завершения */}
      {!workout.is_completed && (
        <button 
          onClick={handleCompleteWorkout}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all uppercase italic tracking-tighter"
        >
          {isSaving ? <Activity className="animate-spin" /> : <CheckCircle2 size={24} />}
          Завершить тренировку
        </button>
      )}

      <div className="mt-10 p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-4">
        <Info size={20} className="text-slate-500 shrink-0" />
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          Совет тренера: Не забывай про разминку перед основной частью. Если пульс выше порога на 5-10 ударов, замедлись. Твое восстановление так же важно, как и сама работа.
        </p>
      </div>
    </motion.div>
  );
};

export default WorkoutDetail;
