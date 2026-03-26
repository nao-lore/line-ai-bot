const SYSTEM_PROMPT = `あなたは東京のカフェ「Cafe Lore」のAIコンシェルジュです。メニューの相談、アレルギー対応、おすすめ提案を行います。日本語で丁寧に応答してください。回答は簡潔に、3文以内で。`;

const LINE_TEXT_LIMIT = 5000;

async function generateResponse(userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const data = await res.json();
  let text = data.content[0].text;

  if (text.length > LINE_TEXT_LIMIT) {
    text = text.slice(0, LINE_TEXT_LIMIT - 3) + "...";
  }

  return text;
}

module.exports = { generateResponse };
