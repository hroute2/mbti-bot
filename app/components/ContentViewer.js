'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1">{children}</h3>,
  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--accent)' }}>{children}</strong>,
  em: ({ children }) => <em className="italic" style={{ color: 'var(--text-secondary)' }}>{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 pl-3 my-2 italic" style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color: 'var(--accent)' }}>{children}</a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3"><table className="w-full text-sm border-collapse">{children}</table></div>
  ),
  thead: ({ children }) => <thead style={{ backgroundColor: 'var(--bg)' }}>{children}</thead>,
  th: ({ children }) => <th className="border px-3 py-2 text-left font-semibold" style={{ borderColor: 'var(--border)' }}>{children}</th>,
  td: ({ children }) => <td className="border px-3 py-2" style={{ borderColor: 'var(--border)' }}>{children}</td>,
  code: ({ children }) => (
    <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg)', color: 'var(--accent)' }}>{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="p-3 rounded-lg overflow-x-auto text-xs my-2" style={{ backgroundColor: 'var(--bg)' }}>{children}</pre>
  ),
};

export default function ContentViewer({ kind, itemKey, category, builtinText, heading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const hasBuiltin = builtinText && builtinText.length > 0 && builtinText !== 'この項目のビルトイン情報はありません。';
  const suggestions = getDefaultSuggestions(kind);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [qaList]);

  async function askAI(question) {
    if (!question.trim() || loading) return;
    setLoading(true);
    setInput('');

    const newQa = { question, answer: '', loading: true };
    setQaList(prev => [...prev, newQa]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildMessages(qaList, kind, itemKey, category, heading, question),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setQaList(prev => {
          const u = [...prev];
          u[u.length - 1] = { question, answer: `エラー: ${err.error}`, loading: false };
          return u;
        });
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              accumulated += parsed.delta.text;
              const cur = accumulated;
              setQaList(prev => {
                const u = [...prev];
                u[u.length - 1] = { question, answer: cur, loading: false };
                return u;
              });
            }
          } catch {}
        }
      }
    } catch {
      setQaList(prev => {
        const u = [...prev];
        u[u.length - 1] = { question, answer: '通信エラーが発生しました。', loading: false };
        return u;
      });
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI(input);
    }
  }

  return (
    <>
      {/* ビルトイン情報カード */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {hasBuiltin ? (
          <div className="p-5 text-sm whitespace-pre-wrap leading-relaxed">
            {builtinText}
          </div>
        ) : null}
        <div className={hasBuiltin ? 'px-5 pb-4' : 'p-4 flex items-center justify-between'}>
          {!hasBuiltin && (
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              AIに聞いてみましょう
            </span>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all hover:scale-105"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <span>✨</span>
            AIに質問する
          </button>
        </div>
      </div>

      {/* モーダル */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          {/* 背景オーバーレイ */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* モーダル本体 */}
          <div
            className="relative w-full sm:max-w-2xl sm:mx-4 flex flex-col rounded-t-2xl sm:rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              maxHeight: '85dvh',
              height: '85dvh',
            }}
          >
            {/* ヘッダー */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">✨</span>
                <h3 className="font-semibold text-sm truncate">{heading || 'AIに質問'}</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-lg leading-none cursor-pointer hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* チャットエリア */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {qaList.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    この項目についてAIに質問できます
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => askAI(s)}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-full text-xs border cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {qaList.map((qa, i) => (
                <div key={i} className="space-y-3">
                  {/* 質問 */}
                  <div className="flex justify-end">
                    <div
                      className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm"
                      style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    >
                      {qa.question}
                    </div>
                  </div>
                  {/* 回答 */}
                  <div className="flex justify-start">
                    <div
                      className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      {qa.loading && !qa.answer ? (
                        <div className="flex items-center gap-1.5 py-1" style={{ color: 'var(--text-secondary)' }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{qa.answer}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 入力エリア */}
            <div
              className="shrink-0 px-4 py-3 border-t"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              {qaList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestions.slice(0, 3).map(s => (
                    <button
                      key={s}
                      onClick={() => askAI(s)}
                      disabled={loading}
                      className="px-2 py-1 rounded-full text-xs border cursor-pointer hover:scale-105 disabled:opacity-50"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="質問を入力..."
                  className="flex-1 bg-transparent outline-none text-base sm:text-sm py-1.5"
                  style={{ fontSize: '16px' }}
                  style={{ color: 'var(--text)' }}
                  disabled={loading}
                />
                <button
                  onClick={() => askAI(input)}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getDefaultSuggestions(kind) {
  if (kind === 'type_category') {
    return ['もっと詳しく教えて', '具体例を挙げて', '他のタイプとの違いは？'];
  }
  if (kind === 'function') {
    return ['この機能が強い人の特徴は？', '日常でどう表れる？', '発達させるには？'];
  }
  if (kind === 'axis') {
    return ['両極の違いを詳しく', '日常での見分け方は？', '偏りすぎるとどうなる？'];
  }
  return ['詳しく教えて'];
}

function buildMessages(qaList, kind, itemKey, category, heading, newQuestion) {
  const context = kind === 'type_category'
    ? `MBTIタイプ ${itemKey} の「${heading || ''}」`
    : kind === 'function'
    ? `心理機能 ${itemKey}`
    : `心理傾向軸 ${itemKey}`;

  const messages = [];

  // 過去のQ&Aをコンテキストとして含める
  for (const qa of qaList) {
    messages.push({ role: 'user', content: qa.question });
    if (qa.answer) messages.push({ role: 'assistant', content: qa.answer });
  }

  messages.push({
    role: 'user',
    content: qaList.length === 0
      ? `${context}について、以下の質問に答えてください:\n\n${newQuestion}`
      : newQuestion,
  });

  return messages;
}
