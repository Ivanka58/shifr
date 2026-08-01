import React from "react";
import { useLocation } from "wouter";
import Layout from "../../../components/layout";

export default function Cybersecurity() {
  const [, navigate] = useLocation();

  const items = [
    {
      path: "/settings/cybersecurity/double-bottom",
      label: "Двойное дно",
      desc: "Два профиля: один для семьи, второй для бизнеса",
      icon: "🔑",
    },
    {
      path: "/settings/cybersecurity/panic",
      label: "Панический код",
      desc: "Стирает все данные при принудительном доступе",
      icon: "🚨",
    },
    {
      path: "/settings/cybersecurity/vanish",
      label: "Маскировка",
      desc: "Скрывает сообщения и уведомления от посторонних глаз",
      icon: "👁️",
    },
  ];

  return (
    <Layout title="КИБЕРБЕЗОПАСНОСТЬ">
      <div className="max-w-md mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          КИБЕРБЕЗОПАСНОСТЬ
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full card-neon p-4 text-left hover:bg-green-900/20 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm tracking-widest">{item.label}</span>
                  </div>
                  <div className="text-xs opacity-40 mt-1">{item.desc}</div>
                </div>
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">→</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
