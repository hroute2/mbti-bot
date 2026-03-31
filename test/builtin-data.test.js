import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  getType, getFunction, getAxis, getAllTypes, getQuestions,
  getCategoryName, isValidType, isValidFunction, isValidAxis,
  formatBuiltinText, formatFunctionTypeList,
} from '../builtin-data.js';

// 付録A.1 — 16タイプ正本データ一致テスト (Req 16.1)
describe('BuiltinData: 16タイプ正本データ (付録A.1)', () => {
  const CANONICAL = [
    { name: 'ESTJ', summary: '実践的な管理者。秩序と効率を重んじ、明確なルールで組織を運営する。', main: 'Te', aux: 'Si', url: 'https://wikiwiki.jp/16types/ESTJ' },
    { name: 'ESTP', summary: '行動派のリアリスト。現実の問題に即座に対応し、体験を通じて学ぶ。', main: 'Se', aux: 'Ti', url: 'https://wikiwiki.jp/16types/ESTP' },
    { name: 'ESFJ', summary: '思いやりの調和者。周囲の感情に敏感で、温かい環境づくりに貢献する。', main: 'Fe', aux: 'Si', url: 'https://wikiwiki.jp/16types/ESFJ' },
    { name: 'ESFP', summary: '陽気なエンターテイナー。今この瞬間を楽しみ、人々に活気をもたらす。', main: 'Se', aux: 'Fi', url: 'https://wikiwiki.jp/16types/ESFP' },
    { name: 'ENTJ', summary: '大胆な指揮官。戦略的思考でビジョンを描き、組織を目標へ導く。', main: 'Te', aux: 'Ni', url: 'https://wikiwiki.jp/16types/ENTJ' },
    { name: 'ENTP', summary: '発明家の討論者。既存の概念に挑み、創造的な解決策を生み出す。', main: 'Ne', aux: 'Ti', url: 'https://wikiwiki.jp/16types/ENTP' },
    { name: 'ENFJ', summary: 'カリスマ的な教育者。他者の成長を促し、理想の実現に情熱を注ぐ。', main: 'Fe', aux: 'Ni', url: 'https://wikiwiki.jp/16types/ENFJ' },
    { name: 'ENFP', summary: '自由な探求者。可能性に満ちた世界を見出し、情熱で人々を鼓舞する。', main: 'Ne', aux: 'Fi', url: 'https://wikiwiki.jp/16types/ENFP' },
    { name: 'ISTJ', summary: '誠実な管理者。責任感が強く、事実と経験に基づいて着実に遂行する。', main: 'Si', aux: 'Te', url: 'https://wikiwiki.jp/16types/ISTJ' },
    { name: 'ISTP', summary: '冷静な分析者。論理的に仕組みを理解し、実践的な問題解決に長ける。', main: 'Ti', aux: 'Se', url: 'https://wikiwiki.jp/16types/ISTP' },
    { name: 'ISFJ', summary: '献身的な守護者。忠実で細やかな配慮をもち、周囲の安定を支える。', main: 'Si', aux: 'Fe', url: 'https://wikiwiki.jp/16types/ISFJ' },
    { name: 'ISFP', summary: '繊細な芸術家。内なる価値観に忠実で、美と調和を大切にする。', main: 'Fi', aux: 'Se', url: 'https://wikiwiki.jp/16types/ISFP' },
    { name: 'INTJ', summary: '独創的な戦略家。長期的なビジョンを持ち、論理と直観で目標を実現する。', main: 'Ni', aux: 'Te', url: 'https://wikiwiki.jp/16types/INTJ' },
    { name: 'INTP', summary: '論理の探求者。抽象的な理論を分析し、知的好奇心で真理を追究する。', main: 'Ti', aux: 'Ne', url: 'https://wikiwiki.jp/16types/INTP' },
    { name: 'INFJ', summary: '静かな理想主義者。深い洞察力で他者を理解し、意味ある変化を追求する。', main: 'Ni', aux: 'Fe', url: 'https://wikiwiki.jp/16types/INFJ' },
    { name: 'INFP', summary: '理想を追う仲介者。内なる価値観に導かれ、共感と創造性で世界に貢献する。', main: 'Fi', aux: 'Ne', url: 'https://wikiwiki.jp/16types/INFP' },
  ];

  for (const c of CANONICAL) {
    it(`${c.name} の全フィールドが正本と一致`, () => {
      const t = getType(c.name);
      assert.ok(t, `${c.name} が見つからない`);
      assert.equal(t.name, c.name);
      assert.equal(t.summary, c.summary);
      assert.equal(t.mainFunction, c.main);
      assert.equal(t.auxFunction, c.aux);
      assert.equal(t.url, c.url);
      assert.ok(t.summary.length <= 100, `概要説明が100字超: ${t.summary.length}字`);
    });
  }

  it('getAllTypes() が16件返す', () => {
    assert.equal(getAllTypes().length, 16);
  });
});

