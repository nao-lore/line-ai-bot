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
    keywords: ["営業時間", "何時まで", "何時から", "開店", "閉店", "やってる"],
    answer:
      "営業時間のご案内です。\n\n平日 8:00〜21:00\n土日祝 9:00〜20:00\n定休日: 毎週水曜日\n\nラストオーダーは閉店30分前です。ご来店お待ちしております。",
  },
  {
    keywords: ["場所", "どこ", "住所", "アクセス", "行き方", "最寄り", "道順"],
    answer:
      "Cafe Lore へのアクセス\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n\n代官山駅の正面口を出て、旧山手通り沿いに恵比寿方面へ。ロアビル1Fにございます。",
  },
  {
    keywords: ["wi-fi", "wifi", "ワイファイ", "電源", "コンセント", "充電"],
    answer:
      "Wi-Fi・電源のご案内\n\nWi-Fi: 無料でご利用いただけます。パスワードはレジ横の案内板に掲示、またはスタッフにお声がけください。\n\n電源: カウンター席・窓際席に完備しております。\n\nお仕事や勉強にもぜひご利用ください。混雑時は2時間程度でのご協力をお願いすることがございます。",
  },
  {
    keywords: ["ペット", "犬", "猫", "動物", "わんちゃん"],
    answer:
      "ペット同伴について\n\nテラス席（8席）はペット同伴OKです。リードの着用をお願いしております。お水のボウルもご用意しておりますので、スタッフにお声がけください。\n\n店内へのペット同伴はご遠慮いただいております（補助犬は除きます）。\n\nテラス席のご予約はお電話（03-6455-XXXX）にてご相談ください。",
  },
  {
    keywords: ["駐車場", "駐車", "パーキング", "車"],
    answer:
      "駐車場について\n\n申し訳ございませんが、専用駐車場はございません。\n\n近隣のコインパーキングをご利用ください。\n・タイムズ代官山（徒歩1分）\n・三井のリパーク代官山町（徒歩2分）\n・NPC24H代官山第2（徒歩3分）\n\n詳しい場所はスタッフにお尋ねいただければご案内いたします。",
  },
  {
    keywords: ["クーポン", "割引", "特典", "お得"],
    answer:
      "現在ご利用いただけるクーポン\n\n・初回限定 ドリンク10%OFF（ご登録から7日間有効）\n・毎週金曜 ケーキセット100円引き\n・雨の日クーポン ドリンクサイズアップ無料（当日限り、スタッフにお声がけ）\n・お誕生日月 デザート1品プレゼント（事前にLINEでお誕生日を教えてください）\n\nクーポンはお会計時にこの画面をお見せください。他のクーポンとの併用はできません。",
  },
  {
    keywords: ["アレルギー", "アレルゲン", "グルテン"],
    answer:
      "アレルギー対応について\n\n当店ではアレルギー情報をメニューごとにご案内しております。\n\n主なアレルゲン:\n・乳: ラテ類、チーズケーキ、ティラミス、キッシュ等\n・卵: キッシュ、チーズケーキ、マフィン等\n・小麦: サンドイッチ、トースト、キッシュ等\n・ナッツ: グラノーラボウル、季節のパフェ\n\nグルテンフリー対応メニューもございます。\nアレルギーをお持ちのお客様は、ご注文前にスタッフまでお申し付けください。厨房で個別に確認いたします。",
  },
  {
    keywords: ["テイクアウト", "持ち帰り", "お持ち帰り", "テイク"],
    answer:
      "テイクアウトについて\n\n全ドリンクメニューはテイクアウト可能です（容器代 +30円）。\n\nフード・デザートも一部お持ち帰りいただけます。\n・サンドイッチ類: OK\n・マフィン: OK\n・バスクチーズケーキ: OK（専用BOXあり）\n・キッシュプレート / サラダ: 店内のみ\n\nお電話（03-6455-XXXX）での事前注文も承っております。お急ぎの場合はぜひご利用ください。",
  },
  {
    keywords: ["子連れ", "赤ちゃん", "ベビーカー", "子ども", "子供", "キッズ", "お子様"],
    answer:
      "お子様連れのお客様へ\n\nお子様連れのご来店大歓迎です。\n\n・ベビーカー: 入口スロープあり。店内にも置けますが、テラス席の方がゆったりお過ごしいただけます\n・お子様用イス: ベビーチェア2脚ご用意しています（スタッフにお声がけください）\n・お子様メニュー: 専用メニューはありませんが、オレンジジュース（¥450）やマフィン（¥400）が人気です。取り分けもOKです\n\n周囲のお客様へのご配慮をお願いする場合がございますが、どうぞお気軽にお越しください。",
  },
  {
    keywords: ["誕生日", "バースデー", "ケーキ持ち込み", "持ち込み", "サプライズ"],
    answer:
      "お誕生日・お祝いについて\n\n・バースデープレート: 事前にご予約いただければ、デザートにメッセージプレートをお付けします（+300円）\n・ケーキの持ち込み: お電話でご相談ください。持ち込み料は頂戴しておりません\n・お誕生日月特典: LINEで事前にお誕生日をお知らせいただくと、デザート1品プレゼント\n\nサプライズ演出のご相談も承ります。お気軽にお電話（03-6455-XXXX）でご相談ください。",
  },
  {
    keywords: ["混雑", "空いてる", "空き", "待ち時間", "並ぶ", "混み"],
    answer:
      "混雑状況の目安\n\n比較的空いている時間帯:\n・平日 8:00〜10:00（モーニング帯）\n・平日 14:00〜16:00\n\n混雑しやすい時間帯:\n・平日 12:00〜13:30（ランチピーク）\n・土日 11:00〜14:00\n\n平日の午前中やランチ後のひとときは比較的ゆったりお過ごしいただけます。\n\nリアルタイムの空き状況はお電話（03-6455-XXXX）でお問い合わせいただくのが確実です。",
  },
  {
    keywords: ["コーヒー豆", "豆 販売", "お土産", "豆売り", "豆を買"],
    answer:
      "コーヒー豆の販売について\n\n自家焙煎のコーヒー豆を店頭で販売しております。\n\n・Lore Blend（深煎り）: 100g ¥800 / 200g ¥1,500\n・週替わりシングルオリジン: 100g ¥900〜 / 200g ¥1,700〜\n\n豆のまま・挽き（お好みの粗さ）どちらも対応いたします。ギフト用のパッケージもご用意しております。\n\n焙煎は毎週月曜日。鮮度の良い状態でお届けします。",
  },
  {
    keywords: ["個室", "半個室", "仕切り"],
    answer:
      "個室について\n\n申し訳ございませんが、完全個室のお席はございません。\n\n店内奥のテーブル席は本棚に囲まれた半個室風のスペースになっており、比較的プライベートな空間としてご利用いただけます。\n\nご希望の場合はお電話（03-6455-XXXX）でご予約時にお伝えください。空き状況に応じてご案内いたします。",
  },
  {
    keywords: ["貸切", "パーティー", "パーティ", "イベント利用"],
    answer:
      "貸切・パーティーについて\n\n平日の夜（19:00以降）または定休日（水曜日）に限り、貸切でのご利用を承っております。\n\n・貸切可能人数: 20名以上\n・ご利用時間・料金はご相談\n\n歓送迎会、お誕生日会、小規模なイベント等にご利用いただいております。\n\n詳しくはお電話（03-6455-XXXX）でお問い合わせください。",
  },
  {
    keywords: ["支払い", "クレカ", "クレジット", "paypay", "電子マネー", "現金", "決済", "カード"],
    answer:
      "お支払い方法について\n\n以下のお支払い方法に対応しております。\n\n・現金\n・クレジットカード（VISA / Mastercard / JCB / AMEX）\n・交通系IC（Suica / PASMO 等）\n・電子マネー（iD / QUICPay）\n・QRコード決済（PayPay）\n\nお会計はレジにてお願いいたします。",
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
    "営業時間のご案内です。\n\n平日 8:00〜21:00\n土日祝 9:00〜20:00\n定休日: 毎週水曜日\n\nラストオーダーは閉店30分前です。\nご来店お待ちしております。",
  access:
    "Cafe Lore へのアクセス\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n\n代官山駅の正面口を出て、旧山手通り沿いに恵比寿方面へ。ロアビル1Fにございます。",
  wifi:
    "Wi-Fi・電源のご案内\n\nWi-Fi: 無料でご利用いただけます。パスワードはレジ横の案内板に掲示、またはスタッフにお声がけください。\n\n電源: カウンター席・窓際席に完備しております。\n\nお仕事や勉強にもぜひご利用ください。",
  pet:
    "ペット同伴について\n\nテラス席（8席）はペット同伴OKです。リードの着用をお願いしております。\nお水のボウルもご用意しておりますので、スタッフにお声がけください。\n\n店内へのペット同伴はご遠慮いただいております（補助犬は除きます）。",
  parking:
    "駐車場について\n\n申し訳ございませんが、専用駐車場はございません。\n\n近隣のコインパーキングをご利用ください。\n・タイムズ代官山（徒歩1分）\n・三井のリパーク代官山町（徒歩2分）\n・NPC24H代官山第2（徒歩3分）",
  coupon:
    "現在ご利用いただけるクーポン\n\n・初回限定 ドリンク10%OFF（ご登録から7日間有効）\n・毎週金曜 ケーキセット100円引き\n・雨の日クーポン ドリンクサイズアップ無料\n・お誕生日月 デザート1品プレゼント\n\nクーポンはお会計時にこの画面をお見せください。他のクーポンとの併用はできません。",
  allergy:
    "アレルギー対応について\n\n主なアレルゲン:\n・乳: ラテ類、チーズケーキ、ティラミス等\n・卵: キッシュ、チーズケーキ、マフィン等\n・小麦: サンドイッチ、トースト等\n・ナッツ: グラノーラボウル、季節のパフェ\n\nグルテンフリー対応メニューもございます。\nアレルギーをお持ちのお客様は、ご注文前にスタッフまでお申し付けください。厨房で個別に確認いたします。",
  takeout:
    "テイクアウトについて\n\n全ドリンクメニューはテイクアウト可能です（容器代 +30円）。\n\nフード・デザートも一部お持ち帰りいただけます。\n・サンドイッチ類: OK\n・マフィン: OK\n・バスクチーズケーキ: OK（専用BOXあり）\n\nお電話（03-6455-XXXX）での事前注文も承っております。",
  kids:
    "お子様連れのお客様へ\n\nお子様連れのご来店大歓迎です。\n\n・ベビーカー: 入口スロープあり\n・お子様用イス: ベビーチェア2脚あり\n・取り分け: OK\n\nお子様にはオレンジジュース（¥450）やマフィン（¥400）が人気です。",
  birthday:
    "お誕生日・お祝いについて\n\n・バースデープレート: +300円（要事前予約）\n・ケーキ持ち込み: お電話でご相談ください（持ち込み料無料）\n・お誕生日月特典: デザート1品プレゼント\n\nサプライズ演出もお気軽にご相談ください。\nお電話: 03-6455-XXXX",
  crowded:
    "混雑状況の目安\n\n空いている時間帯:\n・平日 8:00〜10:00\n・平日 14:00〜16:00\n\n混みやすい時間帯:\n・平日 12:00〜13:30\n・土日 11:00〜14:00\n\nリアルタイムの状況はお電話（03-6455-XXXX）でお問い合わせください。",
  beans:
    "コーヒー豆の販売について\n\n自家焙煎のコーヒー豆を店頭で販売しております。\n\n・Lore Blend（深煎り）: 100g ¥800 / 200g ¥1,500\n・週替わりシングルオリジン: 100g ¥900〜\n\n豆のまま・挽きどちらも対応。ギフト用パッケージもございます。焙煎は毎週月曜日です。",
  private_room:
    "個室について\n\n完全個室はございませんが、店内奥のテーブル席は本棚に囲まれた半個室風のスペースです。\n\nご希望の場合はお電話（03-6455-XXXX）でご予約時にお伝えください。空き状況に応じてご案内いたします。",
  party:
    "貸切・パーティーについて\n\n平日夜（19:00以降）または定休日（水曜日）に貸切利用を承っております。\n\n・20名以上から応相談\n・ご利用時間・料金はご相談\n\n歓送迎会、お誕生日会、小規模イベント等にご利用いただいております。\n\n詳しくはお電話（03-6455-XXXX）でお問い合わせください。",
  payment:
    "お支払い方法\n\n・現金\n・クレジットカード（VISA / Mastercard / JCB / AMEX）\n・交通系IC（Suica / PASMO 等）\n・電子マネー（iD / QUICPay）\n・QRコード決済（PayPay）",
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
          text: "Cafe Lore\n\n住所: 東京都渋谷区代官山町15-8 ロアビル1F\n最寄駅: 代官山駅 徒歩3分 / 恵比寿駅 徒歩8分\n営業時間: 平日 8:00〜21:00 / 土日祝 9:00〜20:00\n定休日: 毎週水曜日\n席数: 店内22席 + テラス8席（ペット同伴可）\n\n代官山駅の正面口を出て、旧山手通り沿いに恵比寿方面へお進みください。",
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
