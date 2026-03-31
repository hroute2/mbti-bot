// StateMachine — 7状態の遷移制御・画面描画・オーケストレーション (Req 1, 3-5, 9, 11)

import { normalize } from './input-normalizer.js';
import { evaluate } from './diagnosis-engine.js';
import { getQuestions, getType, getCategoryName, getAllTypes, getFunction, getAxis } from './builtin-data.js';
import { buildTypeCategoryUrl, buildFunctionUrl, buildAxisUrl, buildTypeBaseUrl } from './url-mapper.js';
import { fetchAndExtract, truncateText } from './wiki-fetcher.js';
import { summarize } from './claude-api.js';
import { buildHeading, renderTemplateA, renderTemplateB, renderTemplateC, renderWithError, DISCLAIMER } from './template-renderer.js';

// ヒント行 (Req 5.6)
const HINTS = {
  MAIN_MENU: '[1/2/3/4/0/help]:',
  DIAGNOSIS_QUESTION: '[A/B/q(中断)/help]:',
  DIAGNOSIS_RESULT: '[t: このタイプを詳しく調べる / 0: メインメニューへ / help]:',
  TYPE_SELECT: '[タイプ名(例:INTJ)/0/help]:',
  TYPE_CATEGORY: '[1-7/0/help]:',
  FUNCTION_SELECT: '[機能略称(例:Ni)/0/help]:',
  AXIS_SELECT: '[軸略称(例:SN)/0/help]:',
};

// helpコンテンツ (Req 5.8)
const HELP_CONTENT = {
  MAIN_MENU: `  1: MBTI診断を開始する
  2: タイプを調べる
  3: 心理機能を調べる
  4: 心理傾向軸を調べる
  0: 終了
  help: このヘルプを表示`,
  DIAGNOSIS_QUESTION: `  A: 選択肢Aを選ぶ
  B: 選択肢Bを選ぶ
  q / quit: 診断を中断してメインメニューへ戻る
  help: このヘルプを表示`,
  DIAGNOSIS_RESULT: `  t: 診断されたタイプの詳細を調べる（TYPE_CATEGORYへ）
  0: メインメニューへ戻る
  help: このヘルプを表示`,
  TYPE_SELECT: `  [タイプ名]: 対応タイプのカテゴリへ進む（例: INTJ）
  0: メインメニューへ戻る
  help: このヘルプを表示`,
  TYPE_CATEGORY: `  1〜7: 各カテゴリのコンテンツを表示
  0: 前の画面へ戻る（タイプ選択または診断結果）
  help: このヘルプを表示`,
  FUNCTION_SELECT: `  [機能略称]: 機能の解説を表示（例: Ni、大文字小文字不問）
  0: メインメニューへ戻る
  help: このヘルプを表示`,
  AXIS_SELECT: `  [軸略称]: 軸の解説を表示（例: SN、大文字小文字不問）
  0: メインメニューへ戻る
  help: このヘルプを表示`,
};

// 個別エラーメッセージ (Req 3.5, 4.4, 4.5)
const DOMAIN_ERRORS = {
  TYPE_SELECT: '無効なタイプ名です（例: INTJ）。再入力してください。',
  FUNCTION_SELECT: '無効な機能略称です（例: Ni）。再入力してください。',
  AXIS_SELECT: '無効な軸略称です（例: SN）。再入力してください。',
};

function print(text) {
  process.stdout.write(text + '\n');
}

/**
 * @param {import('readline/promises').Interface} rl
 * @param {import('./index.js').ProcessState} processState
 * @param {() => void} shutdown
 */
