
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  Activity,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// --- Types ---
interface NavLink {
  name: string;
  href: string;
}

// --- Components ---

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links: NavLink[] = [
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'AI-тренер', href: '#ai-coach' },
    { name: 'Тарифы', href: '#pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic tracking-tighter">RC</div>
          <span className="text-xl font-bold tracking-tight">RUN Coach</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              {link.name}
            </a>
          ))}
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors">
            Попробовать бесплатно
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-white/10 px-6 py-8 absolute top-full left-0 right-0 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            {links.map(link => (
              <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-300">
                {link.name}
              </a>
            ))}
            <button className="bg-white text-black w-full py-4 rounded-xl font-semibold">
              Начать 7 дней бесплатно
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-900/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-900/10 blur-[100px] rounded-full -z-10" />
      
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          AI-поддержка 24/7 доступна в Telegram
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 gradient-text tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Бегайте в удовольствие.<br />Прогрессируйте с AI.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Персональный план подготовки к 5 км или 10 км, который адаптируется под ваше самочувствие, пульс и график. Без травм и выгорания.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-white/5">
            Начать 7 дней бесплатно
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">
            Как это работает
          </button>
        </div>

        {/* Mockup Preview */}
        <div className="mt-20 relative mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="aspect-[16/9] rounded-2xl glass-card overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2000" alt="Runner Training" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            
            {/* Overlay UI elements */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-4 items-end justify-between">
              <div className="glass-card p-4 rounded-xl text-left border-l-4 border-blue-500 max-w-[280px]">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Сегодняшняя цель</p>
                <p className="text-lg font-bold">45 мин. в легком темпе</p>
                <p className="text-sm text-slate-300 mt-2">«Твой пульс был выше нормы вчера. Давай сегодня спокойнее.»</p>
              </div>
              <div className="hidden md:block glass-card p-4 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-blue-500" size={18} />
                  <span className="text-sm font-bold">Пульсовые зоны</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                  <div className="w-1 bg-blue-500/20 h-3 rounded-full"></div>
                  <div className="w-1 bg-blue-500/40 h-5 rounded-full"></div>
                  <div className="w-1 bg-blue-500 h-8 rounded-full"></div>
                  <div className="w-1 bg-blue-500/60 h-6 rounded-full"></div>
                  <div className="w-1 bg-blue-500/30 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProblemSection: React.FC = () => {
  const problems = [
    { title: 'Страх травмы', desc: 'Бег кажется опасным для суставов, если не знать правильную нагрузку.' },
    { title: 'Быстрое выгорание', desc: 'Слишком интенсивные тренировки в начале убивают желание продолжать.' },
    { title: 'Нет ясности', desc: 'Непонятно, с чего начать и как прогрессировать без вреда для здоровья.' },
  ];

  return (
    <section className="py-24 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Почему 80% новичков<br />бросают бег?</h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Мы привыкли думать, что бег — это только сила воли. Но для начинающего бег — это математика нагрузки и восстановление. Большинство планов в интернете слишком жесткие и не учитывают вашу реальную жизнь.
            </p>
            <div className="space-y-6">
              {problems.map(p => (
                <div key={p.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{p.title}</h4>
                    <p className="text-slate-400">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200" 
              alt="Frustrated Runner" 
              className="rounded-3xl shadow-2xl relative z-10 opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    { step: '01', title: 'Выберите цель', desc: 'Подготовка к первой 5 км или уверенные 10 км за 8-12 недель.' },
    { step: '02', title: 'AI строит план', desc: 'Алгоритм анализирует ваш опыт и создает гибкое расписание.' },
    { step: '03', title: 'Обратная связь', desc: 'План подстраивается под ваш сон, стресс и пропущенные дни.' },
    { step: '04', title: 'Финишная черта', desc: 'Мы доведем вас до дня забега в лучшей форме без травм.' },
  ];

  return (
    <section id="how-it-works" className="py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Как это работает</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Четыре шага к вашей первой медали. Интеллектуальный процесс, ориентированный на человека.</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map(s => (
            <div key={s.step} className="glass-card p-8 rounded-2xl border-t-2 border-t-transparent hover:border-t-blue-500 transition-all duration-300">
              <span className="text-4xl font-bold text-blue-500/20 mb-6 block">{s.step}</span>
              <h4 className="text-xl font-bold mb-3">{s.title}</h4>
              <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AICoachSection: React.FC = () => {
  return (
    <section id="ai-coach" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="max-w-md mx-auto relative">
              {/* Telegram UI Mockup */}
              <div className="bg-[#17212b] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div className="bg-[#242f3d] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">RC</div>
                  <div>
                    <p className="font-bold text-sm">RUN Coach (AI)</p>
                    <p className="text-xs text-blue-400">bot, всегда на связи</p>
                  </div>
                </div>
                <div className="p-4 space-y-4 h-[400px] overflow-y-auto">
                  <div className="max-w-[80%] bg-[#2b5278] text-white p-3 rounded-2xl rounded-bl-none text-sm shadow-sm">
                    Привет! Вижу по данным Garmin, что ты вчера мало спал (всего 5.5 часов) и пульс в покое чуть выше нормы. 💤
                  </div>
                  <div className="max-w-[80%] bg-[#2b5278] text-white p-3 rounded-2xl rounded-bl-none text-sm shadow-sm">
                    Давай заменим сегодняшнюю интервальную тренировку на легкую 20-минутную прогулку. Нам важно не допустить перетренированности. Как ты на это смотришь?
                  </div>
                  <div className="ml-auto max-w-[80%] bg-[#182533] border border-white/5 p-3 rounded-2xl rounded-br-none text-sm text-slate-200">
                    Звучит разумно, спасибо за заботу!
                  </div>
                  <div className="max-w-[80%] bg-[#2b5278] text-white p-3 rounded-2xl rounded-bl-none text-sm shadow-sm">
                    Отлично. Обновил план. Твоя цель на сегодня: просто выйти на улицу и подышать. Завтра вернемся к графику! 🚀
                  </div>
                </div>
                <div className="bg-[#242f3d] p-3">
                  <div className="bg-[#17212b] rounded-full px-4 py-2 text-xs text-slate-500">Написать сообщение...</div>
                </div>
              </div>
              
              {/* Floating element */}
              <div className="absolute -bottom-6 -right-6 glass-card p-4 rounded-xl animate-bounce">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-400" size={16} />
                  <span className="text-xs font-bold">Умная адаптация</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">AI — это не просто алгоритм. Это личный наставник.</h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              RUN Coach общается с вами в Telegram как настоящий тренер. Он поддерживает, когда тяжело, и мягко тормозит, когда вы пытаетесь сделать слишком много.
            </p>
            <ul className="space-y-4">
              {[
                'Человеческий стиль общения (поддержка и эмпатия)',
                'Мгновенная реакция на изменения в вашем графике',
                'Анализ качества сна и уровня стресса',
                'Объяснение «зачем» мы делаем каждое упражнение'
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const Integrations: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Ваши данные — в центре внимания</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">GA</div>
            <span className="text-xs font-medium uppercase tracking-widest">Garmin</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">AH</div>
            <span className="text-xs font-medium uppercase tracking-widest">Apple Health</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">ST</div>
            <span className="text-xs font-medium uppercase tracking-widest">Strava</span>
          </div>
        </div>
        <p className="mt-12 text-slate-400 max-w-xl mx-auto">
          Автоматическая синхронизация с вашими часами и смартфонами. Вам не нужно ничего вводить вручную — RUN Coach сам узнает о каждой пробежке.
        </p>
      </div>
    </section>
  );
};

const Comparison: React.FC = () => {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Больше, чем просто план</h2>
        <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden">
          <div className="bg-zinc-900 p-10">
            <h4 className="text-xl font-bold mb-6 text-slate-500 uppercase tracking-widest text-sm">Обычный план из сети</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 line-through">
                <span>Жесткое расписание без гибкости</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 line-through">
                <span>Игнорирует вашу усталость</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 line-through">
                <span>Никто не ответит на вопросы</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 line-through">
                <span>Риск травмы из-за шаблонов</span>
              </li>
            </ul>
          </div>
          <div className="bg-zinc-950 p-10 relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Будущее</span>
            </div>
            <h4 className="text-xl font-bold mb-6 text-blue-400 uppercase tracking-widest text-sm">RUN Coach AI</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span>Адаптация под каждый день жизни</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span>Анализ пульса и сна в реальном времени</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span>Поддержка и мотивация 24/7</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-blue-500" size={18} />
                <span>Научный подход к прогрессу</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-transparent to-zinc-900/50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Прозрачный старт</h2>
        <p className="text-slate-400 mb-12">Мы верим в результат, поэтому даем полную неделю доступа бесплатно.</p>
        
        <div className="glass-card p-10 md:p-16 rounded-[40px] border-2 border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-blue-500/10 blur-[60px] rounded-full -z-10" />
          
          <div className="mb-8">
            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 block">Единый тариф</span>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-bold tracking-tight">990</span>
              <span className="text-xl text-slate-400 mb-2">₽/мес</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-left mb-10 max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-500" size={20} />
              <span className="text-sm">Все дистанции (5к, 10к)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-500" size={20} />
              <span className="text-sm">Безлимитный AI чат</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-500" size={20} />
              <span className="text-sm">Интеграция с часами</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-500" size={20} />
              <span className="text-sm">Умные отчеты еженедельно</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <button className="w-full bg-white text-black py-5 rounded-full font-bold text-xl hover:bg-slate-200 transition-colors shadow-lg">
              Начать 7 дней бесплатно
            </button>
            <p className="text-xs text-slate-500">Отмена подписки в любой момент. Первый платеж только через неделю.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-[10px] italic">RC</div>
          <span className="font-bold tracking-tight">RUN Coach</span>
        </div>
        
        <div className="flex gap-8 text-sm text-slate-500">
          <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
          <a href="#" className="hover:text-white transition-colors">Условия использования</a>
          <a href="#" className="hover:text-white transition-colors">Поддержка</a>
        </div>
        
        <p className="text-xs text-slate-600">© 2025 RUN Coach. Все права защищены.</p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <main className="min-h-screen selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <AICoachSection />
      <Integrations />
      <Comparison />
      <Pricing />
      
      {/* Final CTA */}
      <section className="py-32 text-center bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/5 blur-[100px] rounded-full -z-10" />
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 gradient-text">Ваша лучшая пробежка еще впереди.</h2>
          <p className="text-xl text-slate-400 mb-10">Сделайте первый шаг сегодня. Мы будем рядом на каждом километре.</p>
          <button className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
            Попробовать бесплатно
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
      
      <Footer />
    </main>
  );
};

export default App;
