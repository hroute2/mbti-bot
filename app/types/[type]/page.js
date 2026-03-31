import { getType, getCategoryName, isValidType, formatBuiltinText } from '../../../builtin-data.js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ContentViewer from '../../components/ContentViewer';

const CATEGORIES = [1, 2, 3, 4, 5, 6, 7];

export default async function TypeDetailPage({ params }) {
  const { type } = await params;
  if (!isValidType(type)) notFound();
  const typeData = getType(type);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/types" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          ← タイプ一覧
        </Link>
      </div>

      <div
        className="p-6 rounded-xl border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>{type}</h1>
        <p className="mb-3">{typeData.summary}</p>
        <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>主機能: {typeData.mainFunction}</span>
          <span>補助機能: {typeData.auxFunction}</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold">カテゴリ別情報</h2>

      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const builtin = formatBuiltinText({ kind: 'type_category', typeName: type, category: cat });
          return (
            <div key={cat} className="space-y-2">
              <h3 className="font-medium">
                {cat}. {getCategoryName(cat)}
              </h3>
              <ContentViewer
                kind="type_category"
                itemKey={type}
                category={String(cat)}
                builtinText={builtin}
                heading={`${type} - ${getCategoryName(cat)}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
