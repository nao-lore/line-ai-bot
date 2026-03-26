#!/usr/bin/env node
const sharp = require("sharp");

const SIZE = 640;
const svg = `
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${SIZE/2}" cy="${SIZE/2}" r="${SIZE/2}" fill="#1E3932"/>
  <text x="${SIZE/2}" y="${SIZE/2 - 40}" text-anchor="middle" fill="#FFFFFF" font-size="120" font-weight="bold" font-family="Georgia, serif" dominant-baseline="central">Cafe</text>
  <text x="${SIZE/2}" y="${SIZE/2 + 80}" text-anchor="middle" fill="#C8956C" font-size="140" font-weight="bold" font-family="Georgia, serif" dominant-baseline="central">Lore</text>
  <line x1="${SIZE/2 - 100}" y1="${SIZE/2 + 10}" x2="${SIZE/2 + 100}" y2="${SIZE/2 + 10}" stroke="#C8956C" stroke-width="2"/>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile("icon.png")
  .then(() => console.log("icon.png 生成完了 (640x640)"))
  .catch((e) => console.error("Error:", e));
