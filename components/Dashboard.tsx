import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, Clock, LogOut } from 'lucide-react';

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', userId)
          .order('scheduled_date', { ascending: true });

        if (error) throw error;
        if (data) setWorkouts(data);
      } catch (err) {
        console.error("Ошибка при загрузке плана:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchWorkouts();
    }
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-blue-500 animate-pulse font-bold italic">ЗАГРУЗКА ПЛАНА...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 font-sans">
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-blue-500 uppercase">Мой план</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Персональный AI-тренер</p>
        </div>
        <button 
          onClick={handleSignOut} 
          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="max-w-4xl mx-auto grid gap-4">
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <div key={index} className="p-6 rounded-3xl border border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono mb-1">{workout.scheduled_date}</div>
                  <h3 className="font-bold text-base uppercase tracking-tight">{workout.workout_type}</h3>
                  <p className="text-slate-400 text-xs line-clamp-1">{workout.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-black italic text-white">{workout.target_distance_km} <span className="text-xs text-blue-500">КМ</span></div>
                <div className="flex items-center justify-end gap-1 text-slate-500 text-[10px] font-bold uppercase">
                  <Clock size={10} /> {workout.target_pace}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <p className="text-slate-500 text-sm">План еще не создан. Попробуй обновить страницу или заполни анкету заново.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
