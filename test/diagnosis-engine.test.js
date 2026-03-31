import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { evaluate } from '../diagnosis-engine.js';

describe('DiagnosisEngine: スコアリング (Req 2.3-2.5)', () => {
  it('全A回答 → ESTJ (+4/+4/+4/+4)', () => {
    const answers = Array(16).fill('A');
    const result = evaluate(answers);
    assert.equal(result.type, 'ESTJ');
    assert.equal(result.scores.EI, 4);
    assert.equal(result.scores.SN, 4);
    assert.equal(result.scores.TF, 4);
    assert.equal(result.scores.JP, 4);
    assert.equal(result.scoreBreakdown, 'E+4 / S+4 / T+4 / J+4');
  });

  it('全B回答 → INFP (-4/-4/-4/-4)', () => {
    const answers = Array(16).fill('B');
    const result = evaluate(answers);
    assert.equal(result.type, 'INFP');
    assert.equal(result.scores.EI, -4);
    assert.equal(result.scores.SN, -4);
    assert.equal(result.scores.TF, -4);
    assert.equal(result.scores.JP, -4);
    assert.equal(result.scoreBreakdown, 'I-4 / N-4 / F-4 / P-4');
  });

  it('同点(0) → I/N/F/P がデフォルト採用', () => {
    // AABB AABB AABB AABB → 各軸0
    const answers = ['A','A','B','B','A','A','B','B','A','A','B','B','A','A','B','B'];
    const result = evaluate(answers);
    assert.equal(result.type, 'INFP');
    assert.equal(result.scores.EI, 0);
    assert.equal(result.scores.SN, 0);
    assert.equal(result.scores.TF, 0);
    assert.equal(result.scores.JP, 0);
    assert.ok(result.scoreBreakdown.includes('I0→I'));
    assert.ok(result.scoreBreakdown.includes('N0→N'));
    assert.ok(result.scoreBreakdown.includes('F0→F'));
    assert.ok(result.scoreBreakdown.includes('P0→P'));
  });

  it('+2/-2 のスコア', () => {
    // AAAB AAAB AAAB AAAB → 各軸+2
    const answers = ['A','A','A','B','A','A','A','B','A','A','A','B','A','A','A','B'];
    const result = evaluate(answers);
    assert.equal(result.type, 'ESTJ');
    assert.equal(result.scores.EI, 2);
    assert.equal(result.scoreBreakdown, 'E+2 / S+2 / T+2 / J+2');
  });

  it('純粋関数: 同じ入力から同じ結果', () => {
    const answers = ['A','B','A','B','B','A','B','A','A','B','A','B','B','A','B','A'];
    const r1 = evaluate(answers);
    const r2 = evaluate(answers);
    assert.equal(r1.type, r2.type);
    assert.equal(r1.scoreBreakdown, r2.scoreBreakdown);
    assert.deepEqual(r1.scores, r2.scores);
  });
});

describe('DiagnosisEngine: 全16タイプ到達テスト', () => {
  const ALL_TYPES = ['ESTJ','ESTP','ESFJ','ESFP','ENTJ','ENTP','ENFJ','ENFP','ISTJ','ISTP','ISFJ','ISFP','INTJ','INTP','INFJ','INFP'];

  // 各タイプに対応する回答パターンを生成
  function answersForType(type) {
    const axes = [
      { target: type[0], first: 'E', idx: [0,1,2,3] },
      { target: type[1], first: 'S', idx: [4,5,6,7] },
      { target: type[2], first: 'T', idx: [8,9,10,11] },
      { target: type[3], first: 'J', idx: [12,13,14,15] },
    ];
    const answers = Array(16).fill('A');
    for (const axis of axes) {
      if (axis.target !== axis.first) {
        for (const i of axis.idx) answers[i] = 'B';
      }
    }
    return answers;
  }

  for (const type of ALL_TYPES) {
    it(`${type} に到達可能`, () => {
      const answers = answersForType(type);
      const result = evaluate(answers);
      assert.equal(result.type, type);
    });
  }
});
