# Research & Design Decisions

## Summary
- **Feature**: `mbti-bot`
- **Discovery Scope**: New Feature（グリーンフィールド CLI アプリケーション）
- **Key Findings**:
  - cheerio v1.2.0 は ESM 完全対応、Node.js v22 互換。`import * as cheerio from 'cheerio'` で使用
  - Anthropic Messages API (2023-06-01) はリクエスト/レスポンス構造に破壊的変更なし。`content[0].text` でテキスト取得
  - Node.js v22 の native fetch + readline/promises + ESM で外部 HTTP ライブラリ不要

## Research Log

### cheerio ESM 互換性と Node.js v22 対応
- **Context**: Req 8.1 で cheerio を唯一の許可 HTML パーサとして指定。ESM (`type: "module"`) プロジェクトでの動作確認が必要
- **Sources Consulted**: npm registry, GitHub releases, cheerio 公式ドキュメント
- **Findings**:
  - 最新安定版: v1.2.0 (2025-01-23)
  - ESM: デュアルモジュール対応。`import * as cheerio from 'cheerio'` で使用
  - Node.js 最低要件: >=18.17（v22 は余裕で対応）
  - deep import は非推奨、メインエクスポートのみ使用すること
- **Implications**: package.json に `"cheerio": "^1.2.0"` を追加。ESM import で問題なし

### Anthropic Messages API 契約確認
- **Context**: Req 15.2 で native fetch による直接 HTTP 呼び出しを規定。SDK 不使用のため API 契約を正確に把握する必要あり
- **Sources Consulted**: Anthropic API ドキュメント、API バージョニングページ
- **Findings**:
  - エンドポイント: `POST https://api.anthropic.com/v1/messages`
  - 必須ヘッダー: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
  - レスポンス: `{ content: [{ type: "text", text: "..." }], ... }`
  - 2023-06-01 バージョンに破壊的変更・非推奨化なし
  - API はステートレス（毎回完全な会話履歴を送信する必要があるが、本仕様では単一メッセージのみ）
- **Implications**: Req 15.2 の HTTP 契約はそのまま実装可能。SDK 不要で native fetch で十分

### Node.js v22 組み込み API
- **Context**: Req 14.1 で Node.js v22 以上を要件とし、外部 HTTP ライブラリなしで実装
- **Sources Consulted**: Node.js v22 ドキュメント
- **Findings**:
  - `fetch`: v21 で stable 化。v22 で完全サポート
  - `readline/promises`: v17 で追加。`import { createInterface } from 'node:readline/promises'`
  - `AbortSignal.timeout()`: v17.3 で追加。fetch のタイムアウト制御に使用
  - ESM: `"type": "module"` で `import/export` 構文を使用
- **Implications**: 外部依存は cheerio のみで、Req 14.1 の制約を満たせる

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 単一ファイル | index.js に全ロジック | 依存なし、理解容易 | 保守性低下、テスト困難 | 却下: テスト要件が厳密 |
| モジュール分割 | 機能ドメインごとにモジュール分割 | テスト容易、関心分離 | ファイル数増加 | **採用**: テスト要件との整合性が高い |
| フレームワーク使用 | Commander.js 等 | CLI 機能が豊富 | 外部依存追加禁止(Req 14.1) | 却下: 制約に抵触 |

## Design Decisions

### Decision: モジュール分割戦略
- **Context**: 16 の要件領域をテスト可能な単位に分解する必要がある
- **Alternatives Considered**:
  1. 単一ファイル — シンプルだがテスト困難
  2. レイヤード分割 — データ/ロジック/UI の3層
  3. ドメイン分割 — 機能ドメインごとに分割
- **Selected Approach**: ドメイン分割。エントリポイント(index.js) + 状態機械(state-machine.js) + 入力正規化(input.js) + 診断(diagnosis.js) + Web取得(wiki-fetcher.js) + API連携(claude-api.js) + ビルトインデータ(builtin-data.js) + テンプレート(templates.js) + デバッグログ(logger.js) + 定数/URL(constants.js)
- **Rationale**: 各モジュールが1つの要件グループに対応し、ユニットテストの境界が明確
- **Trade-offs**: ファイル数は増えるが、各ファイルは小規模で理解しやすい
- **Follow-up**: モジュール間の循環依存に注意

### Decision: 状態機械の実装方式
- **Context**: Req 5 で7状態の状態機械を一意に定義。遷移表・状態付随データ・入場時再描画を正確に実装する必要がある
- **Selected Approach**: readline/promises のループ内で switch-case ベースの状態遷移を実装。状態は文字列列挙型で管理
- **Rationale**: 7状態は状態機械ライブラリを導入するほど複雑ではない。switch-case で十分に表現可能
- **Trade-offs**: 状態が増えた場合の拡張性は低いが、要件上16状態を超えることはない

## Risks & Mitigations
- **wikiwiki.jp の構造変更**: HTML 構造が変わると抽出ロジックが壊れる → スモークテスト(Req 16.3)で検出
- **Anthropic API の仕様変更**: 2023-06-01 バージョンの廃止 → anthropic-version ヘッダで固定しているため影響は限定的
- **cheerio のメジャーバージョンアップ**: API 互換性が壊れる可能性 → `^1.2.0` でメジャー固定

## References
- [cheerio npm](https://www.npmjs.com/package/cheerio) — v1.2.0、ESM 対応確認
- [Anthropic Messages API](https://platform.claude.com/docs/en/api/overview) — 2023-06-01 契約確認
- [Node.js v22 Docs](https://nodejs.org/docs/latest-v22.x/api/) — fetch / readline/promises / AbortSignal
