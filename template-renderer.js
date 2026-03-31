// TemplateRenderer — テンプレート A/B/C 選択・出力 (Req 11, 12)

import { getFunction, getAxis, getCategoryName, formatBuiltinText, formatFunctionTypeList } from './builtin-data.js';

/**
 * 見出し文字列を組み立てる (Req 11.1)
 * @param {{ kind: 'type_category', typeName: string, category: number } | { kind: 'function', abbr: string } | { kind: 'axis', abbr: string }} context
 * @returns {string}
 */
export function buildHeading(context) {
  if (context.kind === 'type_category') {
    return `${context.typeName} - ${getCategoryName(context.category)}`;
  }
  if (context.kind === 'function') {
    const f = getFunction(context.abbr);
    return `${context.abbr} - ${f.fullName}`;
  }
  if (context.kind === 'axis') {
    const a = getAxis(context.abbr);
    return `${context.abbr} - ${a.fullName}`;
  }
  return '';
}

/**
 * テンプレートA — Web取得成功 + APIモード + API成功 (Req 11.1)
 */
export function renderTemplateA(heading, apiText, url, context) {
  let output = `=== ${heading} ===\n${apiText}\n`;
  if (context.kind === 'function') {
    output += `${formatFunctionTypeList(context.abbr)}\n`;
  }
  output += `※ AI生成テキスト\n出典: ${url}`;
  return output;
}

/**
 * テンプレートB — Web取得成功 + スタンドアロン or API失敗 (Req 11.1)
 */
export function renderTemplateB(heading, extractedText, url, context) {
  let output = `=== ${heading} ===\n${extractedText}\n`;
  if (context.kind === 'function') {
    output += `${formatFunctionTypeList(context.abbr)}\n`;
  }
  output += `出典: ${url}`;
  return output;
}

/**
 * テンプレートC — フォールバック (Req 11.1)
 */
export function renderTemplateC(heading, context) {
  const builtinText = formatBuiltinText(context);
  return `=== ${heading} ===\n${builtinText}\n出典: ビルトイン情報（参考: wikiwiki.jp/16types）`;
}

/**
 * エラー表示レイアウト (Req 9.3)
 * エラーメッセージ + 空行1行 + テンプレート
 */
export function renderWithError(errorMessage, templateOutput) {
  return `${errorMessage}\n\n${templateOutput}`;
}

/**
 * 診断結果の免責文 (Req 12.1)
 */
export const DISCLAIMER = `※ この診断は参考用の簡易テストです。公式のMBTI診断（Myers-Briggs Type Indicator®）とは
  異なります。正確なタイプを知るには資格保持者によるフィードバックセッションを受けることを
  推奨します。`;
