#!/usr/bin/env node

/**
 * リッチメニュー作成スクリプト
 *
 * 使い方:
 *   1. .env に LINE_CHANNEL_ACCESS_TOKEN を設定
 *   2. node scripts/setup-richmenu.js
 *
 * リッチメニュー画像が必要です。2500x1686 または 2500x843 の PNG/JPEG を用意してください。
 * このスクリプトは画像なしでもメニュー構造を作成しますが、
 * 画像をアップロードするには --image オプションでパスを指定してください。
 *
 *   node scripts/setup-richmenu.js --image ./richmenu.png
 */

require("dotenv/config");
const { getClient, getBlobClient } = require("../lib/line");
const fs = require("fs");
const path = require("path");

const RICH_MENU = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "Cafe Lore Menu",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        label: "AI相談",
        data: "action=ai",
        displayText: "AIコンシェルジュに相談",
      },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: {
        type: "postback",
        label: "メニュー",
        data: "action=menu",
        displayText: "メニューを見る",
      },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        label: "予約",
        data: "action=reserve",
        displayText: "予約する",
      },
    },
  ],
};

async function main() {
  const client = getClient();
  const blobClient = getBlobClient();

  console.log("リッチメニューを作成中...");

  // 1. リッチメニュー作成
  const result = await client.createRichMenu(RICH_MENU);
  const richMenuId = result.richMenuId || result;
  console.log(`リッチメニュー作成完了: ${richMenuId}`);

  // 2. 画像アップロード（--image オプションがある場合）
  const imageArgIndex = process.argv.indexOf("--image");
  if (imageArgIndex !== -1 && process.argv[imageArgIndex + 1]) {
    const imagePath = path.resolve(process.argv[imageArgIndex + 1]);
    if (!fs.existsSync(imagePath)) {
      console.error(`画像ファイルが見つかりません: ${imagePath}`);
      process.exit(1);
    }

    console.log(`画像をアップロード中: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : "image/jpeg";

    await blobClient.setRichMenuImage(richMenuId, new Blob([imageBuffer], { type: contentType }));
    console.log("画像アップロード完了");
  } else {
    console.log(
      "⚠  画像は設定されていません。`--image <path>` で画像を指定してください。"
    );
  }

  // 3. デフォルトリッチメニューに設定
  await client.setDefaultRichMenu(richMenuId);
  console.log("デフォルトリッチメニューに設定完了");

  console.log("\nセットアップ完了!");
  console.log(`リッチメニューID: ${richMenuId}`);
}

main().catch((error) => {
  console.error("エラー:", error.message);
  process.exit(1);
});
