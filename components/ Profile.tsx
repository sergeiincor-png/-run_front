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
  AlertCircle
} from 'lucide-react';

interface ProfileProps {
  session: any;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Состояние полей профиля
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    max_hr: '',
    threshold_hr: '',
    strava_connected: false,
    garmin_connected: false
  });

  useEffect(() => {
    getProfile();
  }, [session]);

  // Загрузка данных профиля из Supabase
  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          height: data.height || '',
          weight: data.weight || '',
          max_hr: data.max_hr || '',
          threshold_hr: data.threshold_hr || '',
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

  // Обновление данных профиля
  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const { user } = session;

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
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
        
        {/* Шапка профиля */}
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase text-xs tracking-widest">Назад к плану</span>
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-red-500/70 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-bold uppercase text-xs tracking-widest">Выйти</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Левая колонка: Аватар и Статус */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="w-24 h-24 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-2xl">
                <User size={48} className="text-white/20" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">
                {profile.first_name || 'Атлет'}
              </h3>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Уровень: Новичок</p>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Интеграции</h4>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#fc4c02] rounded-lg flex items-center justify-center">
                    <LinkIcon size={16} />
                  </div>
                  <span className="text-sm font-bold">Strava</span>
                </div>
                {profile.strava_connected ? <CheckCircle2 className="text-green-500" size={18} /> : <button className="text-[10px] font-black text-blue-500 uppercase">Подключить</button>}
              </div>
            </div>
          </div>

          {/* Правая колонка: Форма настроек */}
          <div className="md:col-span-2">
            <form onSubmit={updateProfile} className="space-y-8">
              
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

              <section>
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 bg-blue-600"></span> Физические параметры
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Рост (см)</label>
                    <input 
                      type="number" 
                      value={profile.height}
                      onChange={(e) => setProfile({...profile, height: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Вес (кг)</label>
                    <input 
                      type="number" 
                      value={profile.weight}
                      onChange={(e) => setProfile({...profile, weight: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Макс. ЧСС</label>
                    <input 
                      type="number" 
                      value={profile.max_hr}
                      onChange={(e) => setProfile({...profile, max_hr: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Порог ЧСС</label>
                    <input 
                      type="number" 
                      value={profile.threshold_hr}
                      onChange={(e) => setProfile({...profile, threshold_hr: e.target.value})}
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all font-bold" 
                    />
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-black uppercase py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 tracking-widest"
              >
                {saving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />}
                Сохранить изменения
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
