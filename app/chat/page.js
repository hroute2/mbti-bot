'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TYPES = [
  'ESTJ','ESTP','ESFJ','ESFP','ENTJ','ENTP','ENFJ','ENFP',
  'ISTJ','ISTP','ISFJ','ISFP','INTJ','INTP','INFJ','INFP',
];

const SUGGESTIONS = [
  '自分のタイプの強みと弱みを教えて',
  '仕事で活かせる特性は？',
  '相性が良いタイプは？',
  'ストレスを感じやすい場面と対処法は？',
  '成長のためにできることは？',
];

const mdComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--accent)' }}>{children}</strong>,
  h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 pl-3 my-2 italic" style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>{children}</a>
  ),
  code: ({ children }) => (
    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg)', color: 'var(--accent)' }}>{children}</code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border px-2 py-1 text-left font-semibold text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>{children}</th>,
  td: ({ children }) => <td className="border px-2 py-1 text-xs" style={{ borderColor: 'var(--border)' }}>{children}</td>,
};

export default function ChatPage() {
  const [mbtiType, setMbtiType] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || streaming) return;

    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // AIメッセージのプレースホルダーを追加
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mbtiType: mbtiType || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `エラー: ${err.error}` };
          return updated;
        });
        setStreaming(false);
        return;
      }

      // SSEストリームをパース
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
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              accumulated += parsed.delta.text;
              const current = accumulated;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: current };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: '通信エラーが発生しました。もう一度お試しください。' };
        return updated;
      });
    }

    setStreaming(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] h-[calc(100dvh-7rem)] max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-lg sm:text-xl font-bold flex-1">💬 MBTIチャット</h1>
        <select
          value={mbtiType}
          onChange={e => setMbtiType(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm border cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          <option value="">タイプ未選択</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <div className="text-5xl">🧠</div>
            <div>
              <h2 className="text-lg font-semibold mb-1">MBTIについて何でも聞いてください</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {mbtiType
                  ? `${mbtiType}タイプとして相談できます`
                  : 'タイプを選択するとより的確なアドバイスが得られます'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 rounded-full text-xs border cursor-pointer transition-all hover:scale-105"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
              }`}
              style={
                msg.role === 'user'
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }
              }
            >
              {msg.role === 'assistant' ? (
                msg.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent)', animationDelay: '300ms' }} />
                  </div>
                )
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div
        className="pt-3 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-end gap-2 p-2 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm py-2 px-2"
            style={{ color: 'var(--text)', maxHeight: '120px' }}
            disabled={streaming}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="p-2 rounded-lg text-white transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
          MBTIは性格の傾向を示すツールです。AIの回答は参考としてご活用ください。
        </p>
      </div>
    </div>
  );
}
