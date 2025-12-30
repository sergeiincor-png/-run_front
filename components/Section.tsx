export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="container">
        <h2 className="h2">{title}</h2>
        {children}
      </div>
    </div>
  );
}
