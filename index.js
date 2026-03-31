#!/usr/bin/env node

// MBTI Bot エントリポイント (Req 14, 1)

// バージョンチェック — 最初に実施 (Req 14.2)
const nodeVersion = parseInt(process.versions.node);
if (nodeVersion < 22) {
  process.stdout.write(`Node.js v22以上が必要です（現在: v${process.versions.node}）。\n`);
  process.exit(1);
}

import * as readline from 'readline/promises';
import { init as initLogger } from './debug-logger.js';
import { run } from './state-machine.js';

// 環境変数読み込み (Req 14.4)
const rawApiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
const rawModel = (process.env.ANTHROPIC_MODEL || '').trim();
const debug = process.env.DEBUG === '1';

/** @typedef {Object} ProcessState
 * @property {boolean} apiMode
 * @property {boolean} degradedBy401
 * @property {string | undefined} apiKey
 * @property {string} model
 */

const apiKey = rawApiKey.length > 0 ? rawApiKey : undefined;
const model = rawModel.length > 0 ? rawModel : 'claude-sonnet-4-6';
const apiMode = apiKey !== undefined;

/** @type {ProcessState} */
const processState = {
  apiMode,
  degradedBy401: false,
  apiKey,
  model,
};

// デバッグログ初期化
initLogger(debug);

// readline セットアップ (Req 10.1)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 終了処理 — 単一経路 (Req 5.4, 5.10, 5.11)
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  rl.close();
  process.stdout.write('終了します。\n');
  process.exit(0);
}

// SIGINT ハンドリング
process.on('SIGINT', shutdown);

// 起動バナー (Req 1.4-1.6) — 起動時1回のみ
if (apiMode) {
  process.stdout.write(`[モード: APIモード (${model})]\n`);
} else {
  process.stdout.write(`[モード: スタンドアロン - AI要約無効]\nAPIキーを設定するとAI要約が利用できます: export ANTHROPIC_API_KEY=sk-ant-...\n`);
}

// メインループ開始
run(rl, processState, shutdown);
