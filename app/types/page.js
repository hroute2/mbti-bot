import Link from 'next/link';
import { getAllTypes } from '../../builtin-data.js';

export default function TypesPage() {
  const types = getAllTypes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">タイプを調べる</h1>
      <p style={{ color: 'var(--text-secondary)' }}>16タイプから選択してください</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {types.map(t => (
          <Link
            key={t.name}
            href={`/types/${t.name}`}
            className="p-4 rounded-xl border text-center transition-all hover:scale-[1.03]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{t.name}</div>
            <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {t.summary.split('。')[0]}。
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