export async function run(rl, processState, shutdown) {
  let state = 'MAIN_MENU';
  let currentType = null;
  let previousState = null;
  let diagnosisResult = null;

  // 診断用
  let answers = [];
  let questionIndex = 0;

  const questions = getQuestions();

  // 初回 MAIN_MENU 描画
  renderMainMenu(processState);

  while (true) {
    const hint = HINTS[state];
    let line;
    try {
      line = await rl.question(hint);
    } catch {
      // EOF
      shutdown();
      return;
    }

    const result = normalize(line, state);

    // help処理 (全状態共通)
    if (result.type === 'help') {
      print(HELP_CONTENT[state]);
      if (state === 'DIAGNOSIS_QUESTION') {
        renderQuestion(questions[questionIndex]);
      }
      continue;
    }

    // 無効入力処理
    if (result.type === 'invalid') {
      const errorMsg = DOMAIN_ERRORS[state] || '無効な入力です。';
      print(errorMsg);
      if (state === 'DIAGNOSIS_QUESTION') {
        renderQuestion(questions[questionIndex]);
      }
      continue;
    }

    // 状態別処理
    switch (state) {
      case 'MAIN_MENU': {
        if (result.type === 'zero') {
          shutdown();
          return;
        }
        if (result.type === 'menu_item') {
          // 状態クリア
          currentType = null;
          diagnosisResult = null;
          previousState = null;

          switch (result.value) {
            case '1':
              state = 'DIAGNOSIS_QUESTION';
              answers = [];
              questionIndex = 0;
              renderQuestion(questions[0]);
              break;
            case '2':
              state = 'TYPE_SELECT';
              renderTypeSelect();
              break;
            case '3':
              state = 'FUNCTION_SELECT';
              renderFunctionSelect();
              break;
            case '4':
              state = 'AXIS_SELECT';
              renderAxisSelect();
              break;
          }
        }
        break;
      }

      case 'DIAGNOSIS_QUESTION': {
        if (result.type === 'quit') {
          print('診断を中断しました。');
          state = 'MAIN_MENU';
          currentType = null;
          diagnosisResult = null;
          previousState = null;
          renderMainMenu(processState);
          break;
        }
        if (result.type === 'answer_a' || result.type === 'answer_b') {
          answers.push(result.type === 'answer_a' ? 'A' : 'B');
          questionIndex++;
          if (questionIndex >= 16) {
            // 診断完了
            diagnosisResult = evaluate(answers);
            currentType = diagnosisResult.type;
            state = 'DIAGNOSIS_RESULT';
            renderDiagnosisResult(diagnosisResult);
          } else {
            renderQuestion(questions[questionIndex]);
          }
        }
        break;
      }

      case 'DIAGNOSIS_RESULT': {
        if (result.type === 'zero') {
          state = 'MAIN_MENU';
          currentType = null;
          diagnosisResult = null;
          previousState = null;
          renderMainMenu(processState);
          break;
        }
        if (result.type === 'navigate_t') {
          previousState = 'DIAGNOSIS_RESULT';
          // currentType は diagnosisResult.type のまま維持
          state = 'TYPE_CATEGORY';
          renderTypeCategory(currentType);
        }
        break;
      }

      case 'TYPE_SELECT': {
        if (result.type === 'zero') {
          state = 'MAIN_MENU';
          currentType = null;
          diagnosisResult = null;
          previousState = null;
          renderMainMenu(processState);
          break;
        }
        if (result.type === 'domain_value') {
          currentType = result.value;
          previousState = 'TYPE_SELECT';
          state = 'TYPE_CATEGORY';
          renderTypeCategory(currentType);
        }
        break;
      }

      case 'TYPE_CATEGORY': {
        if (result.type === 'zero') {
          if (previousState === 'TYPE_SELECT') {
            currentType = null;
            state = 'TYPE_SELECT';
            renderTypeSelect();
          } else if (previousState === 'DIAGNOSIS_RESULT') {
            state = 'DIAGNOSIS_RESULT';
            renderDiagnosisResult(diagnosisResult);
          }
          break;
        }
        if (result.type === 'category_item') {
          const category = parseInt(result.value);
          await handleContentDisplay(
            { kind: 'type_category', typeName: currentType, category },
            processState
          );
          renderTypeCategory(currentType);
        }
        break;
      }

      case 'FUNCTION_SELECT': {
        if (result.type === 'zero') {
          state = 'MAIN_MENU';
          currentType = null;
          diagnosisResult = null;
          previousState = null;
          renderMainMenu(processState);
          break;
        }
        if (result.type === 'domain_value') {
          await handleContentDisplay(
            { kind: 'function', abbr: result.value },
            processState
          );
        }
        break;
      }

      case 'AXIS_SELECT': {
        if (result.type === 'zero') {
          state = 'MAIN_MENU';
          currentType = null;
          diagnosisResult = null;
          previousState = null;
          renderMainMenu(processState);
          break;
        }
        if (result.type === 'domain_value') {
          await handleContentDisplay(
            { kind: 'axis', abbr: result.value },
            processState
          );
        }
        break;
      }
    }
  }
}

// ========== 画面描画関数 ==========

function renderMainMenu(processState) {
  if (processState.degradedBy401) {
    print('[モード: スタンドアロン - API 401により切り替え済み]');
  }
  print(`=============================
 MBTI Bot
=============================
1. MBTI診断
2. タイプを調べる
3. 心理機能を調べる
4. 心理傾向軸を調べる
0. 終了`);
}

