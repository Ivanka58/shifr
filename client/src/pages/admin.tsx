import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "../components/layout";
import { api } from "../lib/api";

export default function Admin() {
  const [tab, setTab] = useState<"users" | "messages">("users");
  const [purged, setPurged] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.adminUsers(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.adminMessages(),
    enabled: tab === "messages",
  });

  const purgeMut = useMutation({
    mutationFn: () => api.adminPurge(),
    onSuccess: () => setPurged(true),
  });

  return (
    <Layout title="АДМИН">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">
          ПАНЕЛЬ АДМИНИСТРАТОРА
        </div>

        <div className="flex gap-2 mb-4">
          {(["users", "messages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn-neon text-xs px-4 py-2 ${tab === t ? "bg-neon text-black" : ""}`}
            >
              {t === "users" ? "ПОЛЬЗОВАТЕЛИ" : "СООБЩЕНИЯ"}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <div className="space-y-2">
            {(users as any[]).map((u: any) => (
              <div key={u.id} className="card-neon p-3 text-xs flex gap-4">
                <span className="opacity-40">#{u.id}</span>
                <span className="flex-1">{u.name}</span>
                <span className="opacity-60">{u.phone}</span>
                <span className={u.isOnline ? "text-neon" : "opacity-30"}>
                  {u.isOnline ? "●" : "○"}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-2">
            {(messages as any[]).map((m: any) => (
              <div key={m.id} className="card-neon p-3 text-xs space-y-1">
                <div className="flex gap-4 opacity-60">
                  <span>#{m.id}</span>
                  <span>от {m.fromUserId} → {m.toUserId}</span>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div className="opacity-80">{m.text}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-green-900">
          <button
            className="btn-neon text-xs"
            style={{ borderColor: "rgba(255,0,60,0.4)", color: "#ff003c" }}
            onClick={() => purgeMut.mutate()}
            disabled={purgeMut.isPending || purged}
          >
            {purged ? "✓ БД ОЧИЩЕНА" : "ОЧИСТИТЬ БАЗУ ДАННЫХ"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
