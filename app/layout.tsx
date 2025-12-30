import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RUN coach — ИИ-помощник для подготовки к 5–10 км",
  description: "Персональный план + адаптация по самочувствию и пульсу. 7 дней бесплатно.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
