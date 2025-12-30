import Nav from "@/components/Nav";
import { getUserFromRequest } from "@/lib/auth";
import Link from "next/link";

export default function AppPage() {
  const user = getUserFromRequest();

  return (
    <>
      <Nav />
      <div className="container section">
        <h1 className="h2">Приложение</h1>

        {!user ? (
          <div className="grid3" style={{gridTemplateColumns:"1fr", maxWidth: 640}}>
            <div className="card">
              <h3 className="h3">Вход по почте</h3>
              <p className="p">Мы пришлём код. Он действует 10 минут.</p>

              <form action="/api/auth/request-code" method="post" style={{marginTop: 12}}>
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" placeholder="you@domain.com" required />
                <button className="btn primary" style={{marginTop: 12}} type="submit">Получить код</button>
              </form>

              <hr className="hr" />

              <form action="/api/auth/verify-code" method="post">
                <label className="label" htmlFor="email2">Email</label>
                <input className="input" id="email2" name="email" type="email" placeholder="you@domain.com" required />

                <label className="label" htmlFor="code" style={{marginTop: 10}}>Код</label>
                <input className="input" id="code" name="code" inputMode="numeric" placeholder="6 цифр" required />

                <button className="btn primary" style={{marginTop: 12}} type="submit">Войти</button>

                <div className="toast">
                  <b>Для теста на VPS без SMTP:</b> код будет в логах сервера (DEV MAIL). Позже подключишь SMTP.
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid3" style={{gridTemplateColumns:"1.2fr 0.8fr"}}>
            <div className="card">
              <h3 className="h3">Создать план (5–10 км)</h3>
              <p className="p">Заполни параметры — и RUN coach соберёт план. В MVP план генерируется текстом + JSON.</p>

              <form action="/api/plan" method="post" style={{marginTop: 12}}>
                <div className="formRow">
                  <div>
                    <label className="label" htmlFor="distance">Дистанция</label>
                    <select className="input" id="distance" name="distance_km" defaultValue="5">
                      <option value="5">5 км</option>
                      <option value="10">10 км</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="days">Тренировок в неделю</label>
                    <select className="input" id="days" name="days_per_week" defaultValue="3">
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>

                <div className="formRow" style={{marginTop: 12}}>
                  <div>
                    <label className="label" htmlFor="start_date">Старт подготовки</label>
                    <input className="input" id="start_date" name="start_date" type="date" required />
                  </div>
                  <div>
                    <label className="label" htmlFor="race_date">Дата забега</label>
                    <input className="input" id="race_date" name="race_date" type="date" required />
                  </div>
                </div>

                <div className="formRow" style={{marginTop: 12}}>
                  <div>
                    <label className="label" htmlFor="hrmax">Макс. пульс (если знаешь)</label>
                    <input className="input" id="hrmax" name="hr_max" type="number" placeholder="например 190" min="120" max="230" />
                  </div>
                  <div>
                    <label className="label" htmlFor="notes">Особенности</label>
                    <input className="input" id="notes" name="notes" placeholder="сон, стресс, лишний вес, прошлые травмы (кратко)" />
                  </div>
                </div>

                <button className="btn primary" style={{marginTop: 14}} type="submit">Сгенерировать план</button>
              </form>

              <div className="toast">
                После генерации тебя перекинет на страницу результата. 
              </div>
            </div>

            <div className="card">
              <h3 className="h3">Аккаунт</h3>
              <p className="p">Вы вошли как: <b>{user.email}</b></p>
              <p className="p" style={{marginTop: 10}}>Подсказка: начни с 3 тренировок в неделю — это “золотая середина” для новичка.</p>
              <div className="row" style={{marginTop: 14}}>
                <Link className="btn" href="/">На главную</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