// 付録A.2 — 心理機能正本データ
describe('BuiltinData: 8心理機能正本データ (付録A.2)', () => {
  const CANONICAL = [
    { abbr: 'Se', fullName: '外向的感覚', description: '五感を通じて現実世界の具体的な情報をありのままに捉える機能。', mainTypes: ['ESFP', 'ESTP'], auxTypes: ['ISFP', 'ISTP'] },
    { abbr: 'Si', fullName: '内向的感覚', description: '過去の経験や記憶と照合し、安定したパターンを維持する機能。', mainTypes: ['ISFJ', 'ISTJ'], auxTypes: ['ESFJ', 'ESTJ'] },
    { abbr: 'Ne', fullName: '外向的直観', description: '外界の情報から多様な可能性やパターンを発見する機能。', mainTypes: ['ENFP', 'ENTP'], auxTypes: ['INFP', 'INTP'] },
    { abbr: 'Ni', fullName: '内向的直観', description: '将来の可能性や抽象的なパターンを洞察する機能。', mainTypes: ['INFJ', 'INTJ'], auxTypes: ['ENFJ', 'ENTJ'] },
    { abbr: 'Te', fullName: '外向的思考', description: '客観的な基準と効率で外界を体系的に組織化する機能。', mainTypes: ['ENTJ', 'ESTJ'], auxTypes: ['INTJ', 'ISTJ'] },
    { abbr: 'Ti', fullName: '内向的思考', description: '内的な論理フレームワークで物事を精密に分析する機能。', mainTypes: ['INTP', 'ISTP'], auxTypes: ['ENTP', 'ESTP'] },
    { abbr: 'Fe', fullName: '外向的感情', description: '集団の感情や社会的調和を重視して対人関係を調整する機能。', mainTypes: ['ENFJ', 'ESFJ'], auxTypes: ['INFJ', 'ISFJ'] },
    { abbr: 'Fi', fullName: '内向的感情', description: '個人の内面的な価値観や信念に基づいて判断する機能。', mainTypes: ['INFP', 'ISFP'], auxTypes: ['ENFP', 'ESFP'] },
  ];

  for (const c of CANONICAL) {
    it(`${c.abbr} の全フィールドが正本と一致`, () => {
      const f = getFunction(c.abbr);
      assert.ok(f, `${c.abbr} が見つからない`);
      assert.equal(f.abbr, c.abbr);
      assert.equal(f.fullName, c.fullName);
      assert.equal(f.description, c.description);
      assert.deepEqual(f.mainTypes, c.mainTypes);
      assert.deepEqual(f.auxTypes, c.auxTypes);
    });

    it(`${c.abbr} のタイプ配列がアルファベット昇順`, () => {
      const f = getFunction(c.abbr);
      const sortedMain = [...f.mainTypes].sort();
      const sortedAux = [...f.auxTypes].sort();
      assert.deepEqual(f.mainTypes, sortedMain);
      assert.deepEqual(f.auxTypes, sortedAux);
    });
  }
});

// 付録A.3 — 心理傾向軸正本データ
describe('BuiltinData: 4心理傾向軸正本データ (付録A.3)', () => {
  const CANONICAL = [
    { abbr: 'EI', fullName: '外向と内向', description: 'エネルギーの方向性を示す軸。', pole1: { name: '外向', abbr: 'E', description: '外界との交流からエネルギーを得る' }, pole2: { name: '内向', abbr: 'I', description: '内面の世界からエネルギーを得る' } },
    { abbr: 'SN', fullName: '感覚と直観', description: '情報をどのように収集・処理するかを示す軸。', pole1: { name: '感覚', abbr: 'S', description: '具体的な事実・現実・経験を重視する' }, pole2: { name: '直観', abbr: 'N', description: '可能性・パターン・意味を重視する' } },
    { abbr: 'TF', fullName: '思考と感情', description: '意思決定の基準を示す軸。', pole1: { name: '思考', abbr: 'T', description: '論理・分析・客観的基準で判断する' }, pole2: { name: '感情', abbr: 'F', description: '価値観・共感・人間関係を重視して判断する' } },
    { abbr: 'JP', fullName: '規範と柔軟', description: '外界への対処スタイルを示す軸。', pole1: { name: '規範', abbr: 'J', description: '計画的・組織的に物事を進める' }, pole2: { name: '柔軟', abbr: 'P', description: '柔軟・即興的に状況に対応する' } },
  ];

  for (const c of CANONICAL) {
    it(`${c.abbr} の全フィールドが正本と一致`, () => {
      const a = getAxis(c.abbr);
      assert.ok(a, `${c.abbr} が見つからない`);
      assert.equal(a.abbr, c.abbr);
      assert.equal(a.fullName, c.fullName);
      assert.equal(a.description, c.description);
      assert.deepEqual(a.pole1, c.pole1);
      assert.deepEqual(a.pole2, c.pole2);
    });
  }
});

