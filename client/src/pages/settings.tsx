import React from "react";
import { useLocation } from "wouter";
import Layout from "../components/layout";
import { useLang } from "../lib/lang";

export default function Settings() {
  const [, navigate] = useLocation();
  const { t } = useLang();

  const items = [
    {
      path: "/settings/cybersecurity",
      label: t.security,
      desc: "Настройки конфиденциальности и безопасности",
    },
    {
      path: "/settings/double-bottom",
      label: t.doubleBottom,
      desc: "Скрытый профиль при вводе альтернативного кода",
    },
    {
      path: "/settings/panic",
      label: t.panic,
      desc: "Экстренная очистка всех данных",
    },
  ];

  return (
    <Layout title={t.settingsTitle}>
      <div className="max-w-md mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          {t.settingsTitle}
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full card-neon p-4 text-left hover:bg-green-900/20
                transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm tracking-widest mb-1">{item.label}</div>
                  <div className="text-xs opacity-40">{item.desc}</div>
                </div>
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
