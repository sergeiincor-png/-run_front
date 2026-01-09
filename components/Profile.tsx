import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  User, Activity, Save, ArrowLeft, Link as LinkIcon, 
  LogOut, CheckCircle2, AlertCircle, Target, CalendarDays, Camera, Upload
} from 'lucide-react';

interface ProfileProps {
  session: any;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    avatar_url: '', // Новое поле
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
          avatar_url: data.avatar_url || '',
          strava_connected: data.strava_connected || false,
          garmin_connected: data.garmin_connected || false
        });
      }
    } catch (error: any) {
      console.error('Ошибка загрузки:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Функция загрузки фото
  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Выберите файл для загрузки');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Загружаем файл в бакет 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Получаем публичную ссылку
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Обновляем состояние и базу данных
      setProfile({ ...profile, avatar_url: publicUrl });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id);
      
      setMessage({ type: 'success', text: 'Фото обновлено!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const updates = {
        id: session.user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        max_hr: profile.max_hr ? parseInt(profile.max_hr, 10) : null,
        threshold_hr: profile.threshold_hr ? parseInt(profile.threshold_hr, 10) : null,
        goal_distance_km: profile.goal_distance_km ? parseFloat(profile.goal_distance_km) : null,
        target_race_date: profile.target_race_date || null,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Профиль сохранен!' });
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
        <div className="flex justify-between items-center mb-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold uppercase text-xs">Назад</span>
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-red-500/70 hover:text-red-500 font-bold uppercase text-xs">Выйти</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Блок Аватара */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                <div className="w-full h-full bg-zinc-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white/10" />
                  )}
                </div>
                
                {/* Кнопка загрузки поверх фото */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                  {uploading ? <Activity className="animate-spin text-white" /> : <Camera className="text-white" />}
                </label>
              </div>

              <h3 className="text-xl font-black italic uppercase">{profile.first_name || 'Атлет'}</h3>
              <p className="text-blue-500 text-[10px] font-black uppercase mt-1">Ранг: Активен</p>
            </div>
          </div>

          {/* Форма */}
          <div className="md:col-span-2">
            <form onSubmit={updateProfile} className="space-y-8">
              <section className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Имя</label>
                  <input type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none font-bold" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Фамилия</label>
                  <input type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 focus:border-blue-600 outline-none font-bold" />
                </div>
              </section>

              {/* Цели */}
              <section className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Target size={12}/> Дистанция</label>
                  <input type="number" value={profile.goal_distance_km} onChange={(e) => setProfile({...profile, goal_distance_km: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><CalendarDays size={12}/> Дата</label>
                  <input type="date" value={profile.target_race_date} onChange={(e) => setProfile({...profile, target_race_date: e.target.value})} className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 font-bold [color-scheme:dark]" />
                </div>
              </section>

              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
                {saving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />}
                Сохранить всё
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
