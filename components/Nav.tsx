import Link from "next/link";
import { getUserFromRequest } from "@/lib/auth";

export default function Nav() {
  // This runs on server components only (default in app router)
  const user = getUserFromRequest();

  return (
    <div className="container">
      <div className="nav">
        <Link className="brand" href="/">RUN coach</Link>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <Link className="pill" href="/pricing">Тарифы</Link>
          <Link className="pill" href="/faq">FAQ</Link>
          {user ? (
            <>
              <Link className="btn small" href="/app">В приложение</Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn small" type="submit">Выйти</button>
              </form>
            </>
          ) : (
            <Link className="btn small primary" href="/app">7 дней бесплатно</Link>
          )}
        </div>
      </div>
    </div>
  );
}
