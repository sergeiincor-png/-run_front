import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { generateInitialPlan } from './components/aiCoach'
import { Activity, Calendar, Clock, MapPin, Play, Flame, CheckCircle, Circle } from 'lucide-react'

interface TrainingPlan {
  id: string;
  day: string;
  activity: string;
  distance: string;
  duration: string;
  description: string;
  scheduled_date: string;
  is_completed: boolean; // Теперь это поле реально работает
}

function App() {
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchPlan = async (currentUserId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', currentUserId)
      .order('scheduled_date', { ascending: true })

    if (error) console.error('Ошибка:', error)
    
    if (!data || data.length === 0) {
      await generateInitialPlan(currentUserId); 
      window.location.reload(); 
    } else {
      setPlans(data)
    }
    setLoading(false)
  }

  // --- НОВАЯ ФУНКЦИЯ: Ставим галочку ---
  const toggleComplete = async (planId: string, currentStatus: boolean) => {
    // 1. Оптимистичное обновление интерфейса (сразу красим в зеленый, не ждем базу)
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, is_completed: !currentStatus } : p
    ))

    // 2. Отправляем в базу
    const { error } = await supabase
      .from('training_plans')
      .update({ is_completed: !currentStatus })
      .eq('id', planId)

    if (error) {
      console.error('Ошибка обновления:', error)
      alert("Не удалось сохранить статус. Проверь интернет.")
      // Если ошибка — откатываем обратно (редкий кейс)
      setPlans(plans.map(p => 
        p.id === planId ? { ...p, is_completed: currentStatus } : p
      ))
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        fetchPlan(session.user.id);
      } else {
        setLoading(false);
      }
    }
    checkUser();
  }, [])

  if (!loading && !userId) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">МОЙ ПЛАН</h1>
        <p className="text-slate-400">Войдите, чтобы увидеть тренировки.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      <header className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              МОЙ ПЛАН
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">AI RUNNING COACH</p>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
            <Activity className="w-5 h-5 text-blue-400" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 pb-24 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                // --- ДИНАМИЧЕСКИЕ СТИЛИ ---
                // Если выполнено: зеленый фон и бордер. Если нет: обычный синий.
                className={`
                  group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 shadow-lg
                  ${plan.is_completed 
                    ? 'bg-emerald-900/20 border-emerald-500/50 shadow-emerald-900/20' 
                    : 'bg-slate-800/50 border-white/5 hover:border-blue-500/30'}
                `}
              >
                {/* Градиент при наведении */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${plan.is_completed ? 'from-emerald-500/10' : 'from-blue-500/10'}`} />

                <div className="relative z-10">
                  {/* Верх: Дата + ЧЕКБОКС */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${plan.is_completed ? 'text-emerald-400' : 'text-blue-400'}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${plan.is_completed ? 'text-emerald-100' : 'text-slate-200'}`}>
                        {new Date(plan.scheduled_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>

                    {/* --- КНОПКА ВЫПОЛНЕНИЯ --- */}
                    <button 
                      onClick={() => toggleComplete(plan.id, plan.is_completed)}
                      className={`
                        flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95
                        ${plan.is_completed 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' 
                          : 'bg-white/10 text-slate-400 hover:bg-white/20'}
                      `}
                    >
                      {plan.is_completed ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>ГОТОВО</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>Сделать</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className={`text-lg font-bold mb-1 transition-colors ${plan.is_completed ? 'text-emerald-50' : 'text-white group-hover:text-blue-300'}`}>
                    {plan.activity}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed mb-4 ${plan.is_completed ? 'text-emerald-200/70' : 'text-slate-400'}`}>
                    {plan.description}
                  </p>

                  <div className={`flex items-center gap-4 pt-4 border-t ${plan.is_completed ? 'border-emerald-500/20' : 'border-white/5'}`}>
                    
                    {plan.distance && plan.distance !== "-" && (
                       <div className="flex items-center space-x-1.5">
                         <MapPin className={`w-4 h-4 ${plan.is_completed ? 'text-emerald-300' : 'text-emerald-400'}`} />
                         <span className="text-sm font-bold text-white">{plan.distance}</span>
                       </div>
                    )}

                    {plan.duration && (
                      <div className="flex items-center space-x-1.5">
                        <Clock className={`w-4 h-4 ${plan.is_completed ? 'text-emerald-300' : 'text-orange-400'}`} />
                        <span className="text-sm font-bold text-white">{plan.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
