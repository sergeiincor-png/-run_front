import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Clock, MapPin, Zap, FileText, Activity } from 'lucide-react';

interface WorkoutDetailProps {
  date: string;
  session: any;
  onBack: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ date, session, onBack }) => {
  const [data, setData] = useState<{ plan: any; fact: any }>({ plan: null, fact: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const userId = session.user.id;
      const [planRes, factRes] = await Promise.all([
        supabase.from('training_plans').select('*').eq('scheduled_date', date).eq('user_id', userId).maybeSingle(),
        supabase.from('workouts').select('*').eq('activity_date', date).eq('user_id', userId).maybeSingle()
      ]);
      setData({ plan: planRes.data, fact: factRes.data });
      setLoading(false);
    };
    fetchDetail();
  }, [date, session]);

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <Activity className="animate-spin text-blue-500" />
    </div>
  );

  const calculatePace = (duration: number, distance: number) => {
    if (!duration || !distance) return "--:--";
    const totalSeconds = duration * 60;
    const paceSeconds = totalSeconds / distance;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.round(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 font-bold uppercase text-[10px] tracking-widest transition-colors">
        <ArrowLeft size={16} /> Назад к календарю
      </button>

      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1">
              {new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h2 className="text-4xl font-black italic uppercase text-white mb-6">
              {data.fact?.title || data.plan?.activity || "Тренировка"}
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black text-white">{data.fact?.distance_km || "0.0"}</span>
              <span className="text-xl font-bold text-white/60 mb-2">КМ</span>
              {data.fact && (
                <div className="ml-4 mb-2 bg-green-400/20 text-green-300 border border-green-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  ВЫПОЛНЕНО ✔
                </div>
              )}
            </div>
          </div>
          <Activity size={180} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
        </div>

        <div className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500">Параметр</th>
                <th className="p-6 text-[10px] font-black uppercase text-blue-500">План (ИИ)</th>
                <th className="p-6 text-[10px] font-black uppercase text-green-500">Факт</th>
              </tr>
            </thead>
            <tbody className="font-bold text-sm text-white">
              <tr className="border-b border-white/5">
                <td className="p-6 flex items-center gap-3 text-slate-400"><Clock size={16}/> Длительность</td>
                <td className="p-6">{data.plan?.duration || "--"}</td>
                <td className="p-6">{data.fact?.duration_minutes ? `${data.fact.duration_minutes} мин` : "--"}</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-6 flex items-center gap-3 text-slate-400"><MapPin size={16}/> Дистанция</td>
                <td className="p-6">{data.plan?.distance || "--"}</td>
                <td className="p-6">{data.fact?.distance_km ? `${data.fact.distance_km} км` : "--"}</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-6 flex items-center gap-3 text-slate-400"><Zap size={16}/> Темп</td>
                <td className="p-6">--:--</td>
                <td className="p-6">{calculatePace(data.fact?.duration_minutes, data.fact?.distance_km)} мин/км</td>
              </tr>
              <tr>
                <td className="p-6 flex items-start gap-3 text-slate-400 pt-8"><FileText size={16}/> Описание</td>
                <td colSpan={2} className="p-6 pt-8 text-xs text-slate-300 leading-relaxed max-w-xs">
                  {data.plan?.description ? data.plan.description.substring(0, 300) : "Описание отсутствует."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
