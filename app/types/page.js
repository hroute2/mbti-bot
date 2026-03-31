import Link from 'next/link';
import { getAllTypes } from '../../builtin-data.js';

export default function TypesPage() {
  const types = getAllTypes();

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">タイプを調べる</h1>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>16タイプから選択してください</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {types.map(t => (
          <Link
            key={t.name}
            href={`/types/${t.name}`}
            className="p-3 sm:p-4 rounded-xl border text-center transition-all active:scale-[0.96] sm:hover:scale-[1.03]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-lg sm:text-xl font-bold" style={{ color: 'var(--accent)' }}>{t.name}</div>
            <p className="text-[11px] sm:text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {t.summary.split('。')[0]}。
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
