
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabaseClient';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Activity,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  LogOut,
  Mail,
  Lock,
  Loader2,
  User,
  Smartphone,
  Info,
  Trophy,
  BarChart3,
  Calendar,
  Heart,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

// --- Types & Constants ---
interface Article {
  id: number;
  title: string;
  description: string;
  fullText: string;
  category: string;
  readTime: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Пульсовые зоны для новичков: Z2 — ваш лучший друг',
    description: 'Почему бегать медленно — это самый быстрый путь к результату и здоровому сердцу.',
    category: 'Теория',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=1200',
    fullText: `Многие новички совершают одну и ту же ошибку: они стараются бежать так быстро, как могут, на каждой тренировке. Это приводит к быстрому закислению, высокому пульсу и разочарованию.\n\nВ RUN Coach мы фокусируемся на тренировках во второй пульсовой зоне (Z2). Это "разговорный темп", когда вы можете комфортно общаться во время бега. Именно в этом режиме ваше сердце укрепляется, а капиллярная сеть в мышцах разрастается, создавая фундамент для будущих рекордов. Наш AI-тренер будет внимательно следить, чтобы вы не "залетали" в красную зону раньше времени.`
  },
  {
    id: 2,
    title: 'Как выбрать первые кроссовки и не разориться',
    description: 'Разбираемся в пронации, амортизации и том, стоит ли покупать флагманские модели.',
    category: 'Экипировка',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    fullText: `Ваши кроссовки — это единственный инструмент, который действительно важен. Для 5 км или 10 км вам не нужны карбоновые пластины за 30 тысяч рублей. Вам нужна стабильность и адекватная амортизация.\n\nГлавный совет: идите в специализированный магазин с беговой дорожкой. Но даже если вы покупаете онлайн, ориентируйтесь на модели категории Daily Trainer. Они прощают ошибки техники и служат до 800-1000 километров.`
  },
  {
    id: 3,
    title: 'Психология первого старта: как победить мандраж',
    description: 'Практические советы по подготовке к дню забега: от сна до завтрака.',
    category: 'Психология',
    readTime: '4 мин',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1200',
    fullText: `Забег — это праздник, а не экзамен. Волнение перед стартом — это нормально, это ваш организм готовится к нагрузке. Чтобы утро прошло гладко, подготовьте всё с вечера: приколите номер на футболку, завяжите шнурки и проверьте зарядку часов.\n\nНаш AI-тренер пришлет вам персональную инструкцию за 24 часа до старта, чтобы вы чувствовали поддержку в каждую минуту.`
  }
];

// --- Sub-components ---

