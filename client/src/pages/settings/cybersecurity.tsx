import React, { useState } from "react";
import Layout from "../../components/layout";

const SETTINGS = [
  "Сквозное шифрование",
  "Скрывать IP-адрес",
  "Блокировать трекеры",
  "Автоудаление сообщений",
  "Уведомлять о скриншотах",
  "Запрет пересылки сообщений",
  "Двухфакторная аутентификация",
  "Шифрование метаданных",
  "Анонимный режим",
  "VPN-туннель",
  "Tor-маршрутизация",
  "Блокировка микрофона",
  "Блокировка камеры",
  "Защита от MITM",
  "Анализ трафика (защита)",
  "Журнал безопасности",
  "Автовыход при неактивности",
  "Шифрование резервных копий",
  "Защищённые контакты",
];

export default function Cybersecurity() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SETTINGS.map((s) => [s, Math.random() > 0.5]))
  );

  return (
    <Layout title="БЕЗОПАСНОСТЬ">
      <div className="max-w-md mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          НАСТРОЙКИ БЕЗОПАСНОСТИ
        </div>
        <div className="space-y-1">
          {SETTINGS.map((setting) => (
            <div
              key={setting}
              className="flex items-center justify-between p-3
                hover:bg-green-900/20 transition-colors border-b border-green-900/30"
            >
              <span className="text-xs tracking-wider">{setting}</span>
              <button
                onClick={() =>
                  setEnabled((prev) => ({ ...prev, [setting]: !prev[setting] }))
                }
                className="relative w-10 h-5 transition-colors"
                style={{
                  background: enabled[setting]
                    ? "rgba(0,255,100,0.3)"
                    : "rgba(0,255,100,0.05)",
                  border: "1px solid rgba(0,255,100,0.3)",
                  clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)",
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 transition-all"
                  style={{
                    left: enabled[setting] ? "calc(100% - 18px)" : "2px",
                    background: enabled[setting] ? "#00ff64" : "rgba(0,255,100,0.3)",
                    clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
