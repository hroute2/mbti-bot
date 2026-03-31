import { getType, getFunction, getAxis } from '../../../builtin-data.js';

const SYSTEM_PROMPT = `あなたはMBTI（Myers-Briggs Type Indicator）の専門家カウンセラーです。
ユーザーのMBTIタイプに基づいて、親身で的確なアドバイスや考察を日本語で提供してください。

## あなたの役割
- ユーザーのMBTIタイプの特性を踏まえた個別のアドバイスを提供する
- 性格タイプに関する疑問や悩みに寄り添って回答する
- 人間関係、キャリア、自己成長などの相談に対応する
- 各タイプの強みと成長ポイントをバランスよく伝える

## 注意点
- MBTIは性格の傾向を示すツールであり、人を固定的に分類するものではないことを意識する
- 断定的な表現を避け、「〜の傾向があります」「〜かもしれません」といった柔軟な表現を使う
- ユーザーの個別の状況を尊重し、タイプだけで全てを判断しない
- 回答は簡潔で読みやすく、箇条書きや段落を適切に使い分ける`;

function buildTypeContext(mbtiType) {
  const t = getType(mbtiType);
  if (!t) return '';
  const mainFn = getFunction(t.mainFunction);
  const auxFn = getFunction(t.auxFunction);
  return `
## ユーザーのMBTIタイプ情報
- タイプ: ${t.name}
- 概要: ${t.summary}
- 主機能: ${t.mainFunction}（${mainFn?.fullName}）— ${mainFn?.description}
- 補助機能: ${t.auxFunction}（${auxFn?.fullName}）— ${auxFn?.description}`;
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = (process.env.ANTHROPIC_MODEL || '').trim() || 'claude-sonnet-4-6';

  if (!apiKey) {
    return Response.json({ error: 'APIキーが設定されていません。' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages, mbtiType } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'メッセージが必要です' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPT + (mbtiType ? buildTypeContext(mbtiType) : '');

  const apiMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        stream: true,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 401) return Response.json({ error: 'APIキーが無効です。' }, { status: 401 });
      if (status === 429) return Response.json({ error: 'レート制限に達しました。しばらく待ってから再試行してください。' }, { status: 429 });
      return Response.json({ error: `API呼び出しに失敗しました（HTTP ${status}）` }, { status: 502 });
    }

    // SSEストリームをそのまま転送
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return Response.json({ error: 'API呼び出しに失敗しました。' }, { status: 502 });
  }
}
