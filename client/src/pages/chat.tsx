import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout";
import { useSession } from "../lib/session";
import { useLang } from "../lib/lang";
import { api } from "../lib/api";

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  createdAt: string;
  editedAt?: string;
  isEncrypted: boolean;
}

interface User {
  id: number;
  name: string;
  avatarColor: string;
  isOnline: boolean;
}

function ContextMenu({
  x, y, isMine, onCopy, onEdit, onDelete, onDeleteAll, onClose,
}: {
  x: number; y: number; isMine: boolean;
  onCopy: () => void; onEdit: () => void;
  onDelete: () => void; onDeleteAll: () => void;
  onClose: () => void;
}) {
  const { t } = useLang();

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div
      className="fixed z-50 card-neon py-1 animate-ctx-in"
      style={{ left: x, top: y, minWidth: 160,
        boxShadow: "0 0 20px rgba(0,255,100,0.2)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {[
        { label: t.copyBtn, action: onCopy },
        ...(isMine ? [
          { label: t.editBtn, action: onEdit },
          { label: t.deleteBtn, action: onDelete },
          { label: t.deleteForAll, action: onDeleteAll },
        ] : [
          { label: t.deleteBtn, action: onDelete },
        ]),
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose(); }}
          className="w-full text-left px-4 py-2 text-xs tracking-wider
            hover:bg-green-900/40 transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function Chat() {
  const { session } = useSession();
  const { t } = useLang();
  const qc = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [ctx, setCtx] = useState<{ x: number; y: number; msg: Message } | null>(null);
  const [dissolvingIds, setDissolvingIds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
    refetchInterval: 10000,
  });

  const { data: unread = [] } = useQuery<any[]>({
    queryKey: ["unread"],
    queryFn: () => api.getUnread(),
    refetchInterval: 3000,
  });

  const { data: msgs = [] } = useQuery<Message[]>({
    queryKey: ["messages", selectedUser?.id],
    queryFn: () => api.getMessages(selectedUser!.id),
    enabled: !!selectedUser,
    refetchInterval: 2000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMut = useMutation({
    mutationFn: () => api.sendMessage(selectedUser!.id, text),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["messages", selectedUser?.id] });
    },
  });

  const editMut = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      api.editMessage(id, text),
    onSuccess: () => {
      setEditingId(null);
      setEditText("");
      qc.invalidateQueries({ queryKey: ["messages", selectedUser?.id] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: ({ id, scope }: { id: number; scope: "self" | "all" }) => {
      setDissolvingIds((prev) => new Set(prev).add(id));
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await api.deleteMessage(id, scope);
          resolve();
        }, 650);
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", selectedUser?.id] });
    },
  });

  function getUnreadCount(userId: number) {
    return unread.find((u: any) => u.fromUserId === userId)?.count || 0;
  }

  function handleContext(e: React.MouseEvent, msg: Message) {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, msg });
  }

  const otherUsers = users.filter((u) => u.id !== session?.userId);

  return (
    <Layout title={t.chatTitle}>
      <div className="flex h-full">
        <div
          className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: "1px solid rgba(0,255,100,0.15)" }}
        >
          <div className="p-3 border-b border-green-900">
            <div className="text-xs tracking-widest opacity-60">{t.users}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {otherUsers.map((u) => {
              const unreadCnt = getUnreadCount(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 p-3 text-left
                    transition-colors hover:bg-green-900/20
                    ${selectedUser?.id === u.id ? "bg-green-900/30" : ""}`}
                >
                  <div
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center
                      text-xs font-bold text-black"
                    style={{
                      background: u.avatarColor || "#00ff64",
                      clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                    }}
                  >
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs tracking-wider truncate">{u.name}</div>
                    <div className={`text-xs opacity-50 ${u.isOnline ? "text-neon" : ""}`}>
                      {u.isOnline ? t.online : t.offline}
                    </div>
                  </div>
                  {unreadCnt > 0 && (
                    <div className="w-5 h-5 rounded-full bg-neon text-black
                      text-xs flex items-center justify-center font-bold">
                      {unreadCnt}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 p-4
                border-b border-green-900">
                <div
                  className="w-8 h-8 flex items-center justify-center
                    text-xs font-bold text-black"
                  style={{
                    background: selectedUser.avatarColor || "#00ff64",
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                  }}
                >
                  {selectedUser.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm tracking-wider">{selectedUser.name}</div>
                  <div className="text-xs opacity-40 tracking-wider">
                    🔒 {t.encrypted}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgs.length === 0 && (
                  <div className="text-center opacity-30 text-sm mt-8 tracking-wider">
                    {t.noMessages}
                  </div>
                )}
                {msgs.map((msg) => {
                  const isMine = msg.fromUserId === session?.userId;
                  const isDissolving = dissolvingIds.has(msg.id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}
                        animate-fade-in ${isDissolving ? "animate-dissolve" : ""}`}
                      onContextMenu={(e) => handleContext(e, msg)}
                    >
                      {editingId === msg.id ? (
                        <div className="flex gap-2 w-full max-w-sm">
                          <input
                            className="input-neon flex-1 text-xs"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") editMut.mutate({ id: msg.id, text: editText });
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button
                            className="btn-neon text-xs px-2"
                            onClick={() => editMut.mutate({ id: msg.id, text: editText })}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`max-w-xs px-3 py-2 text-xs leading-relaxed
                            ${isMine ? "bubble-mine" : "bubble-other"}`}
                        >
                          <div>{msg.text}</div>
                          <div className="flex items-center gap-2 mt-1 opacity-40 text-xs">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            {msg.editedAt && <span>{t.edited}</span>}
                            {msg.isEncrypted && <span>🔒</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-green-900 flex gap-2">
                <input
                  className="input-neon flex-1 text-sm"
                  placeholder={t.typeMessage}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && text.trim()) sendMut.mutate();
                  }}
                />
                <button
                  className="btn-neon text-xs px-4"
                  onClick={() => text.trim() && sendMut.mutate()}
                  disabled={sendMut.isPending || !text.trim()}
                >
                  {t.sendBtn}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center opacity-30">
                <div className="text-4xl mb-4">⬡</div>
                <div className="text-sm tracking-widest">ВЫБЕРИТЕ КОНТАКТ</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y}
          isMine={ctx.msg.fromUserId === session?.userId}
          onCopy={() => navigator.clipboard.writeText(ctx.msg.text)}
          onEdit={() => {
            setEditingId(ctx.msg.id);
            setEditText(ctx.msg.text);
          }}
          onDelete={() => deleteMut.mutate({ id: ctx.msg.id, scope: "self" })}
          onDeleteAll={() => deleteMut.mutate({ id: ctx.msg.id, scope: "all" })}
          onClose={() => setCtx(null)}
        />
      )}
    </Layout>
  );
}