// 質問正本データ一致テスト (Req 2.8)
describe('BuiltinData: 16問質問セット (Req 2.8)', () => {
  const CANONICAL_QUESTIONS = [
    { id: 1, axis: 'EI', text: '新しい環境に入ったとき、あなたはどちらですか？', choiceA: '積極的に周囲に話しかける', choiceB: 'まず周囲の様子を観察する' },
    { id: 2, axis: 'EI', text: '週末の過ごし方として自然なのはどちらですか？', choiceA: '友人と外出して活動する', choiceB: '家でゆっくり一人で過ごす' },
    { id: 3, axis: 'EI', text: 'グループ討論でのあなたのスタイルはどちらですか？', choiceA: '積極的に発言してリードする', choiceB: '考えをまとめてから発言する' },
    { id: 4, axis: 'EI', text: 'エネルギーが回復するのはどちらですか？', choiceA: '人と会って会話や活動をしたとき', choiceB: '一人で静かな時間を過ごしたとき' },
    { id: 5, axis: 'SN', text: '問題を解決するとき、あなたはどちらですか？', choiceA: '過去の実績や具体的な方法を参考にする', choiceB: '直感やアイデアで新しい方法を試みる' },
    { id: 6, axis: 'SN', text: '情報を集めるとき、重視するのはどちらですか？', choiceA: '具体的な事実やデータ', choiceB: '全体的なパターンや意味' },
    { id: 7, axis: 'SN', text: '日常生活でより意識するのはどちらですか？', choiceA: '現在の具体的な出来事や状況', choiceB: '将来の可能性や抽象的なアイデア' },
    { id: 8, axis: 'SN', text: '趣味や読書の好みはどちらですか？', choiceA: '実用的・現実的な内容', choiceB: '理論的・哲学的・想像力豊かな内容' },
    { id: 9, axis: 'TF', text: '重要な決断をするとき、あなたはどちらですか？', choiceA: '論理的な分析と客観的な基準を重視する', choiceB: '関係する人の気持ちや価値観を重視する' },
    { id: 10, axis: 'TF', text: '友人が悩みを相談してきたとき、あなたはどちらですか？', choiceA: '原因を分析して解決策を提案する', choiceB: 'まず気持ちに共感して話を聞く' },
    { id: 11, axis: 'TF', text: '仕事やプロジェクトで何を評価しますか？', choiceA: '効率・成果・公平性', choiceB: 'チームの士気・調和・個人への配慮' },
    { id: 12, axis: 'TF', text: '意見の対立が起きたとき、あなたはどちらですか？', choiceA: '論理的に正しい側が優先されるべき', choiceB: 'お互いの気持ちを尊重して妥協点を探す' },
    { id: 13, axis: 'JP', text: '予定の立て方はどちらですか？', choiceA: '事前にしっかり計画を立て、その通りに実行したい', choiceB: '流れに任せて柔軟に対応したい' },
    { id: 14, axis: 'JP', text: '締め切りへの対応はどちらですか？', choiceA: '余裕を持って早めに終わらせる', choiceB: '締め切り直前に集中して仕上げる' },
    { id: 15, axis: 'JP', text: '生活空間や作業環境はどちらですか？', choiceA: '整理整頓されていないと落ち着かない', choiceB: '多少散らかっていても気にしない' },
    { id: 16, axis: 'JP', text: '仕事の進め方はどちらですか？', choiceA: '一つのことを完結させてから次に進む', choiceB: '複数のことを同時並行で進める' },
  ];

  const questions = getQuestions();

  it('全16問ある', () => {
    assert.equal(questions.length, 16);
  });

  it('出題順序が E/I → S/N → T/F → J/P', () => {
    for (let i = 0; i < 4; i++) assert.equal(questions[i].axis, 'EI');
    for (let i = 4; i < 8; i++) assert.equal(questions[i].axis, 'SN');
    for (let i = 8; i < 12; i++) assert.equal(questions[i].axis, 'TF');
    for (let i = 12; i < 16; i++) assert.equal(questions[i].axis, 'JP');
  });

  for (const cq of CANONICAL_QUESTIONS) {
    it(`Q${cq.id} の全フィールドが正本と一致`, () => {
      const q = questions[cq.id - 1];
      assert.equal(q.id, cq.id);
      assert.equal(q.axis, cq.axis);
      assert.equal(q.text, cq.text);
      assert.equal(q.choiceA, cq.choiceA);
      assert.equal(q.choiceB, cq.choiceB);
    });
  }
});

