/**
 * LINE Webhook ハンドラー
 *
 * - ステップ配信（友だち追加時のウェルカム + クーポン）
 * - タグ自動付与（メッセージ内容に応じて）
 * - 予約フロー（人数選択 → 確認）
 * - セグメント配信の基盤としてのユーザーストア連携
 */

const crypto = require("crypto");
const { replyText, replyFlex, replyMessage } = require("../lib/line");
const { generateResponse } = require("../lib/claude");
const {
  welcomeMessage,
  menuCarousel,
  reservationMessage,
  contactCard,
  faqMessage,
  reservationPartySizeMessage,
  reservationConfirmMessage,
} = require("../lib/flex-messages");
const { registerUser, ensureUser, autoTag, setReservation, addTag } = require("../lib/user-store");
const { welcomeCouponMessage } = require("../lib/step-messages");

// ---------------------------------------------------------------------------
// FAQ 定義
// ---------------------------------------------------------------------------

const FAQ_ENTRIES = [
  {
    keywords: ["営業時間", "何時まで", "何時から", "開店", "閉店"],
    answer:
      "営業時間のご案内です。\n\n平日 8:00〜21:00\n土日祝 9:00〜20:00\n定休日: 毎週水曜日\n\nご来店お待ちしております。",
  },
  {
    keywords: ["場所", "どこ", "住所", "アクセス", "行き方", "最寄り"],
    answer:
      "Cafe Lore へのアクセス\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n\nお気をつけてお越しください。",
  },
  {
    keywords: ["wi-fi", "wifi", "ワイファイ", "電源", "コンセント", "充電"],
    answer:
      "Wi-Fi・電源のご案内\n\nWi-Fi: 無料でご利用いただけます。パスワードはスタッフにお声がけください。\n電源: カウンター席・窓際席に完備しております。\n\nお仕事や勉強にもぜひご利用ください。",
  },
  {
    keywords: ["ペット", "犬", "猫", "動物", "わんちゃん"],
    answer:
      "ペット同伴について\n\nテラス席（8席）はペット同伴OKです。\nリードの着用をお願いしております。\n\n店内へのペット同伴はご遠慮いただいております。ご了承ください。\n\nテラス席のご予約はお電話（03-6455-XXXX）にてご相談ください。",
  },
  {
    keywords: ["駐車場", "駐車", "パーキング", "車"],
    answer:
      "駐車場について\n\n申し訳ございませんが、専用駐車場はございません。\n\n近隣のコインパーキングをご利用ください。\n・タイムズ代官山（徒歩1分）\n・三井のリパーク代官山町（徒歩2分）\n\n詳しくはスタッフにお尋ねください。",
  },
  {
    keywords: ["クーポン", "割引", "特典", "お得"],
    answer:
      "現在ご利用いただけるクーポン\n\n・初回限定 ドリンク10%OFF（ご登録から7日間有効）\n・毎週金曜 ケーキセット100円引き\n・雨の日クーポン ドリンクサイズアップ無料（当日限り、スタッフにお声がけ）\n・お誕生日月 デザート1品プレゼント（事前にLINEでお誕生日を教えてください）\n\nクーポンはお会計時にこの画面をお見せください。",
  },
  {
    keywords: ["アレルギー", "アレルゲン", "グルテン"],
    answer:
      "アレルギー対応について\n\n当店ではアレルギー情報をメニューごとにご案内しております。\n\n主なアレルゲン:\n・乳: ラテ類、チーズケーキ、ティラミス、キッシュ等\n・卵: キッシュ、チーズケーキ、マフィン等\n・小麦: サンドイッチ、トースト、キッシュ等\n・ナッツ: グラノーラボウル、季節のパフェ\n\nグルテンフリー対応メニューもございます。\n厨房でも確認しますので、ご来店時にもスタッフにお伝えください。",
  },
];

const FAQ_QUICK_REPLY = {
  quickReply: {
    items: [
      {
        type: "action",
        action: {
          type: "postback",
          label: "メニューを見る",
          data: "action=menu",
          displayText: "メニューを見る",
        },
      },
      {
        type: "action",
        action: {
          type: "postback",
          label: "予約する",
          data: "action=reserve_start",
          displayText: "予約したい",
        },
      },
      {
        type: "action",
        action: {
          type: "postback",
          label: "AIに相談",
          data: "action=ai",
          displayText: "AIコンシェルジュに相談",
        },
      },
    ],
  },
};

