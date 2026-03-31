'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function Header() {
  return (
    <header
      className="border-b px-4 py-3 flex items-center justify-between"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <a href="/" className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
        MBTI Bot
      </a>
      <nav className="flex items-center gap-4">
        <a href="/diagnosis" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>診断</a>
        <a href="/types" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>タイプ</a>
        <a href="/functions" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>機能</a>
        <a href="/axes" className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>軸</a>
        <a href="/chat" className="text-sm hover:underline font-medium" style={{ color: 'var(--accent)' }}>💬 チャット</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
