# 設計書

## アーキテクチャ概要

Next.js 15 App Router + React 19 を使用したSPA的Webアプリケーション。既存のドメインロジックモジュールをAPI Routes（Server Components）経由で呼び出し、クライアントはfetchでデータを取得する。

```
┌─────────────────────────────────────────┐
│  Client (React 19)                      │
│  ├── app/page.tsx        (Home)         │
│  ├── app/diagnosis/      (診断)          │
│  ├── app/types/          (タイプ一覧)     │
│  ├── app/functions/      (認知機能一覧)   │
│  └── app/axes/           (軸一覧)        │
├─────────────────────────────────────────┤
│  API Routes (Server-side)               │
│  ├── app/api/diagnosis/route.ts         │
│  ├── app/api/content/route.ts           │
│  └── app/api/types/route.ts             │
├─────────────────────────────────────────┤
│  Domain Logic (既存モジュール再利用)       │
│  ├── builtin-data.js                    │
│  ├── diagnosis-engine.js                │
│  ├── url-mapper.js                      │
│  ├── wiki-fetcher.js                    │
│  ├── claude-api.js                      │
│  └── template-renderer.js              │
└─────────────────────────────────────────┘
```

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 15 (App Router) |
| UI | React 19 |
| スタイリング | Tailwind CSS v4 |
| 言語 | TypeScript |
| ドメインロジック | 既存JavaScript モジュール（プロジェクトルート） |
| 環境変数 | `.env.local` |
| テーマ | next-themes（ダーク/ライトモード） |

## ディレクトリ構成

```
mbti/
├── app/
│   ├── layout.tsx          # ルートレイアウト（ThemeProvider, ヘッダー, フッター）
│   ├── page.tsx            # ホームページ（メインメニュー）
│   ├── globals.css         # Tailwind + カスタムスタイル
│   ├── diagnosis/
│   │   └── page.tsx        # 診断ページ（Client Component）
│   ├── types/
│   │   └── page.tsx        # タイプブラウザ（Client Component）
│   ├── functions/
│   │   └── page.tsx        # 認知機能ブラウザ（Client Component）
│   ├── axes/
│   │   └── page.tsx        # 軸ブラウザ（Client Component）
│   ├── api/
│   │   ├── diagnosis/
│   │   │   └── route.ts    # POST: 診断評価
│   │   ├── content/
│   │   │   └── route.ts    # GET: Wiki取得 + AI要約
│   │   └── types/
│   │       └── route.ts    # GET: マスタデータ
│   └── components/
│       ├── Header.tsx      # ヘッダー（ナビ + テーマトグル）
│       ├── Footer.tsx      # フッター（免責事項）
│       ├── ThemeToggle.tsx # ダーク/ライト切り替えボタン
│       ├── QuestionCard.tsx # 診断質問カード
│       ├── ResultCard.tsx  # 診断結果表示
│       ├── TypeGrid.tsx    # タイプ一覧グリッド
│       ├── ContentViewer.tsx # AI要約表示コンポーネント
│       └── Loading.tsx     # ローディングスピナー
├── lib/
│   └── api-client.ts       # フロントエンド用APIクライアント
├── builtin-data.js         # 既存（変更なし）
├── diagnosis-engine.js     # 既存（変更なし）
├── url-mapper.js           # 既存（変更なし）
├── wiki-fetcher.js         # 既存（変更なし）
├── claude-api.js           # 既存（変更なし）
├── template-renderer.js    # 既存（変更なし）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local              # ANTHROPIC_API_KEY
```

## API設計

### POST /api/diagnosis

```typescript
// Request
{ answers: string[] }  // 16要素、各 "A" | "B"

// Response 200
{ type: string, scoreBreakdown: object, scores: object }

// Response 400
{ error: string }
```

**処理フロー:**
1. リクエストボディを検証（16要素、各値が "A" or "B"）
2. `diagnosis-engine.evaluate(answers)` を呼び出す
3. 結果をJSON形式で返す

### GET /api/content

```typescript
// Query Parameters
?kind=type|function|axis&key=INTJ&category=overview

// Response 200
{ summary: string, rawText: string, heading: string }

// Response 400 / 500
{ error: string }
```

**処理フロー:**
1. クエリパラメータからkind, key, categoryを取得
2. `url-mapper` でWikipedia URLを構築
3. `wiki-fetcher.fetchAndExtract(url)` でテキスト取得
4. `template-renderer` で見出しとユーザーメッセージを構築
5. `claude-api.summarize(text, message, apiKey, model)` で要約生成
6. 結果をJSON形式で返す

### GET /api/types

```typescript
// Response 200
{
  types: Array<{ code: string, name: string }>,
  functions: Array<{ code: string, name: string }>,
  axes: Array<{ code: string, name: string }>
}
```

## コンポーネント設計

### ページコンポーネント

| コンポーネント | 種別 | 説明 |
|-------------|------|------|
| `app/page.tsx` | Server | メインメニュー。4つのリンクカードを表示 |
| `app/diagnosis/page.tsx` | Client | 状態管理: currentQuestion, answers, result |
| `app/types/page.tsx` | Client | 状態管理: selectedType, selectedCategory, content |
| `app/functions/page.tsx` | Client | 状態管理: selectedFunction, content |
| `app/axes/page.tsx` | Client | 状態管理: selectedAxis, content |

### 共通コンポーネント

| コンポーネント | Props | 説明 |
|-------------|-------|------|
| `Header` | - | ナビゲーションリンク + ThemeToggle |
| `Footer` | - | DISCLAIMER表示 |
| `ThemeToggle` | - | next-themesでテーマ切り替え |
| `QuestionCard` | question, index, onAnswer | 質問テキストとA/Bボタン |
| `ResultCard` | type, scoreBreakdown, scores | 診断結果の可視化 |
| `TypeGrid` | types, onSelect | 16タイプのグリッド表示 |
| `ContentViewer` | summary, rawText, heading, loading | AI要約の表示 |
| `Loading` | - | ローディングスピナー |

## テーマ設計

- `next-themes` の `ThemeProvider` をルートレイアウトに配置
- Tailwind CSSの `dark:` プレフィックスでダークモードスタイルを定義
- `class` 戦略を使用（`<html class="dark">`）
- デフォルトはシステム設定に連動

## セキュリティ設計

- `ANTHROPIC_API_KEY` は `.env.local` に保存
- API Routeのみが `process.env.ANTHROPIC_API_KEY` にアクセス
- `NEXT_PUBLIC_` プレフィックスは使用しない
- API Routeで入力バリデーションを実施（不正な値は400エラー）
