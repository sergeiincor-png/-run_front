import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ChevronRight, Gauge, Target, 
  User, Ruler, Scale, Calendar, Trophy, ArrowLeft 
} from 'lucide-react';

// --- ИНИЦИАЛИЗАЦИЯ ---
const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Здесь должна быть твоя функция генерации плана
const generateInitialPlan = async (userId: string) => {
  console.log("Generating plan for:", userId);
  // Имитация задержки AI
  await new Promise(resolve => setTimeout(resolve, 2000));
};

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    fitness_level: '',
    weight: '',
    height: '',
    goal_distance_km: 5,
    target_race_date: ''
  });

  const totalSteps = 5;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          first_name: formData.first_name,
          fitness_level: formData.fitness_level,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          goal_distance_km: formData.goal_distance_km,
          target_race_date: formData.target_race_date || null,
          updated_at: new Date()
        });

        if (error) throw error;
        await generateInitialPlan(user.id);
        onComplete();
      }
    } catch (err) {
      alert("Ошибка при сохранении: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm space-y-6">
            <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400">
              <User size={32} />
            </div>
            <h2 className="text-3xl font-black italic uppercase">Как тебя зовут?</h2>
            <input 
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold outline-none focus:border-blue-500 transition-all text-center"
              placeholder="Твое имя"
              value={formData.first_name}
              onChange={e => setFormData({...formData, first_name: e.target.value})}
            />
            <button disabled={!formData.first_name} onClick={nextStep} className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase disabled:opacity-30">Продолжить</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm space-y-4">
             <h2 className="text-3xl font-black italic uppercase mb-8">Твой опыт?</h2>
             {[
               { id: 'beginner', label: 'Новичок', desc: 'Бегаю редко или никогда', icon: Gauge, color: 'blue' },
               { id: 'intermediate', label: 'Любитель', desc: 'Бегаю 1-2 раза в неделю', icon: Activity, color: 'emerald' },
               { id: 'advanced', label: 'Атлет', desc: 'Регулярные тренировки', icon: Trophy, color: 'purple' }
             ].map(level => (
               <button 
                 key={level.id}
                 onClick={() => { setFormData({...formData, fitness_level: level.id}); nextStep(); }}
                 className={`w-full p-6 bg-white/5 border ${formData.fitness_level === level.id ? 'border-blue-500' : 'border-white/10'} rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left`}
               >
                 <div className={`p-3 rounded-xl bg-${level.color}-500/20 text-${level.color}-400`}>
                   <level.icon size={24} />
                 </div>
                 <div>
                   <div className="font-black uppercase text-sm">{level.label}</div>
                   <div className="text-xs text-slate-500">{level.desc}</div>
                 </div>
               </button>
             ))}
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm space-y-6">
            <h2 className="text-3xl font-black italic uppercase mb-8">Биометрия</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2">Вес (кг)</label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500" placeholder="70" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2">Рост (см)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500" placeholder="175" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                </div>
              </div>
            </div>
            <button onClick={nextStep} className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase">Далее</button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm space-y-6">
            <h2 className="text-3xl font-black italic uppercase mb-8">Твоя цель?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[5, 10, 21.1, 42.2].map(dist => (
                <button 
                  key={dist} 
                  onClick={() => setFormData({...formData, goal_distance_km: dist})}
                  className={`p-6 rounded-2xl border font-black text-xl transition-all ${formData.goal_distance_km === dist ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                >
                  {dist === 21.1 ? '21K' : dist === 42.2 ? '42K' : `${dist}K`}
                </button>
              ))}
            </div>
            <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-2 tracking-widest">Когда старт? (опционально)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500" value={formData.target_race_date} onChange={e => setFormData({...formData, target_race_date: e.target.value})} />
                </div>
              </div>
            <button onClick={nextStep} className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase">Почти готово</button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
            <div className="bg-emerald-500/20 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Target size={40} />
            </div>
            <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Всё готово!</h2>
            <p className="text-slate-400 font-medium mb-10">AI готов построить твой план на основе {formData.goal_distance_km} км.</p>
            <button 
              onClick={saveProfile} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 transition-all"
            >
              {loading ? <Activity className="animate-spin" /> : 'Сгенерировать план'}
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Bar */}
      {step < totalSteps && (
        <div className="fixed top-12 w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Back Button */}
      {step > 1 && step < totalSteps && !loading && (
        <button onClick={prevStep} className="fixed top-10 left-6 p-3 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}

      <AnimatePresence mode="wait">
        <div key={step} className="w-full flex justify-center">
          {renderStep()}
        </div>
      </AnimatePresence>

      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex gap-1">
            {[1,2,3].map(i => <motion.div key={i} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />)}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">AI анализирует параметры...</p>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
