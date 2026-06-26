import React, { useState } from "react";
import { useLocation } from "wouter";
import Layout from "../../components/layout";
import { useSession } from "../../lib/session";
import { useLang } from "../../lib/lang";

export default function Panic() {
  const { logout } = useSession();
  const { t } = useLang();
  const [, navigate] = useLocation();
  const [confirm, setConfirm] = useState(false);

  function handlePanic() {
    localStorage.clear();
    logout();
    navigate("/");
  }

  return (
    <Layout title="ПАНИКА">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          ПРОТОКОЛ ПАНИКИ
        </div>

        <div className="card-neon p-4 border-red-900"
          style={{ borderColor: "rgba(255,0,60,0.3)" }}>
          <div className="text-xs text-red-400 leading-relaxed tracking-wider">
            ⚠ ВНИМАНИЕ: Это действие немедленно удалит все локальные данные,
            завершит сессию и вернёт на экран входа. Действие необратимо.
          </div>
        </div>

        <div className="text-xs opacity-50 tracking-wider">
          {t.panicDesc}
        </div>

        {!confirm ? (
          <button
            className="btn-neon w-full"
            style={{
              borderColor: "rgba(255,0,60,0.6)",
              color: "#ff003c",
            }}
            onClick={() => setConfirm(true)}
          >
            {t.panicBtn}
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
              ПОДТВЕРДИТЬ — УНИЧТОЖИТЬ ДАННЫЕ
            </button>
            <button
              className="btn-neon w-full opacity-50"
              onClick={() => setConfirm(false)}
            >
              {t.cancelBtn}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
