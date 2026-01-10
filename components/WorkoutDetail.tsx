import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Circle, Timer, 
  MapPin, Zap, Info, Dumbbell, Activity, Gauge
} from 'lucide-react';

const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

interface WorkoutDetailProps { date: string; session: any; onBack: () => void; }

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ date, session, onBack }) => {
  const [plan, setPlan] = useState<any>(null);
  const [fact, setFact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    const [planRes, factRes] = await Promise.all([
      supabase.from('training_plans').select('*').eq('user_id', session.user.id).eq('scheduled_date', date).maybeSingle(),
      supabase.from('workouts').select('*').eq('user_id', session.user.id).eq('activity_date', date).maybeSingle()
    ]);
    
    if (planRes.data) setPlan(planRes.data);
    if (factRes.data) setFact(factRes.data);
    setLoading(false);
  };

  const getChecklist = (text: string) => {
    if (!text) return [];
    return text.split(/[.;]|\n/).map(item => item.trim()).filter(item => item.length > 10);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Activity className="animate-spin text-blue-500" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      {/* Шапка */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"><ArrowLeft size={16}/> Назад</button>
        <div className="text-right">
            <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">{date}</h2>
            <p className="text-[10px] font-black uppercase text-blue-500">Детализация дня</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* КОЛОНКА 1: ПЛАН (🤖 AI) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-500 font-black uppercase text-[10px] tracking-widest px-2"><Zap size={14} className="fill-current"/> План тренировки</div>
          {plan ? (
            <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-3xl font-black italic uppercase mb-6 leading-none text-blue-400">{plan.activity}</h3>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div><p className="text-[9px] font-black text-slate-500 uppercase mb-1">Дистанция</p><p className="text-xl font-black italic">{plan.target_distance_km} КМ</p></div>
                    <div><p className="text-[9px] font-black text-slate-500 uppercase mb-1">Время</p><p className="text-xl font-black italic">{plan.duration}</p></div>
                  </div>
                  
                  {/* Чек-лист из описания */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2"><Dumbbell size={12}/> Задание тренера:</p>
                    {getChecklist(plan.description).map((item, i) => (
                      <div key={i} onClick={() => setCompletedItems(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])} className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${completedItems.includes(item) ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                        {completedItems.includes(item) ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> : <Circle size={16} className="text-slate-700 shrink-0"/>}
                        <p className={`text-xs font-medium leading-relaxed ${completedItems.includes(item) ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] text-center text-slate-600 font-bold uppercase text-[10px]">План на сегодня не составлен</div>}
        </div>

        {/* КОЛОНКА 2: ФАКТ (👟 ТВОЙ БЕГ) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest px-2"><Activity size={14}/> Фактический результат</div>
          {fact ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl h-full">
               <h3 className="text-3xl font-black italic uppercase mb-6 leading-none text-emerald-400">{fact.activity_type || 'Забег'}</h3>
               <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><MapPin size={10}/> Дистанция</p>
                    <p className="text-2xl font-black italic">{fact.distance_km} <span className="text-[10px] opacity-40 italic">КМ</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Gauge size={10}/> Средний Темп</p>
                    <p className="text-2xl font-black italic">{fact.pace || '—'} <span className="text-[10px] opacity-40 italic">/КМ</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Timer size={10}/> Время</p>
                    <p className="text-2xl font-black italic">{fact.duration_minutes} <span className="text-[10px] opacity-40 italic">МИН</span></p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1"><Activity size={10}/> Пульс</p>
                    <p className="text-2xl font-black italic">{fact.avg_hr || '—'} <span className="text-[10px] opacity-40 italic">BPM</span></p>
                  </div>
               </div>
               
               {fact.notes && (
                 <div className="space-y-2">
                   <p className="text-[9px] font-black text-slate-500 uppercase px-1">Твой комментарий:</p>
                   <div className="p-5 bg-white/5 rounded-2xl text-slate-300 text-xs leading-relaxed font-medium italic border border-white/5">"{fact.notes}"</div>
                 </div>
               )}
            </div>
          ) : <div className="h-full min-h-[200px] flex items-center justify-center p-8 bg-white/5 border border-white/5 rounded-[2rem] text-center text-slate-600 font-bold uppercase text-[10px]">Тренировка еще не загружена</div>}
        </div>
      </div>
      
      <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-4">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Сравнивай плановые показатели темпа и пульса с фактическими данными. Это поможет AI точнее адаптировать план на следующую неделю.</p>
      </div>
    </motion.div>
  );
};

export default WorkoutDetail;
