import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout";
import { useSession } from "../lib/session";
import { useLang } from "../lib/lang";
import { api } from "../lib/api";

const COLORS = [
  "#00ff64", "#00ffff", "#ff00ff", "#ffff00",
  "#ff6400", "#6400ff", "#ff0064", "#0064ff",
];

export default function Profile() {
  const { session, setSession } = useSession();
  const { t } = useLang();
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
  });

  const [name, setName] = useState(session?.name || "");
  const [color, setColor] = useState(session?.avatarColor || "#00ff64");
  const [saved, setSaved] = useState(false);

  const updateMut = useMutation({
    mutationFn: () => api.updateMe({ name, avatarColor: color }),
    onSuccess: (data: any) => {
      setSession({ ...session!, name: data.name, avatarColor: data.avatarColor });
      qc.invalidateQueries({ queryKey: ["me"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <Layout title={t.profileTitle}>
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          {t.profileTitle}
        </div>

        <div className="flex justify-center">
          <div
            className="w-20 h-20 flex items-center justify-center text-2xl
              font-bold text-black"
            style={{
              background: color,
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
              boxShadow: `0 0 24px ${color}66`,
            }}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-widest mb-2 opacity-70">
            {t.nameLabel}
          </label>
          <input
            className="input-neon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest mb-3 opacity-70">
            {t.colorLabel}
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 transition-transform hover:scale-110"
                style={{
                  background: c,
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                  boxShadow: color === c ? `0 0 12px ${c}` : "none",
                  outline: color === c ? `1px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        <div className="card-neon p-4 space-y-2 text-xs">
          <div className="flex justify-between opacity-60">
            <span>ТЕЛЕФОН</span>
            <span>{session?.phone}</span>
          </div>
          <div className="flex justify-between opacity-60">
            <span>ID</span>
            <span>#{session?.userId}</span>
          </div>
        </div>

        <button
          className="btn-neon w-full"
          onClick={() => updateMut.mutate()}
          disabled={updateMut.isPending}
        >
          {saved ? "✓ СОХРАНЕНО" : updateMut.isPending ? "..." : t.saveBtn}
        </button>
      </div>
    </Layout>
  );
}
