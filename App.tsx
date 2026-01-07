import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // 1. Слушаем состояние авторизации
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else {
        setNeedsOnboarding(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Проверяем, заполнял ли пользователь анкету
  const checkProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('fitness_level')
      .eq('id', userId)
      .single();

    // Если профиля нет или fitness_level пустой — отправляем на онбординг
    if (error || !data || !data.fitness_level) {
      setNeedsOnboarding(true);
    } else {
      setNeedsOnboarding(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-blue-500 animate-pulse font-black italic text-2xl">RUN COACH...</div>
      </div>
    );
  }

  // Если не залогинен — Landing
  if (!session) return <LandingPage />;

  // Если залогинен, но нет данных профиля — Onboarding
  if (needsOnboarding) {
    return <Onboarding userId={session.user.id} onComplete={() => setNeedsOnboarding(false)} />;
  }

  // Если всё есть — Dashboard
  return <Dashboard userId={session.user.id} />;
};

export default App;
