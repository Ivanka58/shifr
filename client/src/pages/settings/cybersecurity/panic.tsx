import React, { useState } from "react";
import { useLocation } from "wouter";
import Layout from "../../../components/layout";
import { useSession } from "../../../lib/session";
import { useLang } from "../../../lib/lang";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function Panic() {
  const { logout } = useSession();
  const { t } = useLang();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState("");

  const updateMut = useMutation({
    mutationFn: (updates: any) => api.updateSettings(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  function handlePanic() {
    localStorage.clear();
    logout();
    navigate("/");
  }

  const handleSaveCode = () => {
    if (code.length >= 4) {
      updateMut.mutate({ panicCode: code });
    }
  };

  return (
    <Layout title="ПАНИЧЕСКИЙ КОД">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          ПАНИЧЕСКИЙ КОД
        </div>

        <div className="card-neon p-4 border-red-900" style={{ borderColor: "rgba(255,0,60,0.3)" }}>
          <div className="text-xs text-red-400 leading-relaxed tracking-wider">
            🚨 <strong>Панический код</strong> — это секретный код, который стирает все данные в приложении при принудительной разблокировке.
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-widest mb-2 opacity-70">
            УСТАНОВИТЬ ПАНИЧЕСКИЙ КОД
          </label>
          <input
            className="input-neon text-center tracking-[0.3em]"
            type="password"
            placeholder="****"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
          />
          <div className="text-xs opacity-40 mt-1">От 4 до 6 цифр</div>
        </div>

        <button className="btn-neon w-full" onClick={handleSaveCode}>
          СОХРАНИТЬ КОД
        </button>

        <div className="pt-4 border-t border-green-900">
          <div className="text-xs opacity-40 tracking-wider mb-4">
            ⚠️ При вводе этого кода вместо пароля — все данные будут стерты
          </div>

          {!confirm ? (
            <button
              className="btn-neon w-full"
              style={{ borderColor: "rgba(255,0,60,0.6)", color: "#ff003c" }}
              onClick={() => setConfirm(true)}
            >
              {t.panicBtn || "АКТИВИРОВАТЬ ПРОТОКОЛ ПАНИКИ (ТЕСТ)"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-red-400 tracking-wider text-center">
                ПОДТВЕРДИТЕ АКТИВАЦИЮ
              </div>
              <button
                className="btn-neon w-full"
                style={{ borderColor: "rgba(255,0,60,0.6)", color: "#ff003c" }}
                onClick={handlePanic}
              >
                УНИЧТОЖИТЬ ДАННЫЕ
              </button>
              <button className="btn-neon w-full opacity-50" onClick={() => setConfirm(false)}>
                {t.cancelBtn || "ОТМЕНА"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
