'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

const NAV_ITEMS = [
  { href: '/diagnosis', label: '診断', icon: '🧠' },
  { href: '/types', label: 'タイプ', icon: '📋' },
  { href: '/functions', label: '機能', icon: '⚙️' },
  { href: '/axes', label: '軸', icon: '↔️' },
  { href: '/chat', label: 'チャット', icon: '💬' },
];

export default function Header() {
  return (
    <>
      {/* デスクトップヘッダー */}
      <header
        className="hidden sm:flex border-b px-4 py-3 items-center justify-between"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
          MBTI Bot
        </Link>
        <nav className="flex items-center gap-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm hover:underline"
              style={{ color: item.href === '/chat' ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              {item.href === '/chat' ? `${item.icon} ${item.label}` : item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      {/* モバイルヘッダー */}
      <MobileHeader />

      {/* モバイルボトムナビ */}
      <MobileBottomNav />
    </>
  );
}

function MobileHeader() {
  return (
    <header
      className="sm:hidden flex border-b px-4 py-3 items-center justify-between"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      <Link href="/" className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
        MBTI Bot
      </Link>
      <ThemeToggle />
    </header>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around py-1 safe-bottom"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg-card)',
        paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
      }}
    >
      <BottomNavItem href="/" icon="🏠" label="ホーム" active={pathname === '/'} />
      {NAV_ITEMS.map(item => (
        <BottomNavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname.startsWith(item.href)}
        />
      ))}
    </nav>
  );
}

function BottomNavItem({ href, icon, label, active }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[3rem]"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        backgroundColor: active ? 'var(--accent-light)' : 'transparent',
      }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
