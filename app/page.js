import Link from 'next/link';

const MENU_ITEMS = [
  { href: '/diagnosis', icon: '🧠', title: 'MBTI診断', desc: '16問の質問であなたのタイプを診断' },
  { href: '/types', icon: '📋', title: 'タイプを調べる', desc: '16タイプの詳細情報を閲覧' },
  { href: '/functions', icon: '⚙️', title: '心理機能を調べる', desc: '8つの心理機能の解説' },
  { href: '/axes', icon: '↔️', title: '心理傾向軸を調べる', desc: '4つの心理傾向軸の解説' },
  { href: '/chat', icon: '💬', title: 'AIチャット相談', desc: 'あなたのタイプをもとにAIと相談' },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>MBTI Bot</h1>
        <p style={{ color: 'var(--text-secondary)' }}>MBTIの診断と情報閲覧</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MENU_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-6 rounded-xl border transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
