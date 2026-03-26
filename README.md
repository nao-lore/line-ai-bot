# Cafe Lore AI LINE Bot

LINE Messaging API と Claude API を連携したカフェ向けAIコンシェルジュBot。Vercel Serverless Functions でデプロイ。

## 機能

- AIコンシェルジュ（Claude API による自然言語応答）
- Flex Message によるメニュー表示（ドリンク / フード / デザート）
- 予約案内
- リッチメニューによる機能切替

## セットアップ

### 1. 前提条件

- Node.js 18以上
- [LINE Developers](https://developers.line.biz/) アカウント
- [Anthropic](https://console.anthropic.com/) API キー
- [Vercel](https://vercel.com/) アカウント

### 2. LINE チャネル作成

1. LINE Developers Console で Messaging API チャネルを作成
2. チャネルシークレットとチャネルアクセストークンを取得

### 3. プロジェクトセットアップ

```bash
cd line-ai-bot
npm install
cp .env.example .env
```

`.env` を編集して各キーを設定:

```
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Vercel にデプロイ

```bash
npm i -g vercel
vercel

# 環境変数を設定
vercel env add LINE_CHANNEL_SECRET
vercel env add LINE_CHANNEL_ACCESS_TOKEN
vercel env add ANTHROPIC_API_KEY

# 本番デプロイ
vercel --prod
```

### 5. Webhook URL 設定

LINE Developers Console で Webhook URL を設定:

```
https://your-project.vercel.app/api/webhook
```

- Webhook を有効化
- 自動応答メッセージを無効化

### 6. リッチメニュー設定（任意）

2500x843px のリッチメニュー画像を用意し、以下を実行:

```bash
npm run setup-richmenu -- --image ./richmenu.png
```

画像は3分割で左から「AI相談」「メニュー」「予約」に対応。

## 使い方

| 入力 | 動作 |
|------|------|
| `メニュー` / `menu` | Flex Message でメニュー一覧を表示 |
| `予約` / `reserve` | 予約案内を表示 |
| その他テキスト | Claude API による AI 応答 |

## ディレクトリ構造

```
line-ai-bot/
├── api/
│   └── webhook.js            # Vercel Serverless Function
├── lib/
│   ├── line.js               # LINE Messaging API wrapper
│   ├── claude.js             # Claude API 連携
│   └── flex-messages.js      # Flex Message テンプレート
├── scripts/
│   └── setup-richmenu.js     # リッチメニュー作成スクリプト
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```