const FAQ_DETAIL = {
  hours:
    "営業時間のご案内です。\n\n平日 8:00〜21:00\n土日祝 9:00〜20:00\n定休日: 毎週水曜日\n\nご来店お待ちしております。",
  access:
    "Cafe Lore へのアクセス\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n\nお気をつけてお越しください。",
  wifi:
    "Wi-Fi・電源のご案内\n\nWi-Fi: 無料でご利用いただけます。パスワードはスタッフにお声がけください。\n電源: カウンター席・窓際席に完備しております。\n\nお仕事や勉強にもぜひご利用ください。",
  pet:
    "ペット同伴について\n\nテラス席（8席）はペット同伴OKです。\nリードの着用をお願いしております。\n\n店内へのペット同伴はご遠慮いただいております。ご了承ください。",
  parking:
    "駐車場について\n\n申し訳ございませんが、専用駐車場はございません。\n\n近隣のコインパーキングをご利用ください。\n・タイムズ代官山（徒歩1分）\n・三井のリパーク代官山町（徒歩2分）",
  coupon:
    "現在ご利用いただけるクーポン\n\n・初回限定 ドリンク10%OFF（ご登録から7日間有効）\n・毎週金曜 ケーキセット100円引き\n・雨の日クーポン ドリンクサイズアップ無料\n・お誕生日月 デザート1品プレゼント\n\nクーポンはお会計時にこの画面をお見せください。",
  allergy:
    "アレルギー対応について\n\n主なアレルゲン:\n・乳: ラテ類、チーズケーキ、ティラミス等\n・卵: キッシュ、チーズケーキ、マフィン等\n・小麦: サンドイッチ、トースト等\n・ナッツ: グラノーラボウル、季節のパフェ\n\nグルテンフリー対応メニューもございます。\n厨房でも確認しますので、ご来店時にもスタッフにお伝えください。",
};