// カテゴリ正本名
describe('BuiltinData: カテゴリ正本名', () => {
  const NAMES = {
    1: '基本的な特徴', 2: '美徳と限界・挑戦課題', 3: '人間関係・恋愛',
    4: '趣味', 5: 'ストレスと対処法', 6: 'リーダーシップ', 7: '適職・キャリア',
  };
  for (const [num, name] of Object.entries(NAMES)) {
    it(`カテゴリ${num} = "${name}"`, () => {
      assert.equal(getCategoryName(parseInt(num)), name);
    });
  }
});

// バリデーション関数
describe('BuiltinData: バリデーション', () => {
  it('有効なタイプ名を認識する', () => {
    for (const name of ['ESTJ','ESTP','ESFJ','ESFP','ENTJ','ENTP','ENFJ','ENFP','ISTJ','ISTP','ISFJ','ISFP','INTJ','INTP','INFJ','INFP']) {
      assert.ok(isValidType(name), `${name} が無効`);
    }
  });
  it('無効なタイプ名を拒否する', () => {
    assert.ok(!isValidType('XXXX'));
    assert.ok(!isValidType('intj'));
  });
  it('有効な機能略称を認識する', () => {
    for (const abbr of ['Se','Si','Ne','Ni','Te','Ti','Fe','Fi']) {
      assert.ok(isValidFunction(abbr), `${abbr} が無効`);
    }
  });
  it('有効な軸略称を認識する', () => {
    for (const abbr of ['EI','SN','TF','JP']) {
      assert.ok(isValidAxis(abbr), `${abbr} が無効`);
    }
  });
});

// formatBuiltinText
describe('BuiltinData: formatBuiltinText (Req 10.6)', () => {
  it('心理機能のビルトイン文面', () => {
    const text = formatBuiltinText({ kind: 'function', abbr: 'Ni' });
    assert.ok(text.includes('内向的直観（Ni）'));
    assert.ok(text.includes('将来の可能性や抽象的なパターンを洞察する機能。'));
    assert.ok(text.includes('主機能: INFJ, INTJ / 補助機能: ENFJ, ENTJ'));
  });
  it('心理傾向軸のビルトイン文面', () => {
    const text = formatBuiltinText({ kind: 'axis', abbr: 'SN' });
    assert.ok(text.includes('感覚と直観（SN）'));
    assert.ok(text.includes('感覚（S）: 具体的な事実・現実・経験を重視する'));
    assert.ok(text.includes('直観（N）: 可能性・パターン・意味を重視する'));
  });
  it('タイプカテゴリ1のビルトイン文面', () => {
    const text = formatBuiltinText({ kind: 'type_category', typeName: 'INTJ', category: 1 });
    assert.ok(text.includes('INTJ'));
    assert.ok(text.includes('主機能: Ni / 補助機能: Te'));
  });
  it('タイプカテゴリ2〜7は「この項目のビルトイン情報はありません。」', () => {
    for (let cat = 2; cat <= 7; cat++) {
      const text = formatBuiltinText({ kind: 'type_category', typeName: 'INTJ', category: cat });
      assert.equal(text, 'この項目のビルトイン情報はありません。');
    }
  });
});

// formatFunctionTypeList
describe('BuiltinData: formatFunctionTypeList (Req 4.3)', () => {
  it('Ni の一覧行が正しい', () => {
    const line = formatFunctionTypeList('Ni');
    assert.equal(line, '主/補機能タイプ一覧: Ni: INFJ(主), INTJ(主), ENFJ(補), ENTJ(補)');
  });
});
