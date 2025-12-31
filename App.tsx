
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
  X,
  BookOpen,
  Clock,
  ArrowLeft
} from 'lucide-react';

// --- Types ---
interface NavLink {
  name: string;
  href: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  fullText: string;
  category: string;
  readTime: string;
  image: string;
}

// --- Data ---
const ARTICLES_DATA: Article[] = [
  {
    id: 1,
    title: 'Что такое пульсовые зоны и как их рассчитать?',
    description: 'Разбираемся в аэробной базе, ПАНО и почему «бежать быстрее» не всегда значит «тренироваться лучше».',
    category: 'Теория',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=1200',
    fullText: `Пульсовые зоны — это диапазоны частоты сердечных сокращений (ЧСС), которые определяют интенсивность вашей тренировки и то, какой ресурс организма вы развиваете в данный момент. Для большинства новичков понимание этих зон становится ключом к прогрессу без травм.

Всего выделяют пять зон. Первая — восстановительная, это очень легкий бег или быстрая ходьба. Вторая зона (Z2) — самая важная для начинающих. Это "разговорный" темп, при котором вы развиваете капиллярную сеть и укрепляете сердце. Бег во второй зоне должен составлять до 80% вашего тренировочного объема. Третья зона — аэробная, здесь темп становится бодрее, но вы все еще можете дышать носом. Четвертая зона — анаэробная (ПАНО), здесь организм начинает вырабатывать лактат быстрее, чем успевает его утилизировать. Пятая — зона максимальной нагрузки, используется для коротких спринтов.

Как рассчитать зоны? Самый простой способ: 220 минус возраст. Но он крайне неточен. Мы в RUN Coach рекомендуем использовать формулу Карвонена (с учетом пульса покоя) или пройти функциональное тестирование. Помните: бегая слишком быстро в надежде похудеть или стать сильнее, вы только изматываете нервную систему. Учитесь бегать медленно, чтобы потом бегать быстро.`
  },
  {
    id: 2,
    title: 'Сколько времени нужно, чтобы подготовиться к забегу?',
    description: 'От дивана до первых 5 км за 8 недель. Реальные сроки подготовки без риска для здоровья.',
    category: 'Планирование',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200',
    fullText: `Подготовка к первому забегу — это не марафон за неделю, а планомерная адаптация связок, мышц и сердечно-сосудистой системы. Оптимальный срок для подготовки к первым 5 км с "нуля" составляет 8-10 недель. За это время организм успеет привыкнуть к ударной нагрузке без риска получить воспаление надкостницы.

Если ваша цель — 10 км, закладывайте 12-14 недель. Первый месяц всегда уходит на создание аэробной базы: много ходьбы, легких пробежек и укрепляющих упражнений (ОФП). Многие совершают ошибку, пытаясь пробежать целевую дистанцию уже на второй неделе. Это прямой путь к травме. Правильный план подразумевает постепенное увеличение недельного километража не более чем на 10%.

Важно учитывать ваш текущий образ жизни. Если у вас сидячая работа и нет спортивного прошлого, вашему телу потребуется больше времени на "перепрошивку". AI RUN Coach анализирует вашу активность и может растянуть план, если видит, что адаптация идет медленнее ожидаемого. Не торопите события — удовольствие от финиша стоит того, чтобы подождать пару лишних недель и прибежать здоровым.`
  },
  {
    id: 3,
    title: 'Бег и лишний вес: с чего начать?',
    description: 'Как начать тренировки, если весы показывают больше нормы, и сохранить суставы здоровыми.',
    category: 'Здоровье',
    readTime: '8 мин',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1200',
    fullText: `Бег часто рассматривают как идеальный инструмент для похудения, но при избыточном весе он может быть коварен. Главная опасность — ударная нагрузка на коленные и голеностопные суставы. При каждом шаге на сустав давит вес, в 3-4 раза превышающий массу тела. Если вес значительно выше нормы, начинать нужно не с бега, а с ходьбы.

Идеальный старт — метод чередования. Например, 2 минуты бодрой ходьбы и 30 секунд очень легкого бега (трусцы). Постепенно доля бега будет расти. Ключевым фактором здесь является пульс: жиросжигание наиболее активно происходит во 2-й пульсовой зоне. Если вы задыхаетесь — вы бежите слишком быстро, и организм переходит на сжигание гликогена, а не жира.

Также критически важна обувь. Кроссовки с максимальной амортизацией (категория Maximal Cushioning) — обязательное условие. И не забывайте про силовые тренировки: крепкие мышцы бедра забирают часть нагрузки с суставов. RUN Coach поможет вам найти этот баланс, отслеживая каждый шаг и не давая вам "перегореть" в первые же две недели. Похудение — это побочный эффект правильного и регулярного движения.`
  },
  {
    id: 4,
    title: 'Как бегать зимой и не заболеть?',
    description: 'Правило трех слоев в одежде, выбор кроссовок с протектором и нюансы дыхания на морозе.',
    category: 'Экипировка',
    readTime: '7 мин',
    image: 'https://images.unsplash.com/photo-1516245556508-7d60d4ff0f39?auto=format&fit=crop&q=80&w=1200',
    fullText: `Зимний бег — это отдельный вид медитации, если вы одеты правильно. Главный принцип зимней экипировки — многослойность. Первый слой (термобелье) отводит влагу от тела. Второй слой (флис или тонкий утеплитель) сохраняет тепло. Третий слой (ветровка или мембрана) защищает от ветра и снега. Никогда не надевайте хлопок: он намокает, остывает и становится ледяным компрессом.

Безопасность на скользких дорогах обеспечивают кроссовки с агрессивным протектором или даже металлическими шипами. Обычная "шоссейная" подошва на морозе дубеет и превращается в лыжи. Что касается дыхания: старайтесь вдыхать носом или через бафф (спортивный шарф), чтобы воздух успевал прогреться перед попаданием в легкие.

Разминку перед зимним бегом лучше делать дома, в тепле. Выходите на улицу уже разогретыми, но не вспотевшими. После пробежки сразу идите в тепло — именно в момент остывания на холоде иммунитет наиболее уязвим. Зима — отличное время для "набора базы" и укрепления голеностопа, так как бег по снегу требует больше усилий для стабилизации. AI-тренер учтет погодные условия и скорректирует темп, чтобы вы не пытались ставить рекорды в сугробах.`
  },
  {
    id: 5,
    title: 'Беговой тренер: для чего он нужен на самом деле?',
    description: 'Экономия времени, предотвращение травм и психология мотивации: почему поддержка важнее цифр.',
    category: 'Эффективность',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    fullText: `Многие новички думают, что тренер нужен только профессионалам, мечтающим об Олимпиаде. На самом деле, тренер больше всего нужен именно на старте. Его главная задача — уберечь вас от типичных ошибок, которые приводят к разочарованию и боли.

Во-первых, это объективный взгляд со стороны. Мы часто склонны либо жалеть себя, либо, наоборот, перерабатывать. Тренер видит общую картину и знает, когда нужно отдохнуть. Во-вторых, это адаптивность. План в журнале не знает, что у вас был тяжелый день на работе или вы плохо спали. Живой тренер (или умный AI) перестроит тренировку так, чтобы она принесла пользу, а не добила ваш ресурс.

В-третьих, это психология. Бег — это монотонное занятие. Наличие человека (или системы), которому вы "сдаете" отчет, повышает дисциплину в разы. RUN Coach объединяет в себе экспертизу топ-тренеров и доступность технологий. Вы получаете поддержку 24/7, ответы на любые вопросы и план, который живет в ритме вашего города. Инвестиция в тренера — это инвестиция в ваше долголетие в спорт. Ведь самая дорогая тренировка — та, которую вы пропустили из-за травмы.`
  }
];

