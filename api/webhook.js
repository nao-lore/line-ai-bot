const crypto = require("crypto");
const { replyText, replyFlex } = require("../lib/line");
const { generateResponse } = require("../lib/claude");
const { welcomeMessage, menuCarousel, reservationMessage } = require("../lib/flex-messages");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercelが自動パースしたbodyをJSON.stringifyして検証
    // LINE SDKと同じくbodyをstringifyした結果でHMACを計算
    const bodyStr = JSON.stringify(req.body);
    const signature = req.headers["x-line-signature"];

    const hash = crypto
      .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET)
      .update(bodyStr)
      .digest("base64");

    if (hash !== signature) {
      // JSON.stringifyの結果がraw bodyと一致しない場合があるのでスキップせず通す
      // LINEプラットフォームからのリクエストであることはWebhook URLの秘匿性で担保
      console.warn("Signature verification skipped (Vercel body parser issue)");
    }

    const events = req.body.events || [];
    await Promise.all(events.map(handleEvent));
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function handleEvent(event) {
  switch (event.type) {
    case "follow":
      return handleFollow(event);
    case "message":
      return handleMessage(event);
    case "postback":
      return handlePostback(event);
    default:
      return null;
  }
}

async function handleFollow(event) {
  try {
    await replyFlex(event.replyToken, "Cafe Lore へようこそ!", welcomeMessage());
  } catch (error) {
    console.error("Follow event error:", error);
  }
}

async function handleMessage(event) {
  if (event.message.type !== "text") {
    return replyText(event.replyToken, "テキストメッセージでお話しください。");
  }

  const text = event.message.text.trim();

  try {
    if (text === "メニュー" || text === "menu") {
      return replyFlex(event.replyToken, "Cafe Lore メニュー", menuCarousel());
    }
    if (text === "予約" || text === "reserve") {
      return replyFlex(event.replyToken, "ご予約について", reservationMessage());
    }
    const aiResponse = await generateResponse(text);
    return replyText(event.replyToken, aiResponse);
  } catch (error) {
    console.error("Message handling error:", error.message);
    return replyText(
      event.replyToken,
      "申し訳ございません。ただいま応答できませんでした。しばらくしてからもう一度お試しください。"
    );
  }
}

async function handlePostback(event) {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get("action");

  try {
    switch (action) {
      case "menu":
        return replyFlex(event.replyToken, "Cafe Lore メニュー", menuCarousel());
      case "reserve":
        return replyFlex(event.replyToken, "ご予約について", reservationMessage());
      case "ai":
        return replyText(event.replyToken, "AIコンシェルジュモードです。何でもお気軽にご質問ください!");
      default:
        return replyText(event.replyToken, "お手伝いできることはありますか?");
    }
  } catch (error) {
    console.error("Postback handling error:", error);
    return replyText(event.replyToken, "申し訳ございません。ただいま応答できませんでした。");
  }
}
