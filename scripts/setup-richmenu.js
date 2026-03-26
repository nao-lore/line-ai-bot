#!/usr/bin/env node
require("dotenv/config");
const { getClient, getBlobClient } = require("../lib/line");
const fs = require("fs");
const path = require("path");

const COL_W = 833;
const ROW_H = 843;

const RICH_MENU = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "Cafe Lore Menu",
  chatBarText: "Café Lore ☕",
  areas: [
    // Row 1
    {
      bounds: { x: 0, y: 0, width: COL_W, height: ROW_H },
      action: {
        type: "postback",
        label: "AI相談",
        data: "action=ai",
        displayText: "AIコンシェルジュに相談",
      },
    },
    {
      bounds: { x: COL_W, y: 0, width: COL_W + 1, height: ROW_H },
      action: {
        type: "postback",
        label: "メニュー",
        data: "action=menu",
        displayText: "メニューを見る",
      },
    },
    {
      bounds: { x: COL_W * 2, y: 0, width: COL_W + 1, height: ROW_H },
      action: {
        type: "postback",
        label: "予約",
        data: "action=reserve",
        displayText: "予約する",
      },
    },
    // Row 2
    {
      bounds: { x: 0, y: ROW_H, width: COL_W, height: ROW_H },
      action: {
        type: "postback",
        label: "クーポン",
        data: "action=coupon",
        displayText: "クーポンを見る",
      },
    },
    {
      bounds: { x: COL_W, y: ROW_H, width: COL_W + 1, height: ROW_H },
      action: {
        type: "postback",
        label: "アクセス",
        data: "action=access",
        displayText: "店舗情報を見る",
      },
    },
    {
      bounds: { x: COL_W * 2, y: ROW_H, width: COL_W + 1, height: ROW_H },
      action: {
        type: "postback",
        label: "お問い合わせ",
        data: "action=contact",
        displayText: "お問い合わせ",
      },
    },
  ],
};

async function main() {
  const client = getClient();
  const blobClient = getBlobClient();

  // 既存リッチメニューを削除
  console.log("既存リッチメニューを確認中...");
  try {
    const existing = await client.getRichMenuList();
    for (const menu of existing) {
      console.log(`  削除: ${menu.richMenuId}`);
      await client.deleteRichMenu(menu.richMenuId);
    }
  } catch (e) {
    console.log("  既存メニューなし");
  }

  console.log("リッチメニューを作成中...");
  const result = await client.createRichMenu(RICH_MENU);
  const richMenuId = result.richMenuId || result;
  console.log(`リッチメニュー作成完了: ${richMenuId}`);

  // 画像アップロード
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
  }

  // デフォルトに設定
  await client.setDefaultRichMenu(richMenuId);
  console.log("デフォルトリッチメニューに設定完了");

  console.log(`\nセットアップ完了! ID: ${richMenuId}`);
}

main().catch((error) => {
  console.error("エラー:", error.message);
  if (error.body) console.error("詳細:", JSON.stringify(error.body));
  if (error.statusCode) console.error("Status:", error.statusCode);
  console.error("Full:", error);
  process.exit(1);
});
