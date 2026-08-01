import React from 'react';
import { useLocation } from 'wouter';
import Layout from '../../components/layout';
import { useLang } from '../../lib/lang';

export default function Settings() {
  const [, navigate] = useLocation();
  const { t } = useLang();

  const settingsGroups = [
    {
      title: 'УВЕДОМЛЕНИЯ',
      items: [
        { path: '/settings/notifications', label: 'Уведомления', desc: 'Звук, предпросмотр, вибрация' },
      ],
    },
    {
      title: 'ЧАТЫ',
      items: [
        { path: '/settings/chats', label: 'Чаты', desc: 'Фон, отправка по Enter, автоудаление' },
      ],
    },
    {
      title: 'ОБЩИЕ',
      items: [
        { path: '/settings/general', label: 'Общие', desc: 'Язык, тема, резервные копии' },
      ],
    },
    {
      title: 'КИБЕРБЕЗОПАСНОСТЬ',
      items: [
        { path: '/settings/cybersecurity', label: 'Защита', desc: 'Двойное дно, паника, маскировка' },
      ],
    },
  ];

  return (
    <Layout title={t.settingsTitle || 'НАСТРОЙКИ'}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-xs tracking-widest opacity-60 mb-6">НАСТРОЙКИ</div>
        <div className="space-y-8">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <div className="text-xs tracking-widest opacity-40 mb-3">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full card-neon p-4 text-left hover:bg-green-900/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm tracking-widest mb-1">{item.label}</div>
                        <div className="text-xs opacity-40">{item.desc}</div>
                      </div>
                      <div className="opacity-40 group-hover:opacity-100 transition-opacity">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
