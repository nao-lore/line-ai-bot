#!/usr/bin/env node
const sharp = require("sharp");

const WIDTH = 2500;
const HEIGHT = 1686;
const COL_W = Math.floor(WIDTH / 3);
const ROW_H = Math.floor(HEIGHT / 2);

function cell(x, y, iconChar, label, sublabel) {
  const cx = x + COL_W / 2;
  const iconY = y + ROW_H * 0.35;
  return `
    <circle cx="${cx}" cy="${iconY}" r="80" fill="#3C6B4B"/>
    <text x="${cx}" y="${iconY + 26}" text-anchor="middle" fill="#FFFFFF" font-size="56" font-weight="bold" font-family="Helvetica, Arial, sans-serif">${iconChar}</text>
    <text x="${cx}" y="${y + ROW_H * 0.62}" text-anchor="middle" fill="#1E1E1E" font-size="68" font-weight="bold" font-family="Helvetica, Arial, sans-serif">${label}</text>
    <text x="${cx}" y="${y + ROW_H * 0.76}" text-anchor="middle" fill="#888888" font-size="36" font-family="Helvetica, Arial, sans-serif">${sublabel}</text>
  `;
}

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#F2F0EB"/>

  <!-- Row divider -->
  <line x1="40" y1="${ROW_H}" x2="${WIDTH - 40}" y2="${ROW_H}" stroke="#D6D0C4" stroke-width="2"/>
  <!-- Col dividers -->
  <line x1="${COL_W}" y1="40" x2="${COL_W}" y2="${ROW_H - 40}" stroke="#D6D0C4" stroke-width="2"/>
  <line x1="${COL_W * 2}" y1="40" x2="${COL_W * 2}" y2="${ROW_H - 40}" stroke="#D6D0C4" stroke-width="2"/>
  <line x1="${COL_W}" y1="${ROW_H + 40}" x2="${COL_W}" y2="${HEIGHT - 40}" stroke="#D6D0C4" stroke-width="2"/>
  <line x1="${COL_W * 2}" y1="${ROW_H + 40}" x2="${COL_W * 2}" y2="${HEIGHT - 40}" stroke="#D6D0C4" stroke-width="2"/>

  ${cell(0, 0, "AI", "AI相談", "お気軽にどうぞ")}
  ${cell(COL_W, 0, "☰", "メニュー", "ドリンク・フード")}
  ${cell(COL_W * 2, 0, "◷", "予約", "お席を確保")}

  ${cell(0, ROW_H, "★", "クーポン", "お得な情報")}
  ${cell(COL_W, ROW_H, "◎", "アクセス", "代官山 徒歩3分")}
  ${cell(COL_W * 2, ROW_H, "✉", "お問い合わせ", "お気軽にどうぞ")}
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile("richmenu.png")
  .then(() => console.log(`richmenu.png 生成完了 (${WIDTH}x${HEIGHT})`))
  .catch((e) => console.error("Error:", e));
