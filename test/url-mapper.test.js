import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildTypeBaseUrl, buildTypeCategoryUrl, buildFunctionUrl, buildAxisUrl } from '../url-mapper.js';

const BASE = 'https://wikiwiki.jp/16types/';
const ALL_TYPES = ['ESTJ','ESTP','ESFJ','ESFP','ENTJ','ENTP','ENFJ','ENFP','ISTJ','ISTP','ISFJ','ISFP','INTJ','INTP','INFJ','INFP'];

describe('URLMapper: タイプ基本ページURL (16件)', () => {
  for (const type of ALL_TYPES) {
    it(`${type} → ${BASE}${type}`, () => {
      assert.equal(buildTypeBaseUrl(type), `${BASE}${type}`);
    });
  }
});

describe('URLMapper: タイプ別カテゴリページURL (16×7=112件)', () => {
  const SLUG_TEMPLATES = {
    1: (t) => `${t}の特徴`,
    2: (t) => `${t}の美徳と限界、そして挑戦的課題`,
    3: (t) => `${t}の人間関係\u3000恋愛`,
    4: (t) => `${t}の趣味`,
    5: (t) => `${t}の嫌なこと、ストレスとその対処`,
    6: (t) => `${t}のリーダーシップ`,
    7: (t) => `${t}に向いている職業、キャリア、お仕事、役割`,
  };

  for (const type of ALL_TYPES) {
    for (let cat = 1; cat <= 7; cat++) {
      it(`${type} cat${cat}`, () => {
        const url = buildTypeCategoryUrl(type, cat);
        const expected = `${BASE}${encodeURIComponent(SLUG_TEMPLATES[cat](type))}`;
        assert.equal(url, expected);
        assert.ok(url.startsWith(BASE));
      });
    }
  }

  it('カテゴリ3のスラッグに全角スペースが含まれる', () => {
    const url = buildTypeCategoryUrl('INTJ', 3);
    assert.ok(url.includes(encodeURIComponent('\u3000')));
  });

  it('無効なカテゴリ → null', () => {
    assert.equal(buildTypeCategoryUrl('INTJ', 8), null);
    assert.equal(buildTypeCategoryUrl('INTJ', 0), null);
  });
});

describe('URLMapper: 心理機能ページURL (8件)', () => {
  const SLUGS = {
    Se: '外向的感覚（Se）', Si: '内向的感覚（Si）',
    Ne: '外向的直観（Ne）', Ni: '内向的直観（Ni）',
    Te: '外向的思考（Te）', Ti: '内向的思考（Ti）',
    Fe: '外向的感情（Fe）', Fi: '内向的感情（Fi）',
  };

  for (const [abbr, slug] of Object.entries(SLUGS)) {
    it(`${abbr} → ${BASE}${encodeURIComponent(slug)}`, () => {
      assert.equal(buildFunctionUrl(abbr), `${BASE}${encodeURIComponent(slug)}`);
    });
  }

  it('無効な略称 → null', () => {
    assert.equal(buildFunctionUrl('Xx'), null);
  });
});

describe('URLMapper: 傾向軸ページURL (4件)', () => {
  const SLUGS = {
    EI: '外向（E）と内向（I）',
    SN: '感覚（S）と直観（N）',
    TF: '思考（T）と感情（F）',
    JP: '規範（J）と柔軟（P）',
  };

  for (const [abbr, slug] of Object.entries(SLUGS)) {
    it(`${abbr} → ${BASE}${encodeURIComponent(slug)}`, () => {
      assert.equal(buildAxisUrl(abbr), `${BASE}${encodeURIComponent(slug)}`);
    });
  }

  it('無効な略称 → null', () => {
    assert.equal(buildAxisUrl('XX'), null);
  });
});
