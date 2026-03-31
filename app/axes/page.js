import { getAxis, formatBuiltinText } from '../../builtin-data.js';
import ContentViewer from '../components/ContentViewer';

const AXES = ['EI', 'SN', 'TF', 'JP'];

export default function AxesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">心理傾向軸を調べる</h1>
      <p style={{ color: 'var(--text-secondary)' }}>4つの心理傾向軸から選択してください</p>

      <div className="space-y-4">
        {AXES.map(abbr => {
          const a = getAxis(abbr);
          const builtin = formatBuiltinText({ kind: 'axis', abbr });
          return (
            <div
              key={abbr}
              className="p-5 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {abbr} <span className="font-normal text-base" style={{ color: 'var(--text)' }}>- {a.fullName}</span>
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
                  <div className="font-semibold text-sm">{a.pole1.name}（{a.pole1.abbr}）</div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{a.pole1.description}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
                  <div className="font-semibold text-sm">{a.pole2.name}（{a.pole2.abbr}）</div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{a.pole2.description}</p>
                </div>
              </div>

              <ContentViewer kind="axis" itemKey={abbr} builtinText={builtin} heading={`${abbr} - ${a.fullName}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
