import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  User, Activity, Save, ArrowLeft, Link as LinkIcon, LogOut, CheckCircle2 
} from 'lucide-react';

interface ProfileProps {
  session: any;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    max_hr: '',
    threshold_hr: '',
    strava_connected: false,
    garmin_connected: false
  });

  // Загрузка данных при открытии
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            height: data.height || '',
            weight: data.weight || '',
            max_hr: data.max_hr || '',
            threshold_hr: data.threshold_hr || '',
            strava_connected: data.strava_connected || false,
            garmin_connected: data.garmin_connected || false,
          });
        }
      } catch (error: any) {
        console.error('Ошибка загрузки:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  // Сохранение данных
  const updateProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updates = {
        id: session.user.id,
        ...formData,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Ошибка:', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Имитация подключения сервисов
  const toggleService = (service: 'strava_connected' | 'garmin_connected') => {
    setFormData(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Activity className="animate-spin text-blue-600 mb-2" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 font-sans animate-in fade-in duration-500">
      
      {/* Шапка */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
        >
          <ArrowLeft size={18} /> 
          <span className="font-bold text-sm">Назад</span>
        </button>
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} /> 
          <span className="font-bold text-sm">Выйти</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Блок 1: Личные данные */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight">ПРОФИЛЬ АТЛЕТА</h2>
              <p className="text-slate-500 text-sm font-medium">{session.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Имя</label>
              <input 
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                placeholder="Имя"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Фамилия</label>
              <input 
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                placeholder="Фамилия"
              />
            </div>
          </div>
        </div>

        {/* Блок 2: Метрики */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Activity className="text-blue-500" size={24} />
            <h3 className="font-black uppercase tracking-widest text-lg">Физические метрики</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Рост (см)', key: 'height', placeholder: '175', color: 'text-blue-400' },
              { label: 'Вес (кг)', key: 'weight', placeholder: '70', color: 'text-blue-400' },
              { label: 'Макс. пульс', key: 'max_hr', placeholder: '190', color: 'text-red-400' },
              { label: 'ПАНО', key: 'threshold_hr', placeholder: '170', color: 'text-orange-400' }
            ].map((field) => (
              <div key={field.key} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <label className={`text-[10px] uppercase font-black ${field.color} block mb-2 tracking-wider`}>{field.label}</label>
                <input 
                  type="number" 
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                  className="w-full bg-transparent text-2xl font-black outline-none placeholder:text-slate-800"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Блок 3: Интеграции */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <LinkIcon className="text-emerald-500" size={24} />
            <h3 className="font-black uppercase tracking-widest text-lg">Подключения</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strava */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${formData.strava_connected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`font-black text-xl italic tracking-tighter ${formData.strava_connected ? 'text-orange-500' : 'text-slate-500'}`}>STRAVA</span>
                <div className={`w-3 h-3 rounded-full ${formData.strava_connected ? 'bg-orange-500 animate-pulse' : 'bg-slate-800'}`} />
              </div>
              <button 
                onClick={() => toggleService('strava_connected')}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.strava_connected 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {formData.strava_connected ? 'Подключено' : 'Подключить'}
              </button>
            </div>

            {/* Garmin */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${formData.garmin_connected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`font-black text-xl italic tracking-tighter ${formData.garmin_connected ? 'text-blue-500' : 'text-slate-500'}`}>GARMIN</span>
                <div className={`w-3 h-3 rounded-full ${formData.garmin_connected ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
              </div>
              <button 
                onClick={() => toggleService('garmin_connected')}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  formData.garmin_connected 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {formData.garmin_connected ? 'Подключено' : 'Подключить'}
              </button>
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="sticky bottom-6 pt-4">
          <button 
            onClick={updateProfile}
            disabled={saving}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${
              saveSuccess 
                ? 'bg-emerald-500 text-white scale-[1.02]' 
                : 'bg-white text-black hover:bg-slate-200 active:scale-95'
            }`}
          >
            {saving ? (
              <>
                <Activity className="animate-spin" size={24} /> Сохранение...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={24} /> Сохранено!
              </>
            ) : (
              <>
                <Save size={24} /> Сохранить изменения
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
