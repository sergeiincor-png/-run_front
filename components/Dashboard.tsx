import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Dumbbell,     
  Plus,         
  Play,         
  ExternalLink, 
  X,            
  Save          
} from 'lucide-react';
import CalendarView from './CalendarView';

interface DashboardProps {
  user: any;
}

// Тип для упражнения
interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string; // Ссылка на видео
  embedUrl?: string; // Ссылка для плеера (iframe)
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  
  // Состояние для Базы Упражнений
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({ title: '', category: 'СБУ', description: '', videoUrl: '' });
  
  // --- БАЗА УПРАЖНЕНИЙ ---
  // Оставили только одну реальную запись с RuTube
  const [exercises, setExercises] = useState<Exercise[]>([
    { 
      id: '1', 
      title: 'СБУ: Бег с высоким подниманием бедра', 
      category: 'СБУ', 
      description: 'Ключевое упражнение для отработки правильного выноса бедра и постановки стопы под центр тяжести. Развивает силу мышц-сгибателей, улучшает межмышечную координацию и повышает каденс. Важно: держите корпус вертикально, не отклоняйтесь назад, активно работайте руками, как при беге.', 
      videoUrl: 'https://rutube.ru/video/d20386334ae35d8bb2ade76fbdcd0b25/',
      embedUrl: 'https://rutube.ru/play/embed/d20386334ae35d8bb2ade76fbdcd0b25' // Специальная ссылка для плеера
    }
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Хелпер для превращения ссылок RuTube в Embed (для будущих видео)
  const getEmbedUrl = (url: string) => {
    // Простая логика: если это рутуб, пытаемся достать ID и сделать embed
    if (url.includes('rutube.ru')) {
        // Извлекаем ID из ссылки вида rutube.ru/video/ID/
        const match = url.match(/\/video\/([a-zA-Z0-9]+)/);
        if (match && match[1]) {
            return `https://rutube.ru/play/embed/${match[1]}`;
        }
    }
    return url; // Если не распознали, возвращаем как есть
  };

  const saveExercise = () => {
    if (!newExercise.title || !newExercise.videoUrl) return;
    
    const embed = getEmbedUrl(newExercise.videoUrl);

    const item: Exercise = {
      id: crypto.randomUUID(),
      title: newExercise.title!,
      category: newExercise.category || 'Разное',
      description: newExercise.description || '',
      videoUrl: newExercise.videoUrl!,
      embedUrl: embed 
    };
    setExercises([...exercises, item]);
    setIsExerciseModalOpen(false);
    setNewExercise({ title: '', category: 'СБУ', description: '', videoUrl: '' });
  };

  const navItems = [
    { id: 'calendar', icon: <CalendarIcon size={24} />, label: 'Календарь' },
    { id: 'exercises', icon: <Dumbbell size={24} />, label: 'База упражнений' }, 
    { id: 'analytics', icon: <BarChart3 size={24} />, label: 'Аналитика' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Настройки' },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-slate-200 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-20 md:w-24 border-r border-white/5 flex flex-col items-center py-10 gap-10 bg-black/20 backdrop-blur-xl z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold italic text-white shadow-lg shadow-blue-600/20">RC</div>
        
        <nav className="flex-grow flex flex-col gap-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[70] border border-white/10 shadow-xl">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut size={24} />
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white uppercase tracking-widest">
              {activeTab === 'calendar' ? 'Твой План' : 
               activeTab === 'exercises' ? 'База Знаний' : 
               activeTab === 'analytics' ? 'Аналитика' : 'Настройки'}
            </h1>
            <div className="h-6 w-px bg-white/10" />
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-6 text-sm outline-none focus:border-white/10 w-64 text-slate-300 placeholder:text-slate-600" placeholder="Поиск..." />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#09090b]" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Уровень: Базовый</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#09090b]">
          
          {/* 1. КАЛЕНДАРЬ */}
          {activeTab === 'calendar' && <CalendarView />}

          {/* 2. БАЗА УПРАЖНЕНИЙ */}
          {activeTab === 'exercises' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
              
              <div className="flex justify-between items-end mb-10">
                <div>
                   <h2 className="text-3xl font-bold text-white mb-2">Библиотека упражнений</h2>
                   <p className="text-slate-500">Техника бега, ОФП и восстановление. Все в одном месте.</p>
                </div>
                <button 
                  onClick={() => setIsExerciseModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  <Plus size={20} />
                  Добавить
                </button>
              </div>

              {/* Сетка карточек */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((ex) => (
                  <div key={ex.id} className="group bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.07] flex flex-col shadow-lg">
                    
                    {/* ПЛЕЕР ВИДЕО (IFRAME) */}
                    <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                       {ex.embedUrl ? (
                         <iframe 
                           src={ex.embedUrl} 
                           className="w-full h-full absolute inset-0" 
                           allow="clipboard-write; autoplay" 
                           allowFullScreen 
                           title={ex.title}
                         />
                       ) : (
                         // Фолбек, если видео не распознано
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                            <Play size={32} className="text-white opacity-50" />
                         </div>
                       )}
                       
                       {/* Бейдж категории */}
                       <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 z-20 border border-white/10 pointer-events-none">
                         {ex.category}
                       </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors">
                        {ex.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-4">
                        {ex.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <a 
                          href={ex.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                          Открыть оригинал <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. АНАЛИТИКА (Заглушка) */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6 opacity-50">
               <BarChart3 size={48} />
               <div className="text-center"><p className="font-bold text-white text-xl mb-2">Модуль аналитики</p><p className="text-sm uppercase tracking-widest">В разработке</p></div>
            </div>
          )}

          {/* 4. НАСТРОЙКИ (Как было) */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto glass-card p-10 rounded-[3rem] border-white/5">
               <h2 className="text-2xl font-bold mb-10 text-white">Настройки профиля</h2>
               <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                     <div><p className="text-sm font-bold text-white">Интеграция Garmin</p><p className="text-xs text-slate-500">Автосинхронизация тренировок</p></div>
                     <button className="text-blue-500 text-xs font-bold uppercase tracking-widest">Подключить</button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                     <div><p className="text-sm font-bold text-white">Уведомления AI</p><p className="text-xs text-slate-500">Отправлять отчеты в Telegram</p></div>
                     <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto" /></div>
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* --- МОДАЛЬНОЕ ОКНО --- */}
        {isExerciseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#18181b] w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#202023]">
                <h3 className="text-lg font-bold text-white">Добавить упражнение</h3>
                <button onClick={() => setIsExerciseModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Название</label>
                  <input type="text" value={newExercise.title} onChange={e => setNewExercise({...newExercise, title: e.target.value})} placeholder="Название упражнения" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Категория</label>
                  <select value={newExercise.category} onChange={e => setNewExercise({...newExercise, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none appearance-none font-medium">
                    <option>СБУ</option><option>Силовая</option><option>Растяжка</option><option>Техника</option><option>Разное</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ссылка на видео (Rutube / VK)</label>
                  <input type="text" value={newExercise.videoUrl} onChange={e => setNewExercise({...newExercise, videoUrl: e.target.value})} placeholder="https://rutube.ru/video/..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Описание</label>
                  <textarea rows={4} value={newExercise.description} onChange={e => setNewExercise({...newExercise, description: e.target.value})} placeholder="Техника выполнения..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none text-sm leading-relaxed" />
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-[#202023] flex justify-end gap-3">
                 <button onClick={() => setIsExerciseModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors">Отмена</button>
                 <button onClick={saveExercise} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"><Save size={18} /> Сохранить</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
