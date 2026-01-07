import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { generateInitialPlan } from './components/aiCoach'
import { Activity, Calendar, Clock, MapPin, Play, Flame, LogIn } from 'lucide-react'

interface TrainingPlan {
  id: string;
  day: string;
  activity: string;
  distance: string;
  duration: string;
  description: string;
  scheduled_date: string;
  is_completed: boolean;
}

function App() {
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [loading, setLoading] = useState(true) // Сразу ставим загрузку, пока ищем юзера
  const [userId, setUserId] = useState<string | null>(null)

  // 1. Функция загрузки плана (принимает ID конкретного юзера)
  const fetchPlan = async (currentUserId: string) => {
    setLoading(true)
    
    // Ищем план в базе
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', currentUserId) // ВАЖНО: Фильтруем по ID юзера
      .order('scheduled_date', { ascending: true })

    if (error) console.error('Ошибка загрузки:', error)
    
    // Если плана нет — генерируем
    if (!data || data.length === 0) {
      console.log("План не найден, генерируем новый...");
      await generateInitialPlan(currentUserId); 
      // После генерации перезагружаем страницу, чтобы подтянуть данные
      window.location.reload(); 
    } else {
      setPlans(data)
    }
    setLoading(false)
  }

  // 2. При старте проверяем, кто залогинен
  useEffect(() => {
    const checkUser = async () => {
      // Спрашиваем у Supabase текущую сессию
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("Пользователь найден:", session.user.id);
        setUserId(session.user.id);
        fetchPlan(session.user.id); // Сразу грузим план для него
      } else {
        console.log("Пользователь не авторизован");
        setLoading(false); // Убираем крутилку, показываем экран входа
      }
    }

    checkUser();
  }, [])

  // Если пользователь не залогинен, показываем простой экран заглушку
  if (!loading && !userId) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
          МОЙ ПЛАН
        </h1>
        <p className="text-slate-400 mb-8">Чтобы получить план тренировок, нужно войти.</p>
        <p className="text-xs text-slate-600">
           (В MVP версии вход должен был быть выполнен на предыдущем шаге. <br/>
           Если вы тестируете локально, убедитесь, что в Supabase есть активная сессия)
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- ШАПКА --- */}
      <header className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              МОЙ ПЛАН
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">AI RUNNING COACH</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <Activity className="w-5 h-5 text-blue-400" />
          </button>
        </div>
      </header>

      {/* --- КОНТЕНТ --- */}
      <main className="max-w-md mx-auto p-6 pb-24 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse">Загрузка тренера...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 p-5 hover:border-blue-500/30 transition-all duration-300 shadow-lg"
              >
                {/* Градиентная подсветка */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Дата */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {new Date(plan.scheduled_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 px-2 py-1 rounded bg-white/5">
                      {plan.day}
                    </span>
                  </div>

                  {/* Активность */}
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {plan.activity}
                  </h3>
                  
                  {/* Описание */}
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {plan.description}
                  </p>

                  {/* Метрики (Цифры!) */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    
                    {/* Дистанция */}
                    {plan.distance && plan.distance !== "-" ? (
                       <div className="flex items-center space-x-1.5">
                         <MapPin className="w-4 h-4 text-emerald-400" />
                         <span className="text-sm font-bold text-white">{plan.distance}</span>
                       </div>
                    ) : null}

                    {/* Время */}
                    {plan.duration ? (
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-white">{plan.duration}</span>
                      </div>
                    ) : null}

                    <div className="ml-auto">
                        <Flame className="w-4 h-4 text-slate-600 group-hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- КНОПКА (декоративная) --- */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button className="pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-blue-500/40 font-bold flex items-center space-x-2 active:scale-95 transition-transform">
          <Play className="w-4 h-4 fill-current" />
          <span>Начать тренировку</span>
        </button>
      </div>

    </div>
  )
}

export default App
