import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useSession } from "../lib/session";
import { useLang } from "../lib/lang";
import { api } from "../lib/api";
import { setupPush } from "../lib/push";

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\#$%@!?";

    let cols: number[];
    let drops: number[];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / 16);
      drops = Array(cols).fill(1);
    }

    resize();
    window.addEventListener("resize", resize);

    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(8, 15, 9, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff64";
      ctx.font = "14px 'Share Tech Mono', monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

export default function Login() {
  const [, navigate] = useLocation();
  const { session, setSession } = useSession();
  const { t, lang, setLang } = useLang();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (session) navigate("/chat");
  }, [session]);

  function triggerShake(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  }

  async function handlePhone() {
    if (!phone.trim()) return triggerShake("Введите номер телефона");
    setLoading(true);
    try {
      await api.login(phone.trim());
      setStep("code");
      setError("");
    } catch (e: any) {
      triggerShake(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleCode() {
    if (!code.trim()) return triggerShake("Введите код");
    setLoading(true);
    try {
      const data: any = await api.verify(phone.trim(), code.trim());
      setSession(data);
      setupPush().catch(() => {});
      navigate("/chat");
    } catch (e: any) {
      triggerShake(e.message || "Неверный код");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <MatrixRain />

      <div className="fixed top-4 right-4 z-20 flex gap-2">
        {(["ru", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`btn-neon text-xs px-3 py-1 ${lang === l ? "bg-neon text-black" : ""}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        className={`relative z-10 card-neon p-8 w-full max-w-sm mx-4 ${shake ? "animate-shake" : ""}`}
        style={{ boxShadow: "0 0 40px rgba(0,255,100,0.15)" }}
      >
        <div className="text-center mb-8">
          <div
            className="text-5xl font-bold tracking-widest mb-2"
            style={{ textShadow: "0 0 20px rgba(0,255,100,0.8)" }}
          >
            SHIFR
          </div>
          <div className="typewriter text-xs text-green-400 opacity-70">
            {t.slogan}
          </div>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest mb-2 opacity-70">
                {t.phoneLabel}
              </label>
              <input
                className="input-neon"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePhone()}
                autoFocus
              />
            </div>
            {error && (
              <div className="text-xs text-red-400 tracking-wider">{error}</div>
            )}
            <button
              className="btn-neon w-full mt-4"
              onClick={handlePhone}
              disabled={loading}
            >
              {loading ? "..." : t.initiateBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs opacity-50 tracking-wider mb-4">
              КОД ОТПРАВЛЕН НА {phone}
            </div>
            <div>
              <label className="block text-xs tracking-widest mb-2 opacity-70">
                {t.codeLabel}
              </label>
              <input
                className="input-neon text-center text-xl tracking-[0.5em]"
                type="text"
                placeholder={t.codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCode()}
                autoFocus
              />
            </div>
            {error && (
              <div className="text-xs text-red-400 tracking-wider">{error}</div>
            )}
            <button
              className="btn-neon w-full"
              onClick={handleCode}
              disabled={loading}
            >
              {loading ? "..." : t.verifyBtn}
            </button>
            <button
              className="btn-neon w-full opacity-50"
              onClick={() => { setStep("phone"); setError(""); }}
            >
              {t.backBtn}
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-green-900 text-center">
          <div className="text-xs opacity-30 tracking-widest">
            AES-256-GCM · E2E ENCRYPTED · v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
