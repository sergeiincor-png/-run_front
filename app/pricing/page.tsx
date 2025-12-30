import Nav from "@/components/Nav";
import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <div className="container section">
        <h1 className="h2">Тарифы</h1>
        <p className="p">Начни с бесплатного периода. Дальше — выбираешь, насколько глубоко хочешь “вести” подготовку.</p>

        <div className="grid3" style={{marginTop: 14}}>
          <div className="card">
            <h3 className="h3">Free</h3>
            <p className="p">7 дней бесплатно</p>
            <ul className="ul">
              <li>план на 5–10 км</li>
              <li>правила адаптации</li>
              <li>RPE‑подсказки</li>
            </ul>
          </div>

          <div className="card" style={{borderColor:"rgba(110,231,255,0.45)"}}>
            <h3 className="h3">Pro</h3>
            <p className="p">после триала (цены поставишь позже)</p>
            <ul className="ul">
              <li>больше вариантов тренировок</li>
              <li>пульсовые зоны + рекомендации</li>
              <li>первичные интеграции (по мере запуска)</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="h3">Team / Coach</h3>
            <p className="p">позже</p>
            <ul className="ul">
              <li>ведение нескольких людей</li>
              <li>комментарии</li>
              <li>общие цели</li>
            </ul>
          </div>
        </div>

        <div className="row" style={{marginTop: 18}}>
          <Link className="btn primary" href="/app">Начать 7 дней бесплатно</Link>
          <Link className="btn" href="/faq">FAQ</Link>
        </div>
      </div>
    </>
  );
}
