/**
 * ステップ配信 & リマインド配信
 *
 * 友だち追加日からの経過日数に応じて自動でメッセージを配信する。
 *
 * スケジュール:
 *   Day 0  : ウェルカムメッセージ + 初回クーポン（follow時に即時送信）
 *   Day 3  : おすすめメニュー紹介
 *   Day 7  : 期限付きクーポン（来店促進）
 *   Day 14 : アンケート送信
 *
 * リマインド:
 *   予約関心タグを持つユーザーに翌日リマインドを送信
 */

const C = {
  bg: "#F2F0EB",
  accent: "#1E3932",
  accent2: "#00704A",
  accent3: "#6B4226",
  text: "#1E1E1E",
  textSub: "#555555",
  textMuted: "#888888",
  divider: "#D6D0C4",
};

// ---------------------------------------------------------------------------
// ウェルカムメッセージ（Day 0 — follow直後に replyToken で送信）
// ---------------------------------------------------------------------------

/**
 * 初回クーポンのFlex Message
 * ウェルカムメッセージの直後に送信する
 */
function welcomeCouponMessage() {
  return {
    type: "flex",
    altText: "友だち追加ありがとうございます! 初回クーポンをプレゼント",
    contents: {
      type: "bubble",
      size: "mega",
      styles: {
        body: { backgroundColor: C.bg },
        footer: { backgroundColor: C.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "WELCOME COUPON",
            color: C.textMuted,
            weight: "bold",
            size: "xs",
          },
          {
            type: "text",
            text: "初回限定 ドリンク10%OFF",
            weight: "bold",
            size: "xl",
            color: C.accent,
          },
          {
            type: "text",
            text: "友だち追加ありがとうございます!\nこちらのクーポンをお会計時にご提示ください。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
          { type: "separator", margin: "xl", color: C.divider },
          {
            type: "box",
            layout: "vertical",
            margin: "xl",
            spacing: "sm",
            contents: [
              { type: "text", text: "有効期限: ご登録から7日間", size: "xs", color: C.textMuted },
              { type: "text", text: "全ドリンクメニュー対象", size: "xs", color: C.textMuted },
              { type: "text", text: "他クーポンとの併用不可", size: "xs", color: C.textMuted },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        contents: [
          {
            type: "button",
            style: "primary",
            color: C.accent,
            height: "md",
            action: {
              type: "postback",
              label: "メニューを見る",
              data: "action=menu",
              displayText: "メニュー",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Day 3: おすすめメニュー紹介
// ---------------------------------------------------------------------------

function day3Message() {
  return {
    type: "flex",
    altText: "Cafe Loreのおすすめメニューをご紹介します",
    contents: {
      type: "bubble",
      size: "mega",
      styles: {
        body: { backgroundColor: C.bg },
        footer: { backgroundColor: C.bg },
      },
      hero: {
        type: "image",
        url: "https://placehold.co/1200x480/00704A/FFFFFF?text=RECOMMEND&font=playfair-display",
        size: "full",
        aspectRatio: "5:2",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "スタッフおすすめ3選",
            weight: "bold",
            size: "xl",
            color: C.accent,
          },
          {
            type: "text",
            text: "Cafe Loreで特に人気のメニューをご紹介します。初めてのご来店にもぴったりです。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
          { type: "separator", margin: "lg", color: C.divider },
          recommendItem("1", "ドリップコーヒー ¥480", "週替わりシングルオリジン。今週はエチオピア イルガチェフェ"),
          recommendItem("2", "バスクチーズケーキ ¥600", "毎朝焼き上げ。当店一番人気のデザート"),
          recommendItem("3", "キッシュプレート ¥900", "季節野菜のキッシュ+サラダ+スープの満足ランチ"),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        contents: [
          {
            type: "button",
            style: "primary",
            color: C.accent2,
            height: "md",
            action: {
              type: "postback",
              label: "全メニューを見る",
              data: "action=menu",
              displayText: "メニュー",
            },
          },
        ],
      },
    },
  };
}

function recommendItem(num, title, desc) {
  return {
    type: "box",
    layout: "horizontal",
    margin: "lg",
    spacing: "lg",
    contents: [
      {
        type: "text",
        text: num,
        size: "xxl",
        color: C.accent2,
        weight: "bold",
        flex: 0,
      },
      {
        type: "box",
        layout: "vertical",
        flex: 5,
        contents: [
          { type: "text", text: title, size: "sm", weight: "bold", color: C.text },
          { type: "text", text: desc, size: "xs", color: C.textMuted, wrap: true },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Day 7: 期限付きクーポン（来店促進）
// ---------------------------------------------------------------------------

function day7Message() {
  return {
    type: "flex",
    altText: "期間限定クーポンのお知らせ",
    contents: {
      type: "bubble",
      size: "mega",
      styles: {
        body: { backgroundColor: C.bg },
        footer: { backgroundColor: C.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "LIMITED COUPON",
            color: C.accent3,
            weight: "bold",
            size: "xs",
          },
          {
            type: "text",
            text: "ケーキセット ¥200 OFF",
            weight: "bold",
            size: "xl",
            color: C.accent3,
          },
          {
            type: "text",
            text: "Cafe Loreに友だち登録いただいて1週間。\nまだご来店がお済みでなければ、\nこちらの特別クーポンをぜひご利用ください。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
          { type: "separator", margin: "xl", color: C.divider },
          {
            type: "box",
            layout: "vertical",
            margin: "xl",
            spacing: "sm",
            contents: [
              { type: "text", text: "有効期限: 本日から3日間", size: "xs", color: C.textMuted },
              { type: "text", text: "ドリンク+ケーキの組み合わせが対象", size: "xs", color: C.textMuted },
              { type: "text", text: "お会計時にこの画面をご提示ください", size: "xs", color: C.textMuted },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "lg",
        contents: [
          {
            type: "button",
            style: "primary",
            color: C.accent3,
            height: "md",
            action: {
              type: "postback",
              label: "デザートメニューを見る",
              data: "action=menu",
              displayText: "メニュー",
            },
          },
          {
            type: "button",
            style: "secondary",
            height: "md",
            action: {
              type: "postback",
              label: "予約する",
              data: "action=reserve",
              displayText: "予約",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Day 14: アンケート送信
// ---------------------------------------------------------------------------

function day14Message() {
  return {
    type: "flex",
    altText: "Cafe Loreについてアンケートにご協力ください",
    contents: {
      type: "bubble",
      size: "mega",
      styles: {
        body: { backgroundColor: C.bg },
        footer: { backgroundColor: C.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "QUESTIONNAIRE",
            color: C.textMuted,
            weight: "bold",
            size: "xs",
          },
          {
            type: "text",
            text: "ご意見をお聞かせください",
            weight: "bold",
            size: "xl",
            color: C.accent,
          },
          {
            type: "text",
            text: "Cafe Loreをもっと良くするために、\n簡単なアンケートにご協力いただけますか?\n所要時間は約1分です。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
          { type: "separator", margin: "xl", color: C.divider },
          {
            type: "text",
            text: "回答いただいた方にドリンク1杯無料クーポンをプレゼント!",
            wrap: true,
            size: "sm",
            color: C.accent2,
            weight: "bold",
            margin: "xl",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        contents: [
          {
            type: "button",
            style: "primary",
            color: C.accent,
            height: "md",
            action: {
              type: "uri",
              label: "アンケートに回答する",
              // Google Forms のURLに差し替え
              uri: "https://forms.gle/example",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// リマインドメッセージ（予約関心ユーザー向け）
// ---------------------------------------------------------------------------

function reservationReminderMessage() {
  return {
    type: "flex",
    altText: "ご予約はお済みですか?",
    contents: {
      type: "bubble",
      size: "mega",
      styles: {
        body: { backgroundColor: C.bg },
        footer: { backgroundColor: C.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "REMINDER",
            color: C.textMuted,
            weight: "bold",
            size: "xs",
          },
          {
            type: "text",
            text: "ご予約はお済みですか?",
            weight: "bold",
            size: "xl",
            color: C.accent,
          },
          {
            type: "text",
            text: "先日は予約についてお問い合わせいただきありがとうございます。ご予約がまだの場合は、下のボタンからお手続きいただけます。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "lg",
        contents: [
          {
            type: "button",
            style: "primary",
            color: C.accent,
            height: "md",
            action: {
              type: "postback",
              label: "予約する",
              data: "action=reserve_start",
              displayText: "予約したい",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// ステップ配信スケジュール定義
// ---------------------------------------------------------------------------

/**
 * 登録日からの経過日数ごとの配信メッセージ定義
 */
const STEP_SCHEDULE = [
  { day: 3, getMessage: day3Message, description: "おすすめメニュー紹介" },
  { day: 7, getMessage: day7Message, description: "期限付きクーポン" },
  { day: 14, getMessage: day14Message, description: "アンケート送信" },
];

module.exports = {
  welcomeCouponMessage,
  day3Message,
  day7Message,
  day14Message,
  reservationReminderMessage,
  STEP_SCHEDULE,
};
