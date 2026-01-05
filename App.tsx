
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка текущей сессии при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Слушатель изменений состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold italic text-white text-2xl shadow-xl animate-bounce">RC</div>
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Загрузка системы...</span>
      </div>
    );
  }

  // Роутинг на основе состояния авторизации
  return (
    <div className="min-h-screen bg-[#09090b]">
      {user ? (
        <Dashboard user={user} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
};

export default App;
