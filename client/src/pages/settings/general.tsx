import React from "react";
import Layout from "../../components/layout";
import { useLang } from "../../lib/lang";
import { useSession } from "../../lib/session";

export default function General() {
  const { lang, setLang } = useLang();
  const { session, logout } = useSession();

  return (
    <Layout title="ОБЩИЕ">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">ОБЩИЕ НАСТРОЙКИ</div>

        {/* Язык */}
        <div>
          <div className="text-sm tracking-wider mb-2">Язык</div>
          <div className="flex gap-2">
            {(["ru", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`btn-neon text-xs px-4 py-2 ${lang === l ? "bg-neon text-black" : ""}`}
              >
                {l === "ru" ? "Русский" : "English"}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-green-900">
          <button
            className="btn-neon w-full"
            style={{ borderColor: "rgba(255,0,60,0.4)", color: "#ff003c" }}
            onClick={() => { logout(); window.location.href = "/"; }}
          >
            ВЫЙТИ
          </button>
        </div>
      </div>
    </Layout>
  );
}
