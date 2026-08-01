import React from "react";
import Layout from "../../components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function Chats() {
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
    { key: "enterToSend", label: "Отправка по Enter", desc: "Отправлять сообщения по Enter" },
    { key: "selfDestructTimer", label: "Автоудаление", desc: "Сообщения удаляются через 30 сек", type: "select" },
  ];

  return (
    <Layout title="ЧАТЫ">
      <div className="max-w-md mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">ЧАТЫ</div>
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
              {item.type === "select" ? (
                <select
                  className="input-neon text-xs py-1 px-2 w-20"
                  value={settings?.[item.key] || 0}
                  onChange={(e) => updateMut.mutate({ [item.key]: parseInt(e.target.value) })}
                >
                  <option value={0}>Нет</option>
                  <option value={30}>30 сек</option>
                  <option value={60}>1 мин</option>
                  <option value={300}>5 мин</option>
                  <option value={3600}>1 час</option>
                </select>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