// --- Components ---

const Navbar: React.FC<{ onLogoClick: () => void }> = ({ onLogoClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links: NavLink[] = [
    { name: 'Блог', href: '#blog' },
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'AI-тренер', href: '#ai-coach' },
    { name: 'Тарифы', href: '#pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic tracking-tighter text-white">RC</div>
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

        <div className="mt-20 relative mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="aspect-[16/9] rounded-2xl glass-card overflow-hidden shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2000" alt="Runner Training" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            
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

const BlogSection: React.FC<{ onArticleClick: (article: Article) => void }> = ({ onArticleClick }) => {
  return (
    <section id="blog" className="py-24 relative overflow-hidden bg-zinc-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Блог о разумном беге</h2>
            <p className="text-lg text-slate-400">Учим бегать правильно, осознанно и без вреда для здоровья. Только практические советы от наших экспертов и AI.</p>
          </div>
          <button className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors group px-6 py-3 bg-white/5 rounded-full border border-white/10">
            Все статьи <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {ARTICLES_DATA.map((article, index) => (
            <div 
              key={article.id} 
              onClick={() => onArticleClick(article)}
              className={`group cursor-pointer ${index >= 3 ? 'lg:translate-x-1/2' : ''} transition-all duration-300`}
            >
              <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-2xl bg-zinc-900">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-blue-600 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>{article.readTime} чтения</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-500" />
                    <span>Статья</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                  {article.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ArticleDetailView: React.FC<{ article: Article, onBack: () => void }> = ({ article, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Назад в блог
        </button>
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-widest">
              {article.category}
            </span>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-400 text-sm flex items-center gap-1.5">
              <Clock size={14} /> {article.readTime} чтения
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
            {article.title}
          </h1>
          <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 mb-16 bg-zinc-900">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-slate-300 leading-relaxed mb-8 font-medium">
              {article.description}
            </p>
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
              {article.fullText}
            </div>
          </div>
          
          <div className="mt-20 p-10 glass-card rounded-[2rem] border-blue-500/10 text-center">
            <h3 className="text-2xl font-bold mb-4">Готовы применить знания на практике?</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Начните бесплатную неделю с RUN Coach и получите план, основанный на научном подходе.</p>
            <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all">
              Начать 7 дней бесплатно
            </button>
          </div>
        </div>
      </div>
    </div>
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
            <span className="text-xs font-medium uppercase tracking-widest text-white">Garmin</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">AH</div>
            <span className="text-xs font-medium uppercase tracking-widest text-white">Apple Health</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">ST</div>
            <span className="text-xs font-medium uppercase tracking-widest text-white">Strava</span>
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
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-[10px] italic text-white">RC</div>
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleLogoClick = () => {
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen selection:bg-blue-500 selection:text-white">
      <Navbar onLogoClick={handleLogoClick} />
      
      {selectedArticle ? (
        <ArticleDetailView 
          article={selectedArticle} 
          onBack={() => setSelectedArticle(null)} 
        />
      ) : (
        <>
          <Hero />
          <BlogSection onArticleClick={setSelectedArticle} />
          <ProblemSection />
          <HowItWorks />
          <AICoachSection />
          <Integrations />
          <Comparison />
          <Pricing />
          
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
        </>
      )}
      
      <Footer />
    </main>
  );
};

export default App;
