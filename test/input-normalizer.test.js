import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalize } from '../input-normalizer.js';

describe('InputNormalizer: 共通正規化 (Req 6.1-6.2)', () => {
  it('全角スペーストリム', () => {
    const r = normalize('\u3000INTJ\u3000', 'TYPE_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'INTJ');
  });

  it('トリム後空文字 → 無効', () => {
    assert.equal(normalize('   ', 'MAIN_MENU').type, 'invalid');
    assert.equal(normalize('\u3000', 'MAIN_MENU').type, 'invalid');
    assert.equal(normalize('', 'MAIN_MENU').type, 'invalid');
  });

  it('全角英字→半角 (ＩＮＴＪ → INTJ)', () => {
    const r = normalize('ＩＮＴＪ', 'TYPE_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'INTJ');
  });

  it('全角数字→半角 (０ → 0)', () => {
    const r = normalize('０', 'MAIN_MENU');
    assert.equal(r.type, 'zero');
  });

  it('全角数字→半角 (１ → 1)', () => {
    const r = normalize('１', 'MAIN_MENU');
    assert.equal(r.type, 'menu_item');
    assert.equal(r.value, '1');
  });
});

describe('InputNormalizer: help判定 (Req 6.3 ステップ1)', () => {
  const STATES = ['MAIN_MENU', 'DIAGNOSIS_QUESTION', 'DIAGNOSIS_RESULT', 'TYPE_SELECT', 'TYPE_CATEGORY', 'FUNCTION_SELECT', 'AXIS_SELECT'];

  for (const state of STATES) {
    it(`${state} で help が先行判定される`, () => {
      assert.equal(normalize('help', state).type, 'help');
      assert.equal(normalize('HELP', state).type, 'help');
      assert.equal(normalize('Help', state).type, 'help');
    });
  }

  it('全角 ｈｅｌｐ も受理', () => {
    assert.equal(normalize('ｈｅｌｐ', 'MAIN_MENU').type, 'help');
  });

  it('AXIS_SELECT で help が軸略称ではなくhelpコマンド', () => {
    assert.equal(normalize('help', 'AXIS_SELECT').type, 'help');
  });
});

describe('InputNormalizer: 0判定 (Req 6.3 ステップ2)', () => {
  it('DIAGNOSIS_QUESTION で 0 は無効', () => {
    assert.equal(normalize('0', 'DIAGNOSIS_QUESTION').type, 'invalid');
  });

  it('他の状態で 0 は zero', () => {
    for (const state of ['MAIN_MENU', 'TYPE_SELECT', 'TYPE_CATEGORY', 'FUNCTION_SELECT', 'AXIS_SELECT', 'DIAGNOSIS_RESULT']) {
      assert.equal(normalize('0', state).type, 'zero');
    }
  });
});

describe('InputNormalizer: MAIN_MENU (Req 6.3 ステップ3)', () => {
  for (const n of ['1','2','3','4']) {
    it(`${n} → menu_item`, () => {
      const r = normalize(n, 'MAIN_MENU');
      assert.equal(r.type, 'menu_item');
      assert.equal(r.value, n);
    });
  }
  it('9 → invalid', () => {
    assert.equal(normalize('9', 'MAIN_MENU').type, 'invalid');
  });
});

describe('InputNormalizer: DIAGNOSIS_QUESTION (Req 6.7)', () => {
  it('A/a → answer_a', () => {
    assert.equal(normalize('A', 'DIAGNOSIS_QUESTION').type, 'answer_a');
    assert.equal(normalize('a', 'DIAGNOSIS_QUESTION').type, 'answer_a');
  });
  it('B/b → answer_b', () => {
    assert.equal(normalize('B', 'DIAGNOSIS_QUESTION').type, 'answer_b');
    assert.equal(normalize('b', 'DIAGNOSIS_QUESTION').type, 'answer_b');
  });
  it('q/Q/quit/QUIT → quit', () => {
    assert.equal(normalize('q', 'DIAGNOSIS_QUESTION').type, 'quit');
    assert.equal(normalize('Q', 'DIAGNOSIS_QUESTION').type, 'quit');
    assert.equal(normalize('quit', 'DIAGNOSIS_QUESTION').type, 'quit');
    assert.equal(normalize('QUIT', 'DIAGNOSIS_QUESTION').type, 'quit');
    assert.equal(normalize('Quit', 'DIAGNOSIS_QUESTION').type, 'quit');
  });
});

describe('InputNormalizer: DIAGNOSIS_RESULT (Req 6.9)', () => {
  it('t/T → navigate_t', () => {
    assert.equal(normalize('t', 'DIAGNOSIS_RESULT').type, 'navigate_t');
    assert.equal(normalize('T', 'DIAGNOSIS_RESULT').type, 'navigate_t');
  });
});

describe('InputNormalizer: TYPE_SELECT (Req 6.4)', () => {
  it('intj → INTJ (大文字変換)', () => {
    const r = normalize('intj', 'TYPE_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'INTJ');
  });
  it('InTj → INTJ', () => {
    const r = normalize('InTj', 'TYPE_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'INTJ');
  });
  it('enfp → ENFP', () => {
    const r = normalize('enfp', 'TYPE_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'ENFP');
  });
  it('xxxx → invalid', () => {
    assert.equal(normalize('xxxx', 'TYPE_SELECT').type, 'invalid');
  });
});

describe('InputNormalizer: FUNCTION_SELECT (Req 6.5)', () => {
  it('SE → Se (先頭大文字・2文字目小文字)', () => {
    const r = normalize('SE', 'FUNCTION_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'Se');
  });
  it('se → Se', () => {
    const r = normalize('se', 'FUNCTION_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'Se');
  });
  it('ni → Ni', () => {
    const r = normalize('ni', 'FUNCTION_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'Ni');
  });
  it('NI → Ni', () => {
    const r = normalize('NI', 'FUNCTION_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'Ni');
  });
  it('xx → invalid', () => {
    assert.equal(normalize('xx', 'FUNCTION_SELECT').type, 'invalid');
  });
});

describe('InputNormalizer: AXIS_SELECT (Req 6.6)', () => {
  it('ei → EI (全大文字変換)', () => {
    const r = normalize('ei', 'AXIS_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'EI');
  });
  it('sn → SN', () => {
    const r = normalize('sn', 'AXIS_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'SN');
  });
  it('tf → TF', () => {
    const r = normalize('tf', 'AXIS_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'TF');
  });
  it('jp → JP', () => {
    const r = normalize('jp', 'AXIS_SELECT');
    assert.equal(r.type, 'domain_value');
    assert.equal(r.value, 'JP');
  });
  it('xx → invalid', () => {
    assert.equal(normalize('xx', 'AXIS_SELECT').type, 'invalid');
  });
});

describe('InputNormalizer: TYPE_CATEGORY (Req 6.3 ステップ3)', () => {
  for (const n of ['1','2','3','4','5','6','7']) {
    it(`${n} → category_item`, () => {
      const r = normalize(n, 'TYPE_CATEGORY');
      assert.equal(r.type, 'category_item');
      assert.equal(r.value, n);
    });
  }
  it('8 → invalid', () => {
    assert.equal(normalize('8', 'TYPE_CATEGORY').type, 'invalid');
  });
});

describe('InputNormalizer: 無効入力 (各状態×5等価クラス)', () => {
  const STATES = ['MAIN_MENU', 'DIAGNOSIS_QUESTION', 'DIAGNOSIS_RESULT', 'TYPE_SELECT', 'TYPE_CATEGORY', 'FUNCTION_SELECT', 'AXIS_SELECT'];

  for (const state of STATES) {
    it(`${state}: 空文字 → invalid`, () => {
      assert.equal(normalize('', state).type, 'invalid');
    });
    it(`${state}: 空白のみ → invalid`, () => {
      assert.equal(normalize('   ', state).type, 'invalid');
      assert.equal(normalize('\u3000', state).type, 'invalid');
    });
    it(`${state}: 未知英字列 → invalid`, () => {
      assert.equal(normalize('xyz', state).type, 'invalid');
    });
    it(`${state}: 未知数字 → invalid`, () => {
      assert.equal(normalize('9', state).type, 'invalid');
    });
    it(`${state}: 英数混在 → invalid`, () => {
      assert.equal(normalize('1abc', state).type, 'invalid');
    });
  }
});
