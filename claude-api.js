// ClaudeAPI — Anthropic Messages API 連携 (Req 9.2, 15)

import * as logger from './debug-logger.js';
import { truncateText } from './wiki-fetcher.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const API_TIMEOUT_MS = 30000;
const MAX_TOKENS = 1024;

const SYSTEM_PROMPT_PREFIX = `あなたはMBTI（Myers-Briggs Type Indicator）の専門家です。
以下のwikiwiki.jp/16typesの内容のみを根拠として日本語で回答してください。
提供されたテキストに記載のない情報を補足・推測・外挿してはいけません。
回答は箇条書きまたは短い段落で構成し、簡潔にまとめてください。

--- 参考テキスト ---
`;

/**
 * システムプロンプトの固定部分を返す（テスト用）
 */
export function getSystemPromptPrefix() {
  return SYSTEM_PROMPT_PREFIX;
}

/**
 * Claude API を呼び出して要約テキストを返す
 * @param {string} wikiText - 抽出済みWikiテキスト（最大5000文字に切り詰め済み）
 * @param {string} userMessage - ユーザーメッセージ
 * @param {string} apiKey
 * @param {string} model
 * @returns {Promise<{ ok: boolean, text?: string, error?: string, is401?: boolean }>}
 */
export async function summarize(wikiText, userMessage, apiKey, model) {
  const contextText = truncateText(wikiText, 5000);
  const systemPrompt = SYSTEM_PROMPT_PREFIX + contextText;

  const body = JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const estimatedTokens = Math.floor((systemPrompt.length + userMessage.length) / 4);
  const start = Date.now();

  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      body,
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    if (err.name === 'AbortError') {
      logger.logApiError(0, 'timeout', 'タイムアウト');
      return { ok: false, error: 'APIの応答がタイムアウトしました。' };
    }
    logger.logApiError(0, 'network', err.message);
    return { ok: false, error: 'API呼び出しに失敗しました（ネットワークエラー）。' };
  }

  const elapsed = Date.now() - start;

  // 非2xx
  if (!response.ok) {
    const status = response.status;
    if (status === 401) {
      logger.logApiError(status, 'auth', '無効なAPIキー');
      return { ok: false, error: 'APIキーが無効です。ANTHROPIC_API_KEY を確認してください。', is401: true };
    }
    if (status === 429) {
      logger.logApiError(status, 'rate_limit', 'レート制限');
      return { ok: false, error: 'APIのレート制限に達しました。しばらく待ってから再試行してください。' };
    }
    logger.logApiError(status, 'http', `HTTP ${status}`);
    return { ok: false, error: `API呼び出しに失敗しました（HTTP ${status}）。` };
  }

  // 2xx — JSONデコード + 検証
  let json;
  try {
    json = await response.json();
  } catch {
    logger.logApiError(response.status, 'parse', 'JSONパース失敗');
    return { ok: false, error: 'API呼び出しに失敗しました（レスポンスを解析できませんでした）。' };
  }

  // ルート型チェック
  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    logger.logApiError(response.status, 'parse', 'ルート非オブジェクト');
    return { ok: false, error: 'API呼び出しに失敗しました（レスポンスを解析できませんでした）。' };
  }

  // content 配列チェック
  if (!Array.isArray(json.content) || json.content.length === 0) {
    logger.logApiError(response.status, 'parse', 'content空');
    return { ok: false, error: 'API呼び出しに失敗しました（レスポンスを解析できませんでした）。' };
  }

  // content[0] 検証
  const first = json.content[0];
  if (first.type !== 'text' || typeof first.text !== 'string') {
    logger.logApiError(response.status, 'parse', 'content[0]不正');
    return { ok: false, error: 'API呼び出しに失敗しました（レスポンスを解析できませんでした）。' };
  }

  if (first.text.trim().length === 0) {
    logger.logApiError(response.status, 'parse', 'text空文字');
    return { ok: false, error: 'API呼び出しに失敗しました（レスポンスを解析できませんでした）。' };
  }

  logger.logApi(model, estimatedTokens, elapsed);

  // 800字超の場合は切り詰め
  let resultText = first.text;
  if (resultText.length > 800) {
    resultText = truncateText(resultText, 800);
  }

  return { ok: true, text: resultText };
}
