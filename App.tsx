import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Проверяем сессию пользователя
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          // 2. Проверяем профиль в базе. Используем .maybeSingle(), 
          // чтобы избежать ошибки 406, если записи еще нет
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (error) {
            console.error("Ошибка при запросе профиля:", error.message);
          }

          // 3. Если профиля нет или не выбран уровень подготовки — отправляем на онбординг
          if (!profile || !profile.fitness_level) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        } catch (err) {
          console.error("Системная ошибка:", err);
        }
      }
      setLoading(false);
    };

    checkUser();

    // Слушатель изменений состояния (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      // Если пользователь вышел, сбрасываем состояние онбординга
      if (!newUser) {
        setShowOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Экран загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold italic text-white text-2xl shadow-xl animate-bounce">RC</div>
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Проверка системы...</span>
      </div>
    );
  }

  // Основной роутинг приложения
  
  // 1. Если не авторизован — Лендинг
  if (!user) {
    return <LandingPage />;
  }

  // 2. Если авторизован, но профиль не заполнен — Онбординг
  if (showOnboarding) {
    return (
      <Onboarding 
        userId={user.id} 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  // 3. Если всё в порядке — Дашборд (Личный кабинет)
  return <Dashboard user={user} />;
};

export default App;
