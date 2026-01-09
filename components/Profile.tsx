import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  User, 
  Activity, 
  Save, 
  ArrowLeft, 
  Link as LinkIcon, 
  LogOut, 
  CheckCircle2,
  AlertCircle,
  Target,
  CalendarDays
} from 'lucide-react';

interface ProfileProps {
  session: any;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    max_hr: '',
    threshold_hr: '',
    goal_distance_km: '',
    target_race_date: '',
    strava_connected: false,
    garmin_connected: false
  });

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          max_hr: data.max_hr?.toString() || '',
          threshold_hr: data.threshold_hr?.toString() || '',
          goal_distance_km: data.goal_distance_km?.toString() || '',
          target_race_date: data.target_race_date || '',
          strava_connected: data.strava_connected || false,
          garmin_connected: data.garmin_connected || false
        });
      }
    } catch (error: any) {
      console.error('Ошибка загрузки профиля:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const { user } = session;

      // Формируем объект для записи с преобразованием типов
      const updates = {
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        max_hr: profile.max_hr ? parseInt(profile.max_hr, 10) : null,
        threshold_hr: profile.threshold_hr ? parseInt(profile.threshold_hr, 10) : null,
        goal_distance_km: profile.goal_distance_km ? parseFloat(profile.goal_distance_km) : null,
        target_race_date: profile.target_race_date || null,
        strava_connected: profile.strava_connected,
        garmin_connected: profile.garmin_connected,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Профиль обновлен!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Activity className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold uppercase text-xs tracking-widest">К тренировкам</span>
          </button>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors">
            <LogOut size={18} />
            <span className="font-bold uppercase text-xs tracking-widest">Выйти</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Аватар */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="w-24 h-24 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-2xl">
                <User size={48} className="text-white/20" />
              </div>
              <h3 className="text-xl font-black italic uppercase">{profile.first_name || 'Атлет'}</h3>

                          </div>
          </div>

          <div className="md:col-span-2">
            <form onSubmit={updateProfile} className="space-y-8">
              {/* Личные данные */}
              <section>
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-blue-600"></span> Личные данные
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Имя</label>
                    <input 
                      type="text" 
                      value={profile.first_name}
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Фамилия</label>
                    <input 
                      type="text" 
                      value={profile.last_name}
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
                  </div>
                </div>
              </section>

              {/* Цели забега */}
              <section>
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-indigo-600"></span> Цели забега
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-1"><Target size={10}/> Дистанция (км)</label>
                    <input 
                      type="number" 
                      value={profile.goal_distance_km}
                      onChange={(e) => setProfile({...profile, goal_distance_km: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-indigo-600 outline-none font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-1"><CalendarDays size={10}/> Дата старта</label>
                    <input 
                      type="date" 
                      value={profile.target_race_date}
                      onChange={(e) => setProfile({...profile, target_race_date: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-indigo-600 outline-none font-bold text-white [color-scheme:dark]" 
                    />
                  </div>
                </div>
              </section>

              {/* Физиология */}
              <section>
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-blue-600"></span> Физиология
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Рост (см)</label>
                    <input type="number" value={profile.height} onChange={(e) => setProfile({...profile, height: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Вес (кг)</label>
                    <input type="number" step="0.1" value={profile.weight} onChange={(e) => setProfile({...profile, weight: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Max HR</label>
                    <input type="number" value={profile.max_hr} onChange={(e) => setProfile({...profile, max_hr: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Порог HR</label>
                    <input type="number" value={profile.threshold_hr} onChange={(e) => setProfile({...profile, threshold_hr: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold" />
                  </div>
                </div>
              </section>

              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20"
              >
                {saving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />}
                Сохранить профиль
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
