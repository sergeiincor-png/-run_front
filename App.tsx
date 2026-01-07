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
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Проверяем, есть ли уже профиль в базе
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        // Если профиля нет или не заполнена цель — показываем онбординг
        if (!profile || !profile.fitness_level) {
          setShowOnboarding(true);
        }
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setShowOnboarding(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // Логика переключения экранов
  if (!user) return <LandingPage />;
  if (showOnboarding) return <Onboarding userId={user.id} onComplete={() => setShowOnboarding(false)} />;
  
  return <Dashboard user={user} />;
};

export default App;