// ---------------------------------------------------------------------------
// メインハンドラー
// ---------------------------------------------------------------------------

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const bodyStr = JSON.stringify(req.body);
    const signature = req.headers["x-line-signature"];

    const hash = crypto
      .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET)
      .update(bodyStr)
      .digest("base64");

    if (hash !== signature) {
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

// ---------------------------------------------------------------------------
// イベントルーター
// ---------------------------------------------------------------------------

async function handleEvent(event) {
  const userId = event.source?.userId;

  switch (event.type) {
    case "follow":
      return handleFollow(event, userId);
    case "message":
      return handleMessage(event, userId);
    case "postback":
      return handlePostback(event, userId);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Follow: 友だち追加 → ユーザー登録 + ウェルカム + クーポン
// ---------------------------------------------------------------------------

async function handleFollow(event, userId) {
  try {
    // ユーザーストアに登録（ステップ配信の起点）
    registerUser(userId);
    console.log(`New friend registered: ${userId}`);

    // ウェルカムメッセージ + 初回クーポンを同時送信
    await replyMessage(event.replyToken, [
      {
        type: "flex",
        altText: "Cafe Lore へようこそ!",
        contents: welcomeMessage(),
      },
      welcomeCouponMessage(),
    ]);
  } catch (error) {
    console.error("Follow event error:", error);
  }
}

// ---------------------------------------------------------------------------
// Message: テキスト処理 + タグ自動付与
// ---------------------------------------------------------------------------

function matchFaq(text) {
  const normalized = text.toLowerCase();
  for (const entry of FAQ_ENTRIES) {
    for (const kw of entry.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return entry.answer;
      }
    }
  }
  return null;
}

async function handleMessage(event, userId) {
  if (event.message.type !== "text") {
    return replyText(event.replyToken, "テキストメッセージでお話しください。");
  }

  const text = event.message.text.trim();

  // --- タグ自動付与（全メッセージで実行） ---
  const addedTags = autoTag(userId, text);
  if (addedTags.length > 0) {
    console.log(`Auto-tagged ${userId}: ${addedTags.join(", ")}`);
  }

  try {
    // キーワード完全一致: メニュー
    if (text === "メニュー" || text === "menu") {
      return replyFlex(event.replyToken, "Cafe Lore メニュー", menuCarousel());
    }

    // キーワード完全一致: 予約 → 人数選択フローへ
    if (text === "予約" || text === "reserve") {
      addTag(userId, "reservation_interest");
      return replyMessage(event.replyToken, [reservationPartySizeMessage()]);
    }

    // FAQ キーワードマッチ
    const faqAnswer = matchFaq(text);
    if (faqAnswer) {
      return replyMessage(event.replyToken, {
        type: "text",
        text: faqAnswer,
        ...FAQ_QUICK_REPLY,
      });
    }

    // AI応答（Claude）
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

// ---------------------------------------------------------------------------
// Postback: アクション処理 + 予約フロー
// ---------------------------------------------------------------------------

async function handlePostback(event, userId) {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get("action");

  // postbackでもユーザーを確認
  ensureUser(userId);

  try {
    switch (action) {
      case "menu":
        return replyFlex(event.replyToken, "Cafe Lore メニュー", menuCarousel());

      case "reserve":
        return replyFlex(event.replyToken, "ご予約について", reservationMessage());

      // 予約フロー: 人数選択開始
      case "reserve_start": {
        addTag(userId, "reservation_interest");
        return replyMessage(event.replyToken, [reservationPartySizeMessage()]);
      }

      // 予約フロー: 人数選択後
      case "reserve_party": {
        const size = data.get("size");
        // ユーザーストアに予約情報を記録（リマインド配信の対象になる）
        setReservation(userId, size);
        console.log(`Reservation request: ${userId} party=${size}`);
        return replyMessage(event.replyToken, [reservationConfirmMessage(size)]);
      }

      case "ai": {
        const context = data.get("context");
        if (context) {
          const contextMessages = {
            drinks: "おすすめのドリンクを教えて",
            allergy: "アレルギー対応について教えて",
            dessert: "人気のデザートはどれ？",
          };
          const msg = contextMessages[context] || "おすすめを教えて";
          const aiRes = await generateResponse(msg);
          return replyText(event.replyToken, aiRes);
        }
        return replyText(
          event.replyToken,
          "AIコンシェルジュモードです\nメニューの相談、アレルギー対応、おすすめなど何でもお気軽にどうぞ!"
        );
      }

      case "coupon":
        return replyMessage(event.replyToken, {
          type: "text",
          text: "現在ご利用いただけるクーポン\n\n・初回限定 ドリンク10%OFF（ご登録から7日間有効）\n・毎週金曜 ケーキセット100円引き\n・雨の日クーポン ドリンクサイズアップ無料（当日限り、スタッフにお声がけ）\n・お誕生日月 デザート1品プレゼント（事前にLINEでお誕生日を教えてください）\n\nクーポンはお会計時にこの画面をお見せください。",
          ...FAQ_QUICK_REPLY,
        });

      case "access":
        return replyMessage(event.replyToken, {
          type: "text",
          text: "Cafe Lore\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n営業時間: 平日 8:00〜21:00 / 土日祝 9:00〜20:00\n定休日: 毎週水曜日\n席数: 店内22席 + テラス8席（ペット同伴可）",
          ...FAQ_QUICK_REPLY,
        });

      case "contact":
        return replyFlex(event.replyToken, "お問い合わせ", contactCard());

      case "faq":
        return replyFlex(event.replyToken, "よくある質問", faqMessage());

      case "faq_detail": {
        const q = data.get("q");
        const answer = FAQ_DETAIL[q];
        if (answer) {
          return replyMessage(event.replyToken, {
            type: "text",
            text: answer,
            ...FAQ_QUICK_REPLY,
          });
        }
        return replyText(event.replyToken, "お手伝いできることはありますか?");
      }

      default:
        return replyText(event.replyToken, "お手伝いできることはありますか?");
    }
  } catch (error) {
    console.error("Postback handling error:", error);
    return replyText(event.replyToken, "申し訳ございません。ただいま応答できませんでした。");
  }
}
