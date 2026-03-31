// InputNormalizer — 入力正規化・判定順序制御 (Req 6)

import { isValidType, isValidFunction, isValidAxis } from './builtin-data.js';

/** @typedef {'help' | 'zero' | 'quit' | 'answer_a' | 'answer_b' | 'navigate_t' | 'menu_item' | 'category_item' | 'domain_value' | 'invalid'} InputType */

/** @typedef {Object} NormalizeResult
 * @property {InputType} type
 * @property {string} raw
 * @property {string} [value]
 */

/**
 * 全角スペース→半角、トリム、全角英数→半角
 * @param {string} input
 * @returns {string}
 */
function commonNormalize(input) {
  // 全角スペース→半角
  let s = input.replace(/\u3000/g, ' ');
  // 前後トリム
  s = s.trim();
  if (s.length === 0) return s;
  // 全角英字→半角、全角数字→半角
  s = s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
  return s;
}

/**
 * @param {string} rawInput
 * @param {string} currentState
 * @returns {NormalizeResult}
 */
export function normalize(rawInput, currentState) {
  const raw = commonNormalize(rawInput);

  // トリム後空文字 → 即無効
  if (raw.length === 0) {
    return { type: 'invalid', raw };
  }

  // ステップ1: help判定
  if (raw.toLowerCase() === 'help') {
    return { type: 'help', raw };
  }

  // ステップ2: 0判定
  if (raw === '0') {
    if (currentState === 'DIAGNOSIS_QUESTION') {
      return { type: 'invalid', raw };
    }
    return { type: 'zero', raw, value: '0' };
  }

  // ステップ3: 状態固有予約コマンド
  switch (currentState) {
    case 'MAIN_MENU': {
      if (['1', '2', '3', '4'].includes(raw)) {
        return { type: 'menu_item', raw, value: raw };
      }
      break;
    }
    case 'DIAGNOSIS_QUESTION': {
      const upper = raw.toUpperCase();
      if (upper === 'A') return { type: 'answer_a', raw, value: 'A' };
      if (upper === 'B') return { type: 'answer_b', raw, value: 'B' };
      if (upper === 'Q' || upper === 'QUIT') return { type: 'quit', raw };
      break;
    }
    case 'DIAGNOSIS_RESULT': {
      if (raw.toLowerCase() === 't') return { type: 'navigate_t', raw };
      break;
    }
    case 'TYPE_CATEGORY': {
      if (['1', '2', '3', '4', '5', '6', '7'].includes(raw)) {
        return { type: 'category_item', raw, value: raw };
      }
      break;
    }
  }

  // ステップ4: 状態別形式変換 + ドメイン値判定
  switch (currentState) {
    case 'TYPE_SELECT': {
      const upper = raw.toUpperCase();
      if (isValidType(upper)) {
        return { type: 'domain_value', raw, value: upper };
      }
      break;
    }
    case 'FUNCTION_SELECT': {
      if (raw.length >= 2) {
        const normalized = raw.charAt(0).toUpperCase() + raw.charAt(1).toLowerCase() + raw.slice(2);
        if (isValidFunction(normalized)) {
          return { type: 'domain_value', raw, value: normalized };
        }
      }
      break;
    }
    case 'AXIS_SELECT': {
      const upper = raw.toUpperCase();
      if (isValidAxis(upper)) {
        return { type: 'domain_value', raw, value: upper };
      }
      break;
    }
  }

  return { type: 'invalid', raw };
}
