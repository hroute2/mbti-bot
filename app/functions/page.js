import { getFunction, formatBuiltinText } from '../../builtin-data.js';
import ContentViewer from '../components/ContentViewer';

const FUNCTIONS = ['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi'];

export default function FunctionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">心理機能を調べる</h1>
      <p style={{ color: 'var(--text-secondary)' }}>8つの心理機能から選択してください</p>

      <div className="space-y-4">
        {FUNCTIONS.map(abbr => {
          const f = getFunction(abbr);
          const builtin = formatBuiltinText({ kind: 'function', abbr });
          return (
            <div
              key={abbr}
              className="p-5 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                  {abbr} <span className="font-normal text-base" style={{ color: 'var(--text)' }}>- {f.fullName}</span>
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                主機能: {f.mainTypes.join(', ')} / 補助機能: {f.auxTypes.join(', ')}
              </div>
              <ContentViewer kind="function" itemKey={abbr} builtinText={builtin} heading={`${abbr} - ${f.fullName}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
