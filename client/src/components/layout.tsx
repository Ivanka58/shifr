import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSession } from '../lib/session';
import { useLang } from '../lib/lang';

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: Props) {
  const [, navigate] = useLocation();
  const { session, logout } = useSession();
  const { t } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);

  // Закрываем сайдбар при клике вне
  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) setSidebarOpen(true);
    if (dx < -50) setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function goToProfile() {
    navigate('/profile');
    setSidebarOpen(false);
  }

  const navItems = [
    { path: '/chat', label: '[ ЧАТЫ ]' },
    { path: '/settings', label: '[ НАСТРОЙКИ ]' },
  ];

  const Sidebar = () => (
    <div
      className="flex flex-col h-full w-64 flex-shrink-0"
      style={{
        background: '#0a140b',
        borderRight: '1px solid rgba(0,255,100,0.2)',
      }}
    >
      <div className="p-6 border-b border-green-900">
        <div className="text-2xl font-bold tracking-widest" style={{ textShadow: '0 0 10px rgba(0,255,100,0.6)' }}>
          SHIFR
        </div>
        <div className="text-xs opacity-40 mt-1 tracking-wider">{session?.name}</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm tracking-wider hover:bg-green-900/30 transition-colors"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-green-900 space-y-2">
        <button onClick={goToProfile} className="btn-neon w-full text-sm">
          [ ПРОФИЛЬ ]
        </button>
        <button onClick={handleLogout} className="btn-neon w-full text-sm opacity-50">
          {t.logoutBtn}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Десктоп: сайдбар всегда виден */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Мобильный: оверлей */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <Sidebar />
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden chat-grid">
        {/* Мобильный хедер */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-green-900">
          <button onClick={() => setSidebarOpen(true)} className="btn-neon text-xs px-3 py-1">
            ☰
          </button>
          <div className="text-sm tracking-widest">{title || 'SHIFR'}</div>
          {/* Аватарка справа ведет в профиль */}
          <button onClick={goToProfile} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-black"
            style={{
              background: session?.avatarColor || '#00ff64',
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
            }}>
            {session?.name?.[0]?.toUpperCase() || '?'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
