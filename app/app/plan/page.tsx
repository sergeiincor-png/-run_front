import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default function PlanPage() {
  const user = requireUser();

  // MVP: store last plan per user in a simple table-less way using sessions? We'll just read from a file in data dir.
  // Simpler: store in sqlite key-value table; but for brevity, we use a simple table.
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(`plan:${user.id}:latest`) as any;
  const content = row?.value || "Пока нет плана. Сгенерируй его в /app.";

  return (
    <>
      <Nav />
      <div className="container section">
        <h1 className="h2">Твой план</h1>
        <div className="card">
          <pre style={{whiteSpace:"pre-wrap", margin:0, color:"rgba(234,240,255,0.9)", lineHeight:1.55}}>{content}</pre>
        </div>
      </div>
    </>
  );
}
