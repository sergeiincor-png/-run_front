import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Target, Calendar, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  userId: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState(5);
  const [date, setDate] = useState('');

  const saveProfile = async () => {
    // Сохраняем данные в таблицу profiles, которую мы создали в Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        fitness_level: level,
        goal_distance_km: goal,
        target_race_date: date,
        updated_at: new Date()
      });

    if (!error) {
      onComplete(); // Переходим в Dashboard после успеха
    } else {
      alert('Ошибка сохранения: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        
        {/* Шаг 1: Выбор уровня */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex justify-center"><Trophy className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center gradient-text">Твой уровень?</h2>
            <div className="grid gap-4">
              {[
                { id: 'beginner', label: 'Новичок (с нуля)' },
                { id: 'intermediate', label: 'Любитель (бегаю иногда)' },
                { id: 'advanced', label: 'Профи' }
              ].map((l) => (
                <button 
                  key={l.id}
                  onClick={() => { setLevel(l.id); setStep(2); }}
                  className="p-4 rounded-xl border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition text-left"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаг 2: Выбор цели */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-center"><Target className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center gradient-text">Какая цель?</h2>
            <div className="flex gap-4">
              {[5, 10].map((g) => (
                <button 
                  key={g}
                  onClick={() => { setGoal(g); setStep(3); }}
                  className="flex-1 p-6 rounded-xl border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition text-2xl font-bold"
                >
                  {g} км
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаг 3: Выбор даты */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-center"><Calendar className="text-blue-500" size={48} /></div>
            <h2 className="text-2xl font-bold text-center gradient-text">Когда забег?</h2>
            <input 
              type="date" 
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white"
            />
            <button 
              onClick={saveProfile}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
            >
              Создать мой план <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
