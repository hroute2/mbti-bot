// DiagnosisEngine — 16問スコアリング・タイプ判定 (Req 2)

import { getQuestions } from './builtin-data.js';

/** @typedef {Object} DiagnosisResult
 * @property {string} type
 * @property {string} scoreBreakdown
 * @property {{ EI: number, SN: number, TF: number, JP: number }} scores
 */

// 同点時のデフォルト: I/N/F/P (第2指標)
const TIE_DEFAULTS = { EI: 'I', SN: 'N', TF: 'F', JP: 'P' };
const AXIS_LABELS = {
  EI: { first: 'E', second: 'I' },
  SN: { first: 'S', second: 'N' },
  TF: { first: 'T', second: 'F' },
  JP: { first: 'J', second: 'P' },
};
const AXIS_ORDER = ['EI', 'SN', 'TF', 'JP'];

/**
 * @param {Array<'A' | 'B'>} answers - 16問の回答配列
 * @returns {DiagnosisResult}
 */
export function evaluate(answers) {
  const questions = getQuestions();
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (let i = 0; i < 16; i++) {
    const q = questions[i];
    scores[q.axis] += answers[i] === 'A' ? 1 : -1;
  }

  let type = '';
  const breakdownParts = [];

  for (const axis of AXIS_ORDER) {
    const score = scores[axis];
    const labels = AXIS_LABELS[axis];

    if (score > 0) {
      type += labels.first;
      breakdownParts.push(`${labels.first}+${score}`);
    } else if (score < 0) {
      type += labels.second;
      breakdownParts.push(`${labels.second}${score}`);
    } else {
      const def = TIE_DEFAULTS[axis];
      type += def;
      breakdownParts.push(`${def}0→${def}`);
    }
  }

  return {
    type,
    scoreBreakdown: breakdownParts.join(' / '),
    scores,
  };
}
