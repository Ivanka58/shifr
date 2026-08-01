import React, { useState } from "react";
import Layout from "../../../components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function DoubleBottom() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
  });

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);

  const updateMut = useMutation({
    mutationFn: (updates: any) => api.updateSettings(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    if (password && password !== confirm) {
      alert("Пароли не совпадают");
      return;
    }
    updateMut.mutate({
      doubleBottomEnabled: true,
      doubleBottomPassword: password || null,
    });
  };

  const isEnabled = settings?.doubleBottomEnabled || false;

  return (
    <Layout title="ДВОЙНОЕ ДНО">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          ДВОЙНОЕ ДНО
        </div>

        <div className="card-neon p-4 text-xs opacity-60 leading-relaxed space-y-2">
          <p>🔑 <strong>Двойное дно</strong> — это два профиля в одном приложении:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Пароль А → обычные чаты (семья, друзья, работа)</li>
            <li>Пароль Б → скрытые чаты (бизнес, крипта, инвестиции)</li>
          </ul>
          <p className="text-neon">⚠️ Никто не знает о существовании второго профиля.</p>
        </div>

        <div className="flex items-center justify-between p-3 border-b border-green-900/30">
          <div>
            <div className="text-sm tracking-wider">Активировать</div>
            <div className="text-xs opacity-40">Включить двойное дно</div>
          </div>
          <button
            onClick={() => updateMut.mutate({ doubleBottomEnabled: !isEnabled })}
            className="relative w-10 h-5 transition-colors"
            style={{
              background: isEnabled ? "rgba(0,255,100,0.3)" : "rgba(0,255,100,0.05)",
              border: "1px solid rgba(0,255,100,0.3)",
              clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)",
            }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 transition-all"
              style={{
                left: isEnabled ? "calc(100% - 18px)" : "2px",
                background: isEnabled ? "#00ff64" : "rgba(0,255,100,0.3)",
                clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)",
              }}
            />
          </button>
        </div>

        {isEnabled && (
          <>
            <div>
              <label className="block text-xs tracking-widest mb-2 opacity-70">
                ПАРОЛЬ ДЛЯ ВТОРОГО ПРОФИЛЯ
              </label>
              <input
                className="input-neon"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest mb-2 opacity-70">
                ПОДТВЕРДИТЕ ПАРОЛЬ
              </label>
              <input
                className="input-neon"
                type="password"
                placeholder="Повторите пароль"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button className="btn-neon w-full" onClick={handleSave}>
              {saved ? "✓ СОХРАНЕНО" : "СОХРАНИТЬ"}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}
