import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildHeading, renderTemplateA, renderTemplateB, renderTemplateC, renderWithError, DISCLAIMER } from '../template-renderer.js';

describe('TemplateRenderer: 見出し組み立て (Req 11.1)', () => {
  it('タイプカテゴリ見出し', () => {
    assert.equal(buildHeading({ kind: 'type_category', typeName: 'INTJ', category: 1 }), 'INTJ - 基本的な特徴');
  });
  it('機能見出し', () => {
    assert.equal(buildHeading({ kind: 'function', abbr: 'Ni' }), 'Ni - 内向的直観');
  });
  it('軸見出し', () => {
    assert.equal(buildHeading({ kind: 'axis', abbr: 'SN' }), 'SN - 感覚と直観');
  });
});

describe('TemplateRenderer: テンプレートA (Req 11.1)', () => {
  it('API生成テキスト + AI生成ラベル + 出典', () => {
    const output = renderTemplateA('INTJ - 基本的な特徴', 'AI要約テキスト', 'https://example.com', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(output.includes('=== INTJ - 基本的な特徴 ==='));
    assert.ok(output.includes('AI要約テキスト'));
    assert.ok(output.includes('※ AI生成テキスト'));
    assert.ok(output.includes('出典: https://example.com'));
  });

  it('機能表示時はタイプ一覧行が含まれる', () => {
    const output = renderTemplateA('Ni - 内向的直観', 'テスト', 'https://example.com', { kind: 'function', abbr: 'Ni' });
    assert.ok(output.includes('主/補機能タイプ一覧: Ni:'));
  });

  it('タイプカテゴリ表示時はタイプ一覧行なし', () => {
    const output = renderTemplateA('INTJ - 基本的な特徴', 'テスト', 'https://example.com', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(!output.includes('主/補機能タイプ一覧'));
  });
});

describe('TemplateRenderer: テンプレートB (Req 11.1)', () => {
  it('抽出テキスト + 出典 (AI生成ラベルなし)', () => {
    const output = renderTemplateB('INTJ - 基本的な特徴', '抽出テキスト', 'https://example.com', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(output.includes('=== INTJ - 基本的な特徴 ==='));
    assert.ok(output.includes('抽出テキスト'));
    assert.ok(!output.includes('※ AI生成テキスト'));
    assert.ok(output.includes('出典: https://example.com'));
  });
});

describe('TemplateRenderer: テンプレートC (Req 11.1)', () => {
  it('ビルトインテキスト + ビルトイン出典', () => {
    const output = renderTemplateC('INTJ - 基本的な特徴', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(output.includes('=== INTJ - 基本的な特徴 ==='));
    assert.ok(output.includes('INTJ'));
    assert.ok(output.includes('出典: ビルトイン情報（参考: wikiwiki.jp/16types）'));
  });

  it('カテゴリ2〜7は「この項目のビルトイン情報はありません。」', () => {
    for (let cat = 2; cat <= 7; cat++) {
      const output = renderTemplateC(`INTJ - テスト`, { kind: 'type_category', typeName: 'INTJ', category: cat });
      assert.ok(output.includes('この項目のビルトイン情報はありません。'));
    }
  });

  it('テンプレートCはタイプ一覧行を含まない', () => {
    const output = renderTemplateC('Ni - 内向的直観', { kind: 'function', abbr: 'Ni' });
    assert.ok(!output.includes('主/補機能タイプ一覧'));
    assert.ok(output.includes('主機能: INFJ, INTJ / 補助機能: ENFJ, ENTJ'));
  });
});

describe('TemplateRenderer: エラー表示レイアウト (Req 9.3)', () => {
  it('エラーメッセージ + 空行1行 + テンプレート', () => {
    const output = renderWithError('エラーです。', '=== 見出し ===\n本文');
    const lines = output.split('\n');
    assert.equal(lines[0], 'エラーです。');
    assert.equal(lines[1], '');
    assert.equal(lines[2], '=== 見出し ===');
  });
});

describe('TemplateRenderer: テンプレート選択ロジック (Req 11.3)', () => {
  it('テンプレートA: Web成功 + APIモード + API成功', () => {
    const output = renderTemplateA('test', 'api text', 'url', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(output.includes('※ AI生成テキスト'));
  });
  it('テンプレートB: Web成功 + スタンドアロン', () => {
    const output = renderTemplateB('test', 'extracted', 'url', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(!output.includes('※ AI生成テキスト'));
    assert.ok(output.includes('出典: url'));
  });
  it('テンプレートC: Web失敗', () => {
    const output = renderTemplateC('test', { kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(output.includes('ビルトイン情報'));
  });
});

describe('TemplateRenderer: 免責表示 (Req 12.1)', () => {
  it('免責文が正しい文言', () => {
    assert.ok(DISCLAIMER.includes('※ この診断は参考用の簡易テストです'));
    assert.ok(DISCLAIMER.includes('Myers-Briggs Type Indicator®'));
    assert.ok(DISCLAIMER.includes('資格保持者'));
  });
});
