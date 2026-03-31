// URLMapper — コンテキストから wikiwiki.jp URL を生成 (Req 7)

const BASE = 'https://wikiwiki.jp/16types/';

// タイプ別カテゴリスラッグ (Req 7.1) — カテゴリ3は全角スペース
const CATEGORY_SLUGS = {
  1: (type) => `${type}の特徴`,
  2: (type) => `${type}の美徳と限界、そして挑戦的課題`,
  3: (type) => `${type}の人間関係\u3000恋愛`,
  4: (type) => `${type}の趣味`,
  5: (type) => `${type}の嫌なこと、ストレスとその対処`,
  6: (type) => `${type}のリーダーシップ`,
  7: (type) => `${type}に向いている職業、キャリア、お仕事、役割`,
};

// 心理機能スラッグ
const FUNCTION_SLUGS = {
  Se: '外向的感覚（Se）',
  Si: '内向的感覚（Si）',
  Ne: '外向的直観（Ne）',
  Ni: '内向的直観（Ni）',
  Te: '外向的思考（Te）',
  Ti: '内向的思考（Ti）',
  Fe: '外向的感情（Fe）',
  Fi: '内向的感情（Fi）',
};

// 傾向軸スラッグ
const AXIS_SLUGS = {
  EI: '外向（E）と内向（I）',
  SN: '感覚（S）と直観（N）',
  TF: '思考（T）と感情（F）',
  JP: '規範（J）と柔軟（P）',
};

/**
 * タイプ基本ページURL
 * @param {string} typeName
 * @returns {string}
 */
export function buildTypeBaseUrl(typeName) {
  return `${BASE}${typeName}`;
}

/**
 * タイプ別カテゴリページURL
 * @param {string} typeName
 * @param {number} category
 * @returns {string | null}
 */
export function buildTypeCategoryUrl(typeName, category) {
  const slugFn = CATEGORY_SLUGS[category];
  if (!slugFn) return null;
  return `${BASE}${encodeURIComponent(slugFn(typeName))}`;
}

/**
 * 心理機能ページURL
 * @param {string} abbr
 * @returns {string | null}
 */
export function buildFunctionUrl(abbr) {
  const slug = FUNCTION_SLUGS[abbr];
  if (!slug) return null;
  return `${BASE}${encodeURIComponent(slug)}`;
}

/**
 * 傾向軸ページURL
 * @param {string} abbr
 * @returns {string | null}
 */
export function buildAxisUrl(abbr) {
  const slug = AXIS_SLUGS[abbr];
  if (!slug) return null;
  return `${BASE}${encodeURIComponent(slug)}`;
}
