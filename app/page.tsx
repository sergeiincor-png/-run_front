import Link from "next/link";
import Nav from "@/components/Nav";
import { Section } from "@/components/Section";

export default function HomePage() {
  return (
    <>
      <Nav />
      <div className="hero">
        <div className="container">
          <div className="pill">ИИ-тренер по бегу · 5–10 км · 7 дней бесплатно</div>
          <h1 className="h1">План бега, который подстраивается под тебя — а не наоборот</h1>
          <p className="sub">
            RUN coach соберёт понятный план для новичка, поможет держать нагрузку в норме по самочувствию и пульсу
            и скажет, что делать, если ты пропустил тренировку или “не в ресурсе”.
          </p>
          <div className="row">
            <Link className="btn primary" href="/app">Начать 7 дней бесплатно</Link>
            <Link className="btn" href="/pricing">Посмотреть тарифы</Link>
          </div>
          <div className="kpi" style={{marginTop: 16}}>
            <span>✅ без сложных терминов</span>
            <span>✅ 3–4 тренировки/нед</span>
            <span>✅ адаптация “по состоянию”</span>
            <span>✅ пульс + RPE</span>
          </div>
        </div>
      </div>

      <Section title="Как это работает (за 2 минуты)">
        <div className="grid3">
          <div className="card">
            <h3 className="h3">1) Вводишь цель</h3>
            <p className="p">Дистанция 5–10 км, дата старта/забега, сколько дней в неделю готов заниматься.</p>
          </div>
          <div className="card">
            <h3 className="h3">2) Получаешь план</h3>
            <p className="p">План по дням: лёгкие, интервалы, “длинная”, отдых. Пояснения человеческим языком.</p>
          </div>
          <div className="card">
            <h3 className="h3">3) План адаптируется</h3>
            <p className="p">Плохой сон, усталость, стресс? RUN coach подскажет, как не сорваться и не перегореть.</p>
          </div>
        </div>
      </Section>

      <Section title="Три главные ценности">
        <div className="grid3">
          <div className="card">
            <h3 className="h3">План</h3>
            <p className="p">Не “табличка из интернета”, а структура, которая подходит новичку.</p>
            <ul className="ul">
              <li>прогрессия нагрузки</li>
              <li>разминка/заминка</li>
              <li>облегчённые недели</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="h3">Адаптация</h3>
            <p className="p">Если жизнь вмешалась — ты не “слился”, ты скорректировал план.</p>
            <ul className="ul">
              <li>правила “если устал — делай так”</li>
              <li>замены тренировок</li>
              <li>безопасный откат</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="h3">Контроль нагрузки</h3>
            <p className="p">Пульс (если есть) + субъективная нагрузка, чтобы не “убиваться”.</p>
            <ul className="ul">
              <li>зоны Z1–Z5</li>
              <li>RPE 1–10</li>
              <li>подсказки по восстановлению</li>
            </ul>
          </div>
        </div>
        <div className="card" style={{marginTop: 14}}>
          <div className="badge">Мини‑пример</div>
          <p className="p" style={{marginTop: 10}}>
            Ты пропустил интервалы из‑за работы. RUN coach предложит: перенести интервалы на завтра <b>или</b> заменить их на лёгкий бег 30–40 минут (Z2 / RPE 3–4),
            а “длинную” оставить на выходные — чтобы неделя не развалилась.
          </p>
        </div>
      </Section>

      <Section title="С чем будет дружить (интеграции)">
        <div className="card">
          <p className="p">
            В MVP мы готовим основу интеграций с популярными сервисами. Идея простая: тренировки и пульс подтягиваются автоматически,
            а RUN coach подсказывает корректировки. Список интеграций расширим по мере запуска.
          </p>
          <p className="p" style={{marginTop: 10, color: "rgba(234,240,255,0.8)"}}>
            Пример: Strava / Garmin / Polar / Coros — как минимум импорт активностей и пульса.
          </p>
        </div>
      </Section>

      <Section title="Готов начать?">
        <div className="card">
          <h3 className="h3">7 дней бесплатно — без сложностей</h3>
          <p className="p">Регистрируешься по почте → получаешь код → создаёшь план.</p>
          <div className="row">
            <Link className="btn primary" href="/app">Начать 7 дней бесплатно</Link>
            <Link className="btn" href="/faq">Почитать FAQ</Link>
          </div>
        </div>
      </Section>

      <div className="footer">
        <div className="container">
          <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
            <div>© {new Date().getFullYear()} RUN coach</div>
            <div style={{display:"flex", gap:12}}>
              <a href="/privacy">Политика</a>
              <a href="/terms">Условия</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
