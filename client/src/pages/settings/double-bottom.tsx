import React, { useState } from "react";
import Layout from "../../components/layout";

export default function DoubleBottom() {
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem("shifr_double_bottom", code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Layout title="ДВОЙНОЕ ДНО">
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          ДВОЙНОЕ ДНО
        </div>

        <div className="card-neon p-4 text-xs opacity-60 leading-relaxed">
          При вводе альтернативного кода вместо основного профиля будет
          показан пустой «чистый» аккаунт без истории сообщений.
          Используйте для защиты от принудительного доступа.
        </div>

        <div>
          <label className="block text-xs tracking-widest mb-2 opacity-70">
            АЛЬТЕРНАТИВНЫЙ КОД
          </label>
          <input
            className="input-neon text-center tracking-[0.5em] text-xl"
            type="text"
            placeholder="A-XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
        </div>

        <div className="text-xs opacity-40 tracking-wider">
          ⚠ ФУНКЦИЯ В РАЗРАБОТКЕ — только UI-демонстрация
        </div>

        <button className="btn-neon w-full" onClick={handleSave}>
          {saved ? "✓ СОХРАНЕНО" : "СОХРАНИТЬ КОД"}
        </button>
      </div>
    </Layout>
  );
}
