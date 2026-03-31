import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { extractText } from '../wiki-fetcher.js';

describe('スモークテスト: wikiwiki.jp 実サイト整合性', () => {
  it('wikiwiki.jp/16types/INTJ から #content テキストが抽出できる', async () => {
    const url = 'https://wikiwiki.jp/16types/INTJ';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MBTIBot/1.0 (Node.js; educational-use)' },
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    const text = extractText(html);
    assert.ok(text.length > 0, `抽出テキストが0文字: ${text.length}`);
    // INTJ関連のコンテンツが含まれることを確認
    assert.ok(text.includes('INTJ'), 'INTJ というテキストが含まれない');
  });
});
