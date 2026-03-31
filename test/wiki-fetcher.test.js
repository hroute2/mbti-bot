import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { extractText, truncateText } from '../wiki-fetcher.js';

describe('WikiFetcher: HTML抽出 (Req 8.1-8.3)', () => {
  it('#content からテキストを抽出する', () => {
    const html = '<html><body><div id="content"><p>テスト内容</p></div></body></html>';
    const text = extractText(html);
    assert.equal(text, 'テスト内容');
  });

  it('#content が不在 → テキスト0文字', () => {
    const html = '<html><body><div id="main">テスト</div></body></html>';
    const text = extractText(html);
    assert.equal(text, '');
  });

  it('script/style を除去', () => {
    const html = '<div id="content"><script>alert(1)</script><style>.x{}</style><p>本文</p></div>';
    const text = extractText(html);
    assert.ok(!text.includes('alert'));
    assert.ok(!text.includes('.x'));
    assert.ok(text.includes('本文'));
  });

  it('除去対象ID要素を除去', () => {
    const html = `<div id="content">
      <div id="menubar">メニュー</div>
      <div id="edit-menu">編集</div>
      <div id="footer">フッター</div>
      <p>本文</p>
    </div>`;
    const text = extractText(html);
    assert.ok(!text.includes('メニュー'));
    assert.ok(!text.includes('編集'));
    assert.ok(!text.includes('フッター'));
    assert.ok(text.includes('本文'));
  });

  it('div-gpt-ad- で始まるID要素を除去', () => {
    const html = '<div id="content"><div id="div-gpt-ad-123">広告</div><p>本文</p></div>';
    const text = extractText(html);
    assert.ok(!text.includes('広告'));
    assert.ok(text.includes('本文'));
  });

  it('ad- で始まるクラストークンの要素を除去', () => {
    const html = '<div id="content"><div class="sidebar ad-banner">広告</div><p>本文</p></div>';
    const text = extractText(html);
    assert.ok(!text.includes('広告'));
    assert.ok(text.includes('本文'));
  });

  it('ad- で始まらないクラスは除去しない', () => {
    const html = '<div id="content"><div class="loading-badge">バッジ</div></div>';
    const text = extractText(html);
    assert.ok(text.includes('バッジ'));
  });

  it('class属性なしの要素は除去しない', () => {
    const html = '<div id="content"><div>保持</div></div>';
    const text = extractText(html);
    assert.ok(text.includes('保持'));
  });

  it('class=""の要素は除去しない', () => {
    const html = '<div id="content"><div class="">保持</div></div>';
    const text = extractText(html);
    assert.ok(text.includes('保持'));
  });

  it('ブロック要素の後に改行', () => {
    const html = '<div id="content"><h1>見出し</h1><p>段落</p></div>';
    const text = extractText(html);
    assert.ok(text.includes('見出し\n'));
    assert.ok(text.includes('段落'));
  });

  it('td/th の後にスペース', () => {
    const html = '<div id="content"><table><tr><td>A</td><td>B</td></tr></table></div>';
    const text = extractText(html);
    assert.ok(text.includes('A B'));
  });

  it('br → 改行', () => {
    const html = '<div id="content"><p>行1<br>行2</p></div>';
    const text = extractText(html);
    assert.ok(text.includes('行1\n行2'));
  });

  it('a タグは子テキストのみ', () => {
    const html = '<div id="content"><p><a href="http://example.com">リンク</a></p></div>';
    const text = extractText(html);
    assert.ok(text.includes('リンク'));
    assert.ok(!text.includes('http'));
  });

  it('3行以上の連続改行を2行に圧縮', () => {
    const html = '<div id="content"><p>A</p><p></p><p></p><p></p><p>B</p></div>';
    const text = extractText(html);
    assert.ok(!text.includes('\n\n\n'));
  });
});

describe('WikiFetcher: テキスト切り詰め (Req 8.4-8.5)', () => {
  it('800字以内はそのまま', () => {
    const text = 'あ'.repeat(800);
    assert.equal(truncateText(text, 800), text);
  });

  it('801字以上は800字で切り詰め', () => {
    const text = 'あ'.repeat(900);
    assert.equal(truncateText(text, 800).length, 800);
  });

  it('800字制限で文末記号を探す (。)', () => {
    const text = 'あ'.repeat(770) + '。' + 'い'.repeat(100);
    const result = truncateText(text, 800);
    assert.ok(result.endsWith('。'));
    assert.equal(result.length, 771);
  });

  it('800字制限で文末記号なし → 800字でそのまま切る', () => {
    const text = 'あ'.repeat(900);
    const result = truncateText(text, 800);
    assert.equal(result.length, 800);
  });

  it('50文字以上前の文末記号は無視 → 800字でそのまま', () => {
    const text = 'あ'.repeat(740) + '。' + 'い'.repeat(200);
    const result = truncateText(text, 800);
    assert.equal(result.length, 800);
  });

  it('5000字切り詰め', () => {
    const text = 'あ'.repeat(6000);
    assert.equal(truncateText(text, 5000).length, 5000);
  });
});
