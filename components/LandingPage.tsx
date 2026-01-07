import React from 'react';
import { supabase } from '../supabaseClient';
import { zap, Target, Trophy, ChevronRight, Activity, Gauge, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  // Функция для входа/регистрации (вызывает окно Supabase Auth)
  const handleAuth = async () => {
    // В MVP мы обычно используем простую авторизацию через почту или Google
    // Если у тебя настроены провайдеры, это вызовет окно входа
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google', // или другой настроенный метод
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert("Ошибка авторизации: " + error.message);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500">
      
      {/* --- ГЕРОЙ-СЕКЦИЯ --- */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        {/* Фоновые градиенты для "атмосферы" */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 animate-fade-in">
            <Sparkles size={14} />
            <span>ПЕРСОНАЛЬНЫЙ ИИ-ТРЕНЕР В ТВОЕМ КАРМАНЕ</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-tight mb-6">
            БЕГИ УМНЕЕ, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              А НЕ БЫСТРЕЕ
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Создаем адаптивные тренировочные планы на основе твоего уровня и целей. 
            Интеграция с Telegram и аналитика прогресса в реальном времени.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleAuth}
              className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95"
            >
              ПОЛУЧИТЬ ПЛАН
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-slate-500 text-sm font-medium">
              Бесплатно первые 14 дней
            </div>
          </div>
        </div>
      </section>

      {/* --- ПРЕИМУЩЕСТВА --- */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Карта 1: Адаптивность */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Адаптация</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              План перестраивается автоматически, если ты пропустил тренировку или пробежал быстрее прогноза.
            </p>
          </div>

          {/* Карта 2: Цели */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Любая дистанция</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              От первых 5 км до ультрамарафона. Тренер знает, как подвести тебя к пику формы без травм.
            </p>
          </div>

          {/* Карта 3: Мотивация */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Трекинг в TG</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Отправляй отчеты прямо в Telegram-бот. Мы сами оцифруем результат и добавим в твой календарь.
            </p>
          </div>

        </div>
      </section>

      {/* --- ФУТЕР / СОЦИАЛЬНЫЕ ДОКАЗАТЕЛЬСТВА --- */}
      <footer className="border-t border-white/5 mt-20 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Activity className="text-blue-500" />
            <span className="font-black italic tracking-tighter">RUNNA CLONE</span>
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-2xl font-black">1.2k+</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Бегунов</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">AI</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Двигатель</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">24/7</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Поддержка</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
