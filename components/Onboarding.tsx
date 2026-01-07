import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { generateInitialPlan } from './aiCoach';
// 👇 Проверь эту строку у себя! Activity должна быть здесь.
import { Activity, CheckCircle2, ChevronRight, Gauge, Target } from 'lucide-react';

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);

  const saveProfile = async (level: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, fitness_level: level });
      await generateInitialPlan(user.id);
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black italic mb-10 uppercase">Твой уровень?</h2>
      
      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={() => saveProfile('beginner')} 
          disabled={loading}
          className="group w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-blue-500 hover:bg-blue-500/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
              <Gauge size={24} />
            </div>
            <div className="text-left">
              <div className="font-black uppercase">Новичок</div>
              <div className="text-xs text-slate-400">Бегаю редко</div>
            </div>
          </div>
          {loading ? <Activity className="animate-spin" size={20}/> : <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity"/>}
        </button>

        <button 
          onClick={() => saveProfile('advanced')} 
          disabled={loading}
          className="group w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
              <Target size={24} />
            </div>
            <div className="text-left">
              <div className="font-black uppercase">Профи</div>
              <div className="text-xs text-slate-400">Регулярные старты</div>
            </div>
          </div>
          {loading ? <Activity className="animate-spin" size={20}/> : <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity"/>}
        </button>
      </div>

      {loading && (
        <p className="mt-8 animate-pulse font-bold text-blue-400 uppercase text-xs tracking-widest flex items-center gap-2">
          <Activity size={14} className="animate-spin" />
          AI составляет план...
        </p>
      )}
    </div>
  );
};

export default Onboarding;
