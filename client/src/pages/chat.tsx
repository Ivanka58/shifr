import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout';
import { useSession } from '../lib/session';
import { useLang } from '../lib/lang';
import { api } from '../lib/api';

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  text: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
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

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'sending':
      return <span className="inline-block w-4 h-4 animate-spin border-2 border-neon border-t-transparent rounded-full" />;
    case 'sent':
      return <span className="opacity-40">✓</span>;
    case 'delivered':
      return <span className="opacity-60">✓✓</span>;
    case 'read':
      return <span className="text-neon">✓✓</span>;
    default:
      return null;
  }
}

export default function Chat() {
  const { session } = useSession();
  const { t } = useLang();
  const qc = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    refetchInterval: 10000,
  });

  const { data: unread = [] } = useQuery<any[]>({
    queryKey: ['unread'],
    queryFn: () => api.getUnread(),
    refetchInterval: 3000,
  });

  const { data: msgs = [] } = useQuery<Message[]>({
    queryKey: ['messages', selectedUser?.id],
    queryFn: () => api.getMessages(selectedUser!.id),
    enabled: !!selectedUser,
    refetchInterval: 2000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMut = useMutation({
    mutationFn: () => api.sendMessage(selectedUser!.id, text),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', selectedUser?.id] });
    },
  });

  const otherUsers = users.filter((u) => u.id !== session?.userId);

  return (
    <Layout title={t.chatTitle}>
      <div className="flex h-full">
        {/* Список пользователей */}
        <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden border-r border-green-900/20">
          <div className="p-3 border-b border-green-900">
            <div className="text-xs tracking-widest opacity-60">{t.users}</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {otherUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-green-900/20
                  ${selectedUser?.id === u.id ? 'bg-green-900/30' : ''}`}
              >
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-bold text-black"
                  style={{
                    background: u.avatarColor || '#00ff64',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  }}>
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs tracking-wider truncate">{u.name}</div>
                  <div className={`text-xs opacity-50 ${u.isOnline ? 'text-neon' : ''}`}>
                    {u.isOnline ? t.online : t.offline}
                  </div>
                </div>
                {unread.find((x: any) => x.fromUserId === u.id)?.count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-neon text-black text-xs flex items-center justify-center font-bold">
                    {unread.find((x: any) => x.fromUserId === u.id)?.count || 0}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-green-900">
                <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-black"
                  style={{
                    background: selectedUser.avatarColor || '#00ff64',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  }}>
                  {selectedUser.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm tracking-wider">{selectedUser.name}</div>
                  <div className="text-xs opacity-40 tracking-wider">🔒 {t.encrypted}</div>
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
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-xs px-3 py-2 text-xs leading-relaxed ${isMine ? 'bubble-mine' : 'bubble-other'}`}>
                        <div>{msg.text}</div>
                        <div className="flex items-center gap-2 mt-1 opacity-40 text-xs">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.editedAt && <span>{t.edited}</span>}
                          {msg.isEncrypted && <span>🔒</span>}
                          {isMine && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) sendMut.mutate(); }}
                />
                <button className="btn-neon text-xs px-4" onClick={() => text.trim() && sendMut.mutate()} disabled={sendMut.isPending}>
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
    </Layout>
  );
}
