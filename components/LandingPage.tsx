import React from 'react';
import { supabase } from '../supabaseClient';
import { ChevronRight, Activity, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const handleAuth = async () => {
    const email = window.prompt("Введите Email для получения ссылки на вход:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });

    if (error) alert("Ошибка: " + error.message);
    else alert("Ссылка для входа отправлена на почту!");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black mb-6 uppercase tracking-widest">
        <Sparkles size={12} /> AI RUNNING COACH
      </div>
      <h1 className="text-6xl font-black italic tracking-tighter mb-8 uppercase leading-tight">
        БЕГИ <br/><span className="text-blue-500">УМНЕЕ</span>
      </h1>
      <button 
        onClick={handleAuth}
        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
      >
        ПОЛУЧИТЬ ПЛАН <ChevronRight />
      </button>
    </div>
  );
};

export default LandingPage;
