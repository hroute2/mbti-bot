# 実装タスク

## 1. プロジェクトセットアップ

- [ ] **TASK-1:** Next.js 15 プロジェクトを初期化（`create-next-app` with App Router, TypeScript, Tailwind CSS）
- [ ] **TASK-2:** 必要な依存パッケージをインストール（`next-themes`）
- [ ] **TASK-3:** `tsconfig.json` にパスエイリアスを設定（`@/` → `app/`, `@lib/` → `lib/`）
- [ ] **TASK-4:** `.env.local` に `ANTHROPIC_API_KEY` を設定
- [ ] **TASK-5:** `next.config.ts` で既存JSモジュールのインポート設定（transpilePackages等）
- [ ] **TASK-6:** `globals.css` にTailwind ディレクティブとカスタムスタイルを記述

## 2. API Routes

- [ ] **TASK-7:** `app/api/types/route.ts` を実装 — `builtin-data.js` から全タイプ・機能・軸データを返す GET エンドポイント
- [ ] **TASK-8:** `app/api/diagnosis/route.ts` を実装 — 回答配列を受け取り `diagnosis-engine.evaluate()` を呼び出す POST エンドポイント（入力バリデーション含む）
- [ ] **TASK-9:** `app/api/content/route.ts` を実装 — `url-mapper` → `wiki-fetcher` → `claude-api` のパイプラインで Wiki取得 + AI要約を返す GET エンドポイント

## 3. 共通コンポーネント・レイアウト

- [ ] **TASK-10:** `app/components/Header.tsx` を実装 — ナビゲーションリンクとテーマトグルボタン
- [ ] **TASK-11:** `app/components/Footer.tsx` を実装 — `template-renderer.DISCLAIMER` を表示
- [ ] **TASK-12:** `app/components/ThemeToggle.tsx` を実装 — `next-themes` を使用したダーク/ライト切り替え
- [ ] **TASK-13:** `app/layout.tsx` を実装 — `ThemeProvider`, Header, Footer を含むルートレイアウト
- [ ] **TASK-14:** `app/components/Loading.tsx` を実装 — ローディングスピナーコンポーネント
- [ ] **TASK-15:** `lib/api-client.ts` を実装 — 各API Routeを呼び出すクライアント関数群

## 4. ページ実装

- [ ] **TASK-16:** `app/page.tsx` を実装 — ホームページ（4つの機能カードへのリンク）
- [ ] **TASK-17:** `app/components/QuestionCard.tsx` を実装 — 質問テキストとA/B選択ボタン
- [ ] **TASK-18:** `app/components/ResultCard.tsx` を実装 — 診断結果（タイプ名、スコア内訳）の表示
- [ ] **TASK-19:** `app/diagnosis/page.tsx` を実装 — 16問の質問フロー + 結果表示（Client Component）
- [ ] **TASK-20:** `app/components/TypeGrid.tsx` を実装 — 16タイプのグリッド表示コンポーネント
- [ ] **TASK-21:** `app/components/ContentViewer.tsx` を実装 — AI要約テキストの表示コンポーネント
- [ ] **TASK-22:** `app/types/page.tsx` を実装 — タイプ選択 → カテゴリ選択 → コンテンツ表示（Client Component）
- [ ] **TASK-23:** `app/functions/page.tsx` を実装 — 認知機能選択 → コンテンツ表示（Client Component）
- [ ] **TASK-24:** `app/axes/page.tsx` を実装 — 軸選択 → コンテンツ表示（Client Component）

## 5. スタイリング・レスポンシブ対応

- [ ] **TASK-25:** 全ページにレスポンシブデザインを適用（モバイル / タブレット / デスクトップ）
- [ ] **TASK-26:** ダークモード用スタイルを全コンポーネントに適用（`dark:` プレフィックス）
- [ ] **TASK-27:** 日本語フォント設定とタイポグラフィの調整

## 6. テスト・最終確認

- [ ] **TASK-28:** 各API Routeの動作確認（正常系・異常系）
- [ ] **TASK-29:** 診断フロー全体のE2Eテスト（質問回答 → 結果表示）
- [ ] **TASK-30:** レスポンシブ表示の確認（各ブレークポイント）
- [ ] **TASK-31:** ダーク/ライトモードの切り替え動作確認
- [ ] **TASK-32:** `ANTHROPIC_API_KEY` がクライアントバンドルに含まれないことを確認
