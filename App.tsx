import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
// 👇 Добавляем Activity сюда, если вдруг используется спиннер
import { Activity } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('fitness_level')
      .eq('id', userId)
      .maybeSingle(); // maybeSingle безопаснее, не кидает ошибку в консоль
    
    setHasProfile(!!data?.fitness_level);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else {
        setHasProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        {/* Вот тут могла быть ошибка, если Activity не импортирована */}
        <Activity className="animate-spin mb-4 text-blue-500" size={40} />
        <div className="font-black italic uppercase tracking-widest">ЗАГРУЗКА...</div>
      </div>
    );
  }

  if (!session) return <LandingPage />;
  if (hasProfile === false) return <Onboarding onComplete={() => checkProfile(session.user.id)} />;
  
  return <Dashboard session={session} />;
}
