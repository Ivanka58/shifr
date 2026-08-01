import React from "react";
import Layout from "../../../components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function Vanish() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
  });

  const updateMut = useMutation({
    mutationFn: (updates: any) => api.updateSettings(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const toggle = (key: string) => {
    updateMut.mutate({ [key]: !settings?.[key] });
  };

  const items = [
    {
      key: "vanishMode",
      label: "Режим «Невидимка»",
      desc: "Сообщения в чате размыты, пока не наведешь палец",
    },
    {
      key: "screenshotProtection",
      label: "Защита от скриншотов",
      desc: "На скриншотах вместо сообщений — зелёный шум",
    },
    {
      key: "maskNotifications",
      label: "Маскировка уведомлений",
      desc: "Уведомления маскируются под погоду или новости",
    },
  ];

  return (
    <Layout title="МАСКИРОВКА">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          МАСКИРОВКА И ЗАЩИТА
        </div>

        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 hover:bg-green-900/20 transition-colors border-b border-green-900/30"
            >
              <div>
                <div className="text-sm tracking-wider">{item.label}</div>
                <div className="text-xs opacity-40">{item.desc}</div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className="relative w-10 h-5 transition-colors"
                style={{
                  background: settings?.[item.key]
                    ? "rgba(0,255,100,0.3)"
                    : "rgba(0,255,100,0.05)",
                  border: "1px solid rgba(0,255,100,0.3)",
                  clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)",
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 transition-all"
                  style={{
                    left: settings?.[item.key] ? "calc(100% - 18px)" : "2px",
                    background: settings?.[item.key] ? "#00ff64" : "rgba(0,255,100,0.3)",
                    clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        {settings?.maskNotifications && (
          <div>
            <label className="block text-xs tracking-widest mb-2 opacity-70">
              ТЕКСТ МАСКИРОВКИ
            </label>
            <input
              className="input-neon"
              value={settings?.maskText || "Погода"}
              onChange={(e) => updateMut.mutate({ maskText: e.target.value })}
              placeholder="Например: Погода, Новости, Спорт"
            />
            <div className="text-xs opacity-40 mt-1">
              Уведомления будут выглядеть как: «{settings?.maskText || "Погода"}: ясно, +20°C»
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
