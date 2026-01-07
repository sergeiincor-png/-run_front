import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, ChevronRight, Activity, Clock } from 'lucide-react';

const Dashboard = ({ user }: { user: any }) => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      // Берем тренировки текущего пользователя на ближайшее время
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (data) setWorkouts(data);
      setLoading(false);
    };

    fetchWorkouts();
  }, [user.id]);

  if (loading) return <div className="p-10 text-white italic">Загрузка твоего плана...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 font-sans">
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter gradient-text">ТВОЙ ПЛАН</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Первая неделя подготовки</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-blue-500">{workouts.length}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">тренировок</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid gap-4">
        {workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <div key={index} className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <Activity size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-1">{workout.scheduled_date}</div>
                  <h3 className="font-bold text-lg uppercase tracking-tight">{workout.workout_type}</h3>
                  <p className="text-slate-400 text-sm max-w-md line-clamp-1">{workout.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-2xl font-black italic">{workout.target_distance_km} <span className="text-sm">КМ</span></div>
                  <div className="flex items-center justify-end gap-1 text-slate-500 text-xs font-bold">
                    <Clock size={12} /> {workout.target_pace}
                  </div>
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500">План еще не создан. Попробуй обновить страницу.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
