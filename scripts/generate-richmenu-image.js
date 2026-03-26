#!/usr/bin/env node
const sharp = require("sharp");

const WIDTH = 2500;
const HEIGHT = 843;
const COL_WIDTH = Math.floor(WIDTH / 3);

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#4A2C2A"/>

  <!-- Column 1: AI相談 -->
  <rect x="0" y="0" width="${COL_WIDTH}" height="${HEIGHT}" fill="#5C3A2E"/>
  <text x="${COL_WIDTH/2}" y="340" text-anchor="middle" fill="#FFFFFF" font-size="120" font-family="sans-serif">🤖</text>
  <text x="${COL_WIDTH/2}" y="500" text-anchor="middle" fill="#FFFFFF" font-size="72" font-weight="bold" font-family="sans-serif">AI相談</text>
  <text x="${COL_WIDTH/2}" y="580" text-anchor="middle" fill="#DDCCBB" font-size="40" font-family="sans-serif">何でも聞いてね</text>

  <!-- Divider 1 -->
  <line x1="${COL_WIDTH}" y1="80" x2="${COL_WIDTH}" y2="${HEIGHT-80}" stroke="#7A5A4A" stroke-width="2"/>

  <!-- Column 2: メニュー -->
  <rect x="${COL_WIDTH}" y="0" width="${COL_WIDTH+1}" height="${HEIGHT}" fill="#4A2C2A"/>
  <text x="${COL_WIDTH + COL_WIDTH/2}" y="340" text-anchor="middle" fill="#FFFFFF" font-size="120" font-family="sans-serif">📋</text>
  <text x="${COL_WIDTH + COL_WIDTH/2}" y="500" text-anchor="middle" fill="#FFFFFF" font-size="72" font-weight="bold" font-family="sans-serif">メニュー</text>
  <text x="${COL_WIDTH + COL_WIDTH/2}" y="580" text-anchor="middle" fill="#DDCCBB" font-size="40" font-family="sans-serif">ドリンク・フード</text>

  <!-- Divider 2 -->
  <line x1="${COL_WIDTH*2}" y1="80" x2="${COL_WIDTH*2}" y2="${HEIGHT-80}" stroke="#7A5A4A" stroke-width="2"/>

  <!-- Column 3: 予約 -->
  <rect x="${COL_WIDTH*2}" y="0" width="${COL_WIDTH+1}" height="${HEIGHT}" fill="#3A1C1A"/>
  <text x="${COL_WIDTH*2 + COL_WIDTH/2}" y="340" text-anchor="middle" fill="#FFFFFF" font-size="120" font-family="sans-serif">📅</text>
  <text x="${COL_WIDTH*2 + COL_WIDTH/2}" y="500" text-anchor="middle" fill="#FFFFFF" font-size="72" font-weight="bold" font-family="sans-serif">予約</text>
  <text x="${COL_WIDTH*2 + COL_WIDTH/2}" y="580" text-anchor="middle" fill="#DDCCBB" font-size="40" font-family="sans-serif">お席を確保</text>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile("richmenu.png")
  .then(() => console.log("richmenu.png 生成完了 (2500x843)"))
  .catch((e) => console.error("Error:", e));
