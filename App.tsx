import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('fitness_level')
      .eq('id', userId)
      .single();
    
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">ЗАГРУЗКА...</div>;

  if (!session) return <LandingPage />;
  if (!hasProfile) return <Onboarding onComplete={() => checkProfile(session.user.id)} />;
  return <Dashboard session={session} />;
}
