import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  User, 
  LayoutDashboard,
  Target
} from 'lucide-react';
import Profile from './Profile.tsx'; 

const Dashboard: React.FC<{ session: any }> = ({ session }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]); 
  const [userProfile, setUserProfile] = useState<any>(null); // Состояние для данных профиля
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setIsLoading(true);

    try {
      // Загружаем тренировки, планы И данные профиля одновременно
      const [factRes, planRes, profileRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('training_plans').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);

      const combined = [
        ...(factRes.data || []).map((f: any) => ({ ...f, source: 'FACT', date: f.activity_date })),
        ...(planRes.data || []).map((p: any) => ({ ...p, source: 'PLAN', date: p.scheduled_date.split('T')[0] }))
      ];
      
      setWorkouts(combined);
      if (profileRes.data) setUserProfile(profileRes.data); // Сохраняем профиль (имя, фото)
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => { 
    if (!showProfile) fetchData(); 
  }, [currentDate, session, showProfile]);

  if (showProfile) {
    return <Profile session={session} onBack={() => setShowProfile(false)} />;
  }

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArr = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard size={20} />
             </div>
             <span className="font-black italic text-xl tracking-tighter uppercase">Run Coach</span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><ChevronLeft size={18} /></button>
            <h2 className="text-xs font-black uppercase tracking-widest min-w-[120px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* Кнопка Профиля с Именем и Фото */}
        <button 
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 pl-2 pr-4 py-2 rounded-2xl border border-white/5 transition-all group"
        >
          {/* Отображаем фото, если оно есть, иначе иконку */}
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-blue-400" />
            )}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-widest leading-none">
              {userProfile?.first_name || 'Атлет'}
            </div>
            <div className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter mt-0.5">Открыть профиль</div>
          </div>
        </button>
      </div>

      {/* Календарь */}
      <div className="grid grid-cols-7 gap-2 max-w-6xl mx-auto">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className="text-center text-slate-700 text-[10px] font-black mb-2 uppercase">{d}</div>
        ))}
        {daysArr.map((day, idx) => (
          <div key={idx} className={`min-h-[110px] p-2 border border-white/5 rounded-xl transition-all ${day ? 'bg-[#0a0a0a] hover:border-white/10' : 'bg-transparent border-none'}`}>
            {day && <span className="text-[10px] font-bold text-slate-600">{day}</span>}
            {day && workouts.filter(w => {
               const d = new Date(w.date);
               return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            }).map(w => (
              <div key={w.id} className={`mt-1.5 p-1.5 border rounded-lg text-[9px] font-bold leading-tight ${w.source === 'FACT' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/5 border-blue-500/10 text-blue-400 border-dashed'}`}>
                <div className="flex items-center gap-1">
                  {w.source === 'PLAN' && <span>🤖</span>}
                  <span className="truncate">{w.title || w.activity}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
