import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Target, Calendar, ChevronRight, Loader2 } from 'lucide-react';
// ВАЖНО: Добавляем импорт ИИ-сервиса
import { generateInitialPlan } from '../services/aiCoach';

interface OnboardingProps {
  onComplete: () => void;
  userId: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState(5);
  const [date, setDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = async () => {
    if (!level || !goal || !date) {
      alert("Пожалуйста, заполните все данные");
      return;
    }

    setIsSaving(true);
    
    const profileData = {
      id: userId,
      fitness_level: level,
      goal_distance_km: Number(goal),
      target_race_date: date
    };

    console.log("Попытка сохранения данных профиля:", profileData);

    try {
      // 1. Сохраняем данные профиля в Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;
      
      console.log("Профиль сохранен. Запускаем ИИ для генерации плана...");

      // 2. ЗАПУСКАЕМ ИИ-ТРЕНЕРА (та самая магия)
      await generateInitialPlan(userId); 

      // 3. Закрываем онбординг и переходим в Dashboard
      onComplete(); 
    } catch (error: any) {
      console.error("Ошибка:", error.message);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center"><Trophy className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center italic tracking-tight uppercase">Твой уровень?</h2>
            <div className="grid gap-3">
              {[
                { id: 'beginner', label: 'Новичок', desc: 'Начинаю с нуля' },
                { id: 'intermediate', label: 'Любитель', desc: 'Бегаю 1-2 раза в неделю' },
                { id: 'advanced', label: 'Профи', desc: 'Готовлюсь к рекордам' }
              ].map((l) => (
                <button 
                  key={l.id}
                  onClick={() => { setLevel(l.id); setStep(2); }}
                  className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-left group"
                >
                  <div className="font-bold group-hover:text-blue-400">{l.label}</div>
                  <div className="text-xs text-slate-500">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex justify-center"><Target className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center italic tracking-tight uppercase">Дистанция цели</h2>
            <div className="flex gap-4">
              {[5, 10, 21].map((g) => (
                <button 
                  key={g}
                  onClick={() => { setGoal(g); setStep(3); }}
                  className={`flex-1 p-6 rounded-2xl border transition-all ${goal === g ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-blue-500/50'}`}
                >
                  <div className="text-2xl font-black">{g}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">км</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="w-full text-slate-500 text-xs hover:text-white transition-colors">← Назад</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex justify-center"><Calendar className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center italic tracking-tight uppercase">Когда забег?</h2>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 outline-none text-white font-mono"
            />
            <button 
              onClick={saveProfile}
              disabled={!date || isSaving}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-tighter"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <>Создать план <ChevronRight size={20} /></>}
            </button>
            <button onClick={() => setStep(2)} className="w-full text-slate-500 text-xs hover:text-white transition-colors">← Назад</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
