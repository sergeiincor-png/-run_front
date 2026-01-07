import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { generateInitialPlan } from './aiCoach';
import { ChevronRight, ChevronLeft, Target, Gauge, Calendar, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Состояние анкеты
  const [formData, setFormData] = useState({
    fitness_level: '',
    goal_distance_km: 5,
    target_race_date: ''
  });

  const levels = [
    { id: 'beginner', label: 'Новичок', desc: 'Бегаю редко или только начинаю', icon: <Gauge className="w-5 h-5" /> },
    { id: 'intermediate', label: 'Любитель', desc: 'Бегаю 2-3 раза в неделю', icon: <Activity className="w-5 h-5" /> },
    { id: 'advanced', label: 'Продвинутый', desc: 'Готовлюсь к стартам регулярно', icon: <Target className="w-5 h-5" /> }
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      // 1. Сохраняем профиль в Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          fitness_level: formData.fitness_level,
          goal_distance_km: formData.goal_distance_km,
          target_race_date: formData.target_race_date,
          updated_at: new Date()
        });

      if (profileError) throw profileError;

      // 2. Генерируем первый план через ИИ
      const result = await generateInitialPlan(user.id);
      
      if (result.success) {
        onComplete(); // Возвращаемся в App.tsx, который переключит нас на Dashboard
      }
    } catch (err: any) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      
      {/* Прогресс-бар */}
      <div className="w-full max-w-md mb-12 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} 
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        
        {/* --- ШАГ 1: УРОВЕНЬ --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-black italic tracking-tight">ТВОЙ УРОВЕНЬ?</h2>
            <div className="grid gap-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => { setFormData({...formData, fitness_level: level.id}); handleNext(); }}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    formData.fitness_level === level.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">{level.icon}</div>
                  <div>
                    <div className="font-bold">{level.label}</div>
                    <div className="text-xs text-slate-500">{level.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- ШАГ 2: ДИСТАНЦИЯ --- */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-black italic tracking-tight">КАКАЯ ЦЕЛЬ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[5, 10, 21, 42].map((km) => (
                <button
                  key={km}
                  onClick={() => { setFormData({...formData, goal_distance_km: km}); handleNext(); }}
                  className="p-6 rounded-2xl border-2 border-white/5 bg-white/5 hover:border-blue-500/50 transition-all"
                >
                  <div className="text-3xl font-black mb-1">{km}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase">километров</div>
                </button>
              ))}
            </div>
            <button onClick={handleBack} className="text-slate-500 font-bold flex items-center gap-2">
              <ChevronLeft size={18} /> Назад
            </button>
          </div>
        )}

        {/* --- ШАГ 3: ДАТА И ФИНИШ --- */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-black italic tracking-tight">КОГДА ЗАБЕГ?</h2>
            <div className="relative">
              <input 
                type="date" 
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-lg font-bold focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, target_race_date: e.target.value})}
              />
              <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.target_race_date}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 />
                  <span>СОЗДАТЬ ПЛАН</span>
                </>
              )}
            </button>

            <button onClick={handleBack} className="w-full text-slate-500 font-bold">
              Назад
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