const SectionTitle: React.FC<{ title: string; subtitle?: string; centered?: boolean }> = ({ title, subtitle, centered }) => (
  <div className={`mb-16 ${centered ? 'text-center' : 'text-left'}`}>
    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">{title}</h2>
    {subtitle && <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

const IntegrationCard: React.FC<{ name: string; icon: string; status: string }> = ({ name, icon, status }) => (
  <div className="glass-card p-6 rounded-3xl flex items-center gap-4 border-white/5 hover:border-blue-500/20 transition-all group">
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-white">{name}</h4>
      <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">{status}</p>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    generateHeroImage();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const generateHeroImage = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: 'Cinematic wide shot of a runner at blue hour, futuristic minimalist aesthetic, graphite and midnight blue tones, abstract data HUD overlays, sharp focus, 8k, SaaS 2025 product style.' }] },
        config: { imageConfig: { aspectRatio: "16:9" } },
      });
      const base64 = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
      if (base64) setHeroImage(`data:image/png;base64,${base64}`);
    } catch (e) {
      setHeroImage('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2000');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCtaClick = () => {
    if (!user) setIsAuthModalOpen(true);
    else alert('Ваш план уже в Telegram! Проверьте сообщения.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-xl py-4 border-b border-white/5' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { setSelectedArticle(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold italic text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-all">RC</div>
            <span className="text-2xl font-bold tracking-tighter text-white">RUN Coach</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Как это работает</a>
            <a href="#blog" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Блог</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Тарифы</a>
            
            <div className="h-6 w-px bg-white/10 mx-2" />
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Атлет</span>
                  <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                </div>
                <button onClick={logout} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition-all shadow-lg"
              >
                Начать бесплатно
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {selectedArticle ? (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 group transition-colors">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Назад в блог
          </button>
          <img src={selectedArticle.image} className="w-full aspect-video object-cover rounded-[2.5rem] mb-12 shadow-2xl border border-white/5" alt={selectedArticle.title} />
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-full uppercase tracking-widest">{selectedArticle.category}</span>
            <span className="text-slate-500 text-sm flex items-center gap-1.5"><Clock size={14}/> {selectedArticle.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight">{selectedArticle.title}</h1>
          <p className="text-xl text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedArticle.fullText}</p>
          
          <div className="mt-20 p-12 glass-card rounded-[3rem] text-center border-blue-600/10">
            <h3 className="text-3xl font-bold mb-4">Готовы к первой тренировке?</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">Попробуйте наш AI-тренер бесплатно в течение 7 дней.</p>
            <button onClick={handleCtaClick} className="bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl">
              Начать бесплатно
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative pt-48 pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
            <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-10 animate-in fade-in slide-in-from-bottom-4">
                <Sparkles size={14} className="animate-pulse" />
                Будущее бега уже здесь
              </div>
              <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Твой бег.<br />Наш интеллект.
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Персональный AI-тренер, который не просто дает план, а адаптирует его под каждый удар твоего сердца. Готовим к 5 и 10 км без стресса.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <button onClick={handleCtaClick} className="w-full sm:w-auto px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">
                  Начать 7 дней бесплатно
                </button>
                <button onClick={generateHeroImage} disabled={isGenerating} className="w-full sm:w-auto px-8 py-5 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-3 backdrop-blur-md">
                  {isGenerating ? <Loader2 className="animate-spin text-blue-500" size={20} /> : <RefreshCw size={20} className="text-blue-500" />}
                  Обновить визуал
                </button>
              </div>

              <div className="relative mx-auto max-w-5xl rounded-[3rem] overflow-hidden glass-card p-3 animate-in zoom-in-95 duration-1000">
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-video">
                  {heroImage ? (
                    <img src={heroImage} className="w-full h-full object-cover opacity-80 mix-blend-screen" alt="Hero" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-blue-500" size={48} />
                      <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Генерация атмосферы...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  
                  {/* Floating Dashboard Elements */}
                  <div className="absolute bottom-10 left-10 text-left glass-card p-6 rounded-3xl border-l-4 border-blue-500 max-w-xs animate-in slide-in-from-left duration-1000">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Цель сегодня</p>
                    <p className="text-xl font-bold text-white mb-2">45 мин. Легкий бег</p>
                    <p className="text-sm text-slate-400">«Твой пульс вчера был чуть выше нормы. Давай сегодня в Z2.»</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Problems Section */}
          <section className="py-32 bg-zinc-900/20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1 relative">
                  <div className="absolute -inset-10 bg-red-600/5 blur-[100px] rounded-full" />
                  <div className="relative glass-card p-12 rounded-[3rem] border-red-500/10">
                    <h3 className="text-3xl font-bold mb-10 text-white">Почему новички бросают?</h3>
                    <div className="space-y-10">
                      {[
                        { icon: <ShieldCheck className="text-red-400" />, title: 'Травмы и перегрузки', text: 'Попытки бежать быстрее, чем готов организм, убивают суставы.' },
                        { icon: <Zap className="text-red-400" />, title: 'Потеря мотивации', text: 'Статичные планы не прощают пропусков, вызывая чувство вины.' },
                        // Fixed: Corrected lowercase 'loader2' to 'Loader2' component
                        { icon: <Loader2 className="text-red-400" />, title: 'Отсутствие прогресса', text: 'Бег без понимания пульсовых зон ведет к плато.' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-xl mb-1 text-white">{item.title}</h4>
                            <p className="text-slate-400 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <SectionTitle title="Бег должен радовать, а не изматывать." />
                  <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                    Традиционные тренировочные планы — это просто список дат и цифр. Они не знают, что вы не выспались, заболели или просто устали после работы. 
                  </p>
                  <p className="text-xl text-slate-400 leading-relaxed">
                    RUN Coach — это живая система, которая перестраивается под вас в реальном времени. Мы убираем лишнее, чтобы оставить главное — удовольствие от процесса.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className="py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              <SectionTitle title="Знания — это ваша база" subtitle="Учим бегать осознанно, а не просто переставлять ноги." />
              <div className="grid md:grid-cols-3 gap-10">
                {ARTICLES.map((article) => (
                  <div 
                    key={article.id} 
                    onClick={() => setSelectedArticle(article)}
                    className="group cursor-pointer glass-card rounded-[2.5rem] overflow-hidden border-white/5 hover:border-blue-500/20 transition-all flex flex-col h-full"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={article.title} />
                      <div className="absolute top-6 left-6">
                        <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">{article.category}</span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-semibold uppercase tracking-wider">
                        <Clock size={14} className="text-blue-500" /> {article.readTime} чтения
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors leading-tight">{article.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{article.description}</p>
                      <div className="mt-auto pt-8 flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest">
                        Читать дальше <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI Coach Telegram Interaction */}
          <section className="py-32 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div>
                  <SectionTitle title="Тренер, который всегда онлайн" />
                  <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                    Никаких сложных графиков и перегруженных интерфейсов. Всё управление тренировками происходит через привычный Telegram.
                  </p>
                  <div className="space-y-6">
                    {[
                      'Голосовые и текстовые отчеты',
                      'Моментальная коррекция при пропуске тренировки',
                      'Рекомендации по темпу в зависимости от погоды',
                      'Анализ качества сна и уровня стресса'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
                          <CheckCircle2 className="text-blue-500" size={14} />
                        </div>
                        <span className="text-lg font-medium text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full" />
                  <div className="relative bg-[#17212b] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 max-w-sm mx-auto">
                    <div className="bg-[#242f3d] px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner">RC</div>
                      <div>
                        <p className="font-bold text-lg leading-none">RUN Coach (AI)</p>
                        <p className="text-xs text-blue-400 font-medium tracking-tight">всегда рядом</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-6 h-[450px] overflow-y-auto scrollbar-hide">
                      <div className="max-w-[85%] bg-[#2b5278] text-white p-4 rounded-3xl rounded-bl-none text-sm shadow-lg leading-relaxed">
                        Привет! Вижу по данным Garmin, что ты вчера мало спал (всего 5 часов). 😴
                      </div>
                      <div className="max-w-[85%] bg-[#2b5278] text-white p-4 rounded-3xl rounded-bl-none text-sm shadow-lg leading-relaxed">
                        Вместо темпового бега на 8 км, давай сделаем легкую прогулку на 30 минут. Нам важно не перегрузить сердце.
                      </div>
                      <div className="ml-auto max-w-[80%] bg-[#182533] border border-white/5 p-4 rounded-3xl rounded-br-none text-sm text-slate-200">
                        Ок, понял. А завтра сможем пробежать?
                      </div>
                      <div className="max-w-[85%] bg-[#2b5278] text-white p-4 rounded-3xl rounded-bl-none text-sm shadow-lg leading-relaxed">
                        Да, если выспишься! Я уже перестроил план на неделю. Отдыхай, атлет! 🚀
                      </div>
                    </div>
                    <div className="p-4 bg-[#242f3d]/50 backdrop-blur-md">
                      <div className="bg-[#17212b] rounded-full px-5 py-3 text-sm text-slate-500 border border-white/5">Напишите тренеру...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="py-32">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <SectionTitle title="Синхронизация с вашим миром" centered />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <IntegrationCard name="Garmin" icon="G" status="Полная синхронизация" />
                <IntegrationCard name="Apple Health" icon="A" status="Активность и сон" />
                <IntegrationCard name="Strava" icon="S" status="Социальный шеринг" />
                <IntegrationCard name="Polar / Suunto" icon="P" status="В разработке" />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-40 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-blue-600/5 blur-[150px] -z-10" />
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter text-white">Инвестируй в результат.</h2>
              <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-blue-500/20 shadow-2xl relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-xl">7 дней за 0 ₽</div>
                <div className="mb-12">
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-8xl font-black tracking-tighter text-white">990</span>
                    <span className="text-2xl text-slate-500 font-bold">₽/мес</span>
                  </div>
                  <p className="text-slate-400 font-medium">Без скрытых платежей. Отмена в 1 клик.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-left mb-16">
                  {['Адаптивный AI-план', 'Безлимитный чат', 'Анализ сна и HRV', 'Интеграция с часами', 'Аудио-коучинг', 'Еженедельные отчеты'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-blue-500 flex-shrink-0" />
                      <span className="text-slate-200 font-semibold">{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleCtaClick} className="w-full bg-white text-black py-6 rounded-3xl font-black text-2xl hover:bg-slate-200 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">
                  Попробовать бесплатно
                </button>
              </div>
            </div>
          </section>

          <footer className="py-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic text-white">RC</div>
                  <span className="text-xl font-bold tracking-tight">RUN Coach</span>
                </div>
                <div className="flex gap-10 text-sm font-semibold text-slate-500">
                  <a href="#" className="hover:text-white transition-colors">Политика</a>
                  <a href="#" className="hover:text-white transition-colors">Условия</a>
                  <a href="#" className="hover:text-white transition-colors">Поддержка</a>
                </div>
                <div className="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2025 RUN Coach. Все права защищены.</div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (error) throw error;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card w-full max-w-md p-10 rounded-[3rem] relative animate-in zoom-in-95 duration-300 border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl italic mx-auto mb-6 text-white shadow-xl">RC</div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <p className="text-slate-400 font-medium">Твой AI-тренер ждет тебя</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-6 flex gap-2"><Info size={16}/>{error}</div>}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Электронная почта</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500 transition-colors text-white" placeholder="athlete@run.coach" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500 transition-colors text-white" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl mt-6">
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-slate-400 hover:text-white mt-8 font-medium">{isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть профиль? Войдите'}</button>
      </div>
    </div>
  );
};

export default App;