function renderQuestion(q) {
  const axisLabel = q.axis === 'EI' ? 'E/I' : q.axis === 'SN' ? 'S/N' : q.axis === 'TF' ? 'T/F' : 'J/P';
  print(`--- 質問 ${q.id} / 16 (${axisLabel}) ---
${q.text}
  A: ${q.choiceA}
  B: ${q.choiceB}`);
}

function renderDiagnosisResult(result) {
  const typeData = getType(result.type);
  print(`=== 診断結果 ===
あなたのタイプ: ${result.type}
得点内訳: ${result.scoreBreakdown}

${typeData.summary}
参考: ${typeData.url}

${DISCLAIMER}`);
}

function renderTypeSelect() {
  const typeNames = getAllTypes().map(t => t.name).join(' ');
  print(`=== タイプを調べる ===
タイプ名を入力してください（例: INTJ / enfp）
対応タイプ: ${typeNames}`);
}

function renderTypeCategory(typeName) {
  print(`=== ${typeName} を調べる ===
1. 基本的な特徴
2. 美徳と限界・挑戦課題
3. 人間関係・恋愛
4. 趣味
5. ストレスと対処法
6. リーダーシップ
7. 適職・キャリア
0. 戻る`);
}

function renderFunctionSelect() {
  print(`=== 心理機能を調べる ===
機能略称を入力してください（大文字小文字不問）
対応機能: Se Si Ne Ni Te Ti Fe Fi`);
}

function renderAxisSelect() {
  print(`=== 心理傾向軸を調べる ===
軸略称を入力してください（大文字小文字不問）
対応軸: EI SN TF JP`);
}

// ========== コンテンツ取得・表示オーケストレーション (Req 10.4) ==========

async function handleContentDisplay(context, processState) {
  // URL生成
  let url;
  if (context.kind === 'type_category') {
    url = buildTypeCategoryUrl(context.typeName, context.category);
  } else if (context.kind === 'function') {
    url = buildFunctionUrl(context.abbr);
  } else if (context.kind === 'axis') {
    url = buildAxisUrl(context.abbr);
  }

  const heading = buildHeading(context);

  // URLMapper が null を返した場合 (Req 7.2)
  if (!url) {
    const templateC = renderTemplateC(heading, {
      kind: context.kind === 'type_category' ? 'type_category' : context.kind,
      typeName: context.typeName,
      category: context.category,
      abbr: context.abbr,
    });
    // バグメッセージ
    print(`=== ${heading} ===\n対応するページ情報がありません（実装上のバグ）。\n出典: ビルトイン情報（参考: wikiwiki.jp/16types）`);
    print('');
    return;
  }

  // Web取得
  const fetchResult = await fetchAndExtract(url);

  if (!fetchResult.ok) {
    // Web取得失敗 → エラー + テンプレートC
    const templateC = renderTemplateC(heading, context);
    const output = renderWithError(fetchResult.error, templateC);
    print(output);
    print('');
    return;
  }

  // Web取得成功
  if (processState.apiMode) {
    // APIモード — Claude API 呼び出し
    const userMessage = buildUserMessage(context);
    const apiResult = await summarize(fetchResult.text, userMessage, processState.apiKey, processState.model);

    if (apiResult.ok) {
      // テンプレートA
      const output = renderTemplateA(heading, apiResult.text, url, context);
      print(output);
      print('');
      return;
    }

    // API 401 → 降格
    if (apiResult.is401) {
      processState.apiMode = false;
      processState.degradedBy401 = true;
    }

    // API失敗 → エラー + テンプレートB
    const displayText = truncateText(fetchResult.text, 800);
    const templateB = renderTemplateB(heading, displayText, url, context);
    const output = renderWithError(apiResult.error, templateB);
    print(output);
    print('');
    return;
  }

  // スタンドアロン → テンプレートB
  const displayText = truncateText(fetchResult.text, 800);
  const output = renderTemplateB(heading, displayText, url, context);
  print(output);
  print('');
}

/**
 * ユーザーメッセージ生成 (Req 15.2)
 */
function buildUserMessage(context) {
  if (context.kind === 'type_category') {
    const catName = getCategoryName(context.category);
    return `${context.typeName}タイプの「${catName}」について詳しく説明してください。`;
  }
  if (context.kind === 'function') {
    const f = getFunction(context.abbr);
    return `${context.abbr}（${f.fullName}）について詳しく説明してください。`;
  }
  if (context.kind === 'axis') {
    const a = getAxis(context.abbr);
    return `${context.abbr}（${a.fullName}）について詳しく説明してください。`;
  }
  return '';
}
