// WikiFetcher — HTTP取得・cheerio抽出・キャッシュ (Req 8, 9.1)

import { load } from 'cheerio';
import * as logger from './debug-logger.js';

const USER_AGENT = 'MBTIBot/1.0 (Node.js; educational-use)';
const TIMEOUT_MS = 10000;

const BLOCK_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','div','li','tr','br']);
const CELL_TAGS = new Set(['td','th']);

// メモリキャッシュ（キーはリダイレクト前の元URL、値は整形済みテキスト）
const cache = new Map();

/**
 * テスト用キャッシュクリア
 */
export function clearCache() {
  cache.clear();
}

/**
 * DOM を非破壊で再帰走査してテキストを組み立てる (Req 8.3)
 */
function extractNode(node) {
  if (node.type === 'text') {
    return node.data;
  }
  if (node.type !== 'tag') {
    return '';
  }

  const tag = node.name.toLowerCase();

  // br — 改行
  if (tag === 'br') {
    return '\n';
  }

  // 子を再帰走査
  let childText = '';
  if (node.children) {
    for (const child of node.children) {
      childText += extractNode(child);
    }
  }

  // td/th — スペース付加
  if (CELL_TAGS.has(tag)) {
    return childText + ' ';
  }

  // ブロック要素 — 改行付加
  if (BLOCK_TAGS.has(tag)) {
    return childText + '\n';
  }

  // インライン要素（a含む）— そのまま
  return childText;
}

/**
 * #content からテキストを抽出・整形 (Req 8.1-8.3)
 * @param {string} html
 * @returns {string}
 */
export function extractText(html) {
  const $ = load(html);

  // 除去対象要素を削除 (extractText呼び出し前に完了する前提だが、ここで行う)
  const $content = $('#content');
  if ($content.length === 0) {
    return '';
  }

  // 除去対象要素
  $content.find('script, style, #menubar, #edit-menu, #responsive-navigation, #footer, #share-button-root, #admin-contact-root, [id^="div-gpt-ad-"]').remove();

  // クラストークン判定による広告要素除去
  $content.find('*').each(function () {
    const classAttr = this.attribs && this.attribs.class;
    if (classAttr === undefined || classAttr === null) return;
    const tokens = (classAttr || '').split(/\s+/).filter(Boolean);
    if (tokens.some(token => token.startsWith('ad-'))) {
      $(this).remove();
    }
  });

  // 再帰走査でテキスト組み立て
  let rawText = '';
  for (const child of $content[0].children) {
    rawText += extractNode(child);
  }

  // 後処理
  const lines = rawText.split('\n').map(line => line.trim());
  let text = lines.join('\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * テキスト切り詰め (Req 8.4, 8.5)
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncateText(text, maxLen) {
  if (text.length <= maxLen) return text;
  // 800字制限: 50文字以内で文末記号を探す
  if (maxLen === 800) {
    const slice = text.slice(0, maxLen);
    for (let i = maxLen - 1; i >= maxLen - 50; i--) {
      const ch = slice[i];
      if (ch === '。' || ch === '！' || ch === '？' || ch === '\n') {
        return slice.slice(0, i + 1);
      }
    }
  }
  return text.slice(0, maxLen);
}

/**
 * HTTP取得 + テキスト抽出 (Req 8.6-8.9, 9.1)
 * @param {string} url
 * @returns {Promise<{ ok: boolean, text?: string, error?: string }>}
 */
export async function fetchAndExtract(url) {
  // キャッシュヒット
  if (cache.has(url)) {
    return { ok: true, text: cache.get(url) };
  }

  const result = await fetchWithRetry(url);
  if (result.ok) {
    cache.set(url, result.text);
  }
  return result;
}

/**
 * 実際のHTTP取得 + 再試行ロジック
 */
async function fetchWithRetry(url) {
  const firstResult = await doFetch(url);

  // 成功
  if (firstResult.ok) return firstResult;

  // 再試行対象: タイムアウト/接続エラーのみ
  if (firstResult.retryable) {
    const retryResult = await doFetch(url);
    return retryResult;
  }

  return firstResult;
}

/**
 * 単一のHTTPリクエスト実行
 */
async function doFetch(url) {
  const start = Date.now();
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    const errorType = err.name === 'AbortError' ? 'timeout' : 'connection';
    const message = err.name === 'AbortError' ? 'タイムアウト' : err.message;
    logger.logHttpError(url, errorType, message);
    return {
      ok: false,
      retryable: true,
      error: 'Webコンテンツの取得に失敗しました。',
    };
  }

  const elapsed = Date.now() - start;
  logger.logHttp(url, response.status, elapsed);

  // HTTP 404
  if (response.status === 404) {
    return {
      ok: false,
      retryable: false,
      error: 'このページはwikiwiki.jpに存在しません。',
    };
  }

  // その他の非2xx
  if (!response.ok) {
    return {
      ok: false,
      retryable: false,
      error: `Webコンテンツの取得に失敗しました（HTTPステータス: ${response.status}）。`,
    };
  }

  // HTTP 200 — テキスト抽出
  const html = await response.text();
  const text = extractText(html);

  if (text.length === 0) {
    return {
      ok: false,
      retryable: false,
      error: 'ページから情報を抽出できませんでした。',
    };
  }

  return { ok: true, text };
}
