// カラーパレット — ナチュラルカフェ（スタバ風）
const C = {
  bg: "#F2F0EB",         // ウォームベージュ
  card: "#FFFFFF",       // カード白
  accent: "#1E3932",     // ダークグリーン（メイン）
  accent2: "#00704A",    // スタバグリーン
  accent3: "#6B4226",    // コーヒーブラウン
  text: "#1E1E1E",       // ほぼ黒
  textSub: "#555555",    // ダークグレー
  textMuted: "#888888",  // ミッドグレー
  divider: "#D6D0C4",    // ウォームグレー
};

function welcomeMessage() {
  return {
    type: "bubble",
    size: "mega",
    styles: {
      hero: { backgroundColor: C.accent },
      body: { backgroundColor: C.bg },
      footer: { backgroundColor: C.bg },
    },
    hero: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "SPECIALTY COFFEE & HANDMADE SWEETS",
              color: "#C8956C",
              size: "xxs",
              align: "center",
              weight: "bold",
            },
            {
              type: "text",
              text: "Cafe Lore",
              color: "#FFFFFF",
              size: "3xl",
              align: "center",
              weight: "bold",
              margin: "md",
            },
            {
              type: "text",
              text: "物語が生まれる場所 — 代官山",
              color: "#A8C5B8",
              size: "sm",
              align: "center",
              margin: "sm",
            },
          ],
          paddingAll: "xl",
          paddingTop: "xxl",
          paddingBottom: "xxl",
          background: {
            type: "linearGradient",
            angle: "135deg",
            startColor: "#1E3932",
            endColor: "#14292A",
          },
          justifyContent: "center",
        },
      ],
      paddingAll: "none",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "xl",
      contents: [
        {
          type: "text",
          text: "友だち追加ありがとうございます!",
          weight: "bold",
          size: "lg",
          color: C.accent,
        },
        {
          type: "text",
          text: "自家焙煎のスペシャルティコーヒーと\nパティシエ手作りスイーツをお届けする\n代官山の隠れ家カフェです。",
          wrap: true,
          size: "sm",
          color: C.textSub,
          lineSpacing: "6px",
        },
        // 初回クーポン
        {
          type: "box",
          layout: "vertical",
          margin: "xl",
          paddingAll: "lg",
          cornerRadius: "lg",
          backgroundColor: "#FFF8E7",
          borderWidth: "1px",
          borderColor: "#F0D78C",
          contents: [
            {
              type: "text",
              text: "🎁 友だち追加特典",
              weight: "bold",
              size: "md",
              color: C.accent3,
            },
            {
              type: "text",
              text: "ドリンク全品 10% OFF",
              weight: "bold",
              size: "xl",
              color: "#D4380D",
              margin: "sm",
            },
            {
              type: "text",
              text: "ご来店時にこの画面をスタッフに\nお見せください。\n有効期限: 友だち追加から30日間",
              wrap: true,
              size: "xs",
              color: C.textMuted,
              margin: "md",
              lineSpacing: "4px",
            },
          ],
        },
        { type: "separator", margin: "xl", color: C.divider },
        {
          type: "text",
          text: "こんなことができます",
          weight: "bold",
          size: "sm",
          color: C.accent,
          margin: "lg",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "md",
          spacing: "lg",
          contents: [
            guideItem("☕", "メニュー・おすすめ", "「メニュー」と送るだけ"),
            guideItem("📅", "予約・空席確認", "「予約」と送るだけ"),
            guideItem("🍰", "アレルギー相談", "食材やアレルギーの確認"),
            guideItem("💬", "なんでもチャット", "AIコンシェルジュが対応"),
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
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
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "postback",
            label: "季節のおすすめを聞く",
            data: "action=ai&context=seasonal",
            displayText: "季節のおすすめは?",
          },
        },
      ],
    },
  };
}

function guideItem(icon, title, desc) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "lg",
    contents: [
      { type: "text", text: icon, size: "lg", flex: 0 },
      {
        type: "box",
        layout: "vertical",
        flex: 5,
        contents: [
          { type: "text", text: title, size: "sm", weight: "bold", color: C.text },
          { type: "text", text: desc, size: "xs", color: C.textMuted },
        ],
      },
    ],
  };
}

function menuCarousel() {
  return {
    type: "carousel",
    contents: [drinkCard(), foodCard(), dessertCard()],
  };
}

function drinkCard() {
  return menuCard({
    heroColor: "1E3932",
    heroText: "DRINKS",
    title: "ドリンクメニュー",
    titleColor: C.accent,
    subtitle: "スペシャルティグレードの豆を使用。\n週替わりシングルオリジンもご用意。",
    items: [
      ["ドリップコーヒー", "¥480"],
      ["カフェラテ", "¥550"],
      ["カプチーノ", "¥550"],
      ["エスプレッソ", "¥400"],
      ["抹茶ラテ", "¥600"],
      ["チャイラテ", "¥580"],
      ["桜ラテ ✿", "¥650"],
    ],
    note: "Ice +¥50 / ミルク変更 +¥80 / デカフェ +¥50",
    btnLabel: "おすすめを聞く",
    btnColor: C.accent,
    btnData: "action=ai&context=drinks",
    btnText: "おすすめのドリンクを教えて",
  });
}

function foodCard() {
  return menuCard({
    heroColor: "00704A",
    heroText: "FOOD",
    title: "フードメニュー",
    titleColor: C.accent2,
    subtitle: "自家製パンと無添加素材にこだわった\nランチプレートとサンドイッチ。",
    items: [
      ["BLTサンドイッチ", "¥780"],
      ["アボカドトースト", "¥850"],
      ["キッシュプレート", "¥900"],
      ["シーザーサラダ", "¥750"],
      ["クロックムッシュ", "¥680"],
      ["グラノーラボウル", "¥650"],
      ["本日のスープ", "¥500"],
    ],
    note: "ランチセット(ドリンク付) +¥300",
    btnLabel: "アレルギー情報を確認",
    btnColor: C.accent2,
    btnData: "action=ai&context=allergy",
    btnText: "アレルギー対応について教えて",
  });
}

function dessertCard() {
  return menuCard({
    heroColor: "6B4226",
    heroText: "DESSERT",
    title: "デザートメニュー",
    titleColor: C.accent3,
    subtitle: "パティシエ手作り。毎朝焼き上げる\nバスクチーズケーキが一番人気。",
    items: [
      ["バスクチーズケーキ", "¥600"],
      ["ティラミス", "¥650"],
      ["本日のマフィン", "¥400"],
      ["アフォガート", "¥550"],
      ["季節のパフェ 🍓", "¥800"],
    ],
    note: null,
    btnLabel: "人気デザートを聞く",
    btnColor: C.accent3,
    btnData: "action=ai&context=dessert",
    btnText: "人気のデザートはどれ？",
  });
}

function menuCard({ heroColor, heroText, title, titleColor, subtitle, items, note, btnLabel, btnColor, btnData, btnText }) {
  const bodyContents = [
    { type: "text", text: title, weight: "bold", size: "xl", color: titleColor },
    { type: "text", text: subtitle, wrap: true, size: "sm", color: C.textSub, lineSpacing: "4px" },
    { type: "separator", margin: "lg", color: C.divider },
  ];

  for (const [name, price] of items) {
    bodyContents.push(menuRow(name, price));
  }

  if (note) {
    bodyContents.push({
      type: "text",
      text: note,
      size: "xs",
      color: C.textMuted,
      margin: "xl",
    });
  }

  return {
    type: "bubble",
    size: "mega",
    styles: {
      body: { backgroundColor: C.bg },
      footer: { backgroundColor: C.bg },
    },
    hero: {
      type: "image",
      url: `https://placehold.co/1200x480/${heroColor}/FFFFFF?text=${heroText}&font=playfair-display`,
      size: "full",
      aspectRatio: "5:2",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "xl",
      contents: bodyContents,
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "lg",
      contents: [
        {
          type: "button",
          style: "primary",
          color: btnColor,
          height: "md",
          action: {
            type: "postback",
            label: btnLabel,
            data: btnData,
            displayText: btnText,
          },
        },
        // Stripe Payment Links 連携
        // 環境変数 or 設定ファイルで店舗ごとのPayment Link URLを管理
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "uri",
            label: "注文する (オンライン決済)",
            // Stripe Payment Link URLに差し替え
            uri: "https://line-ai-bot-seven.vercel.app/order.html",
          },
        },
      ],
    },
  };
}

function menuRow(name, price) {
  return {
    type: "box",
    layout: "horizontal",
    margin: "lg",
    contents: [
      { type: "text", text: name, size: "md", color: C.text, flex: 5 },
      { type: "text", text: price, size: "md", color: C.accent, align: "end", weight: "bold", flex: 2 },
    ],
  };
}

function reservationMessage() {
  return {
    type: "bubble",
    size: "mega",
    styles: {
      header: { backgroundColor: C.bg },
      body: { backgroundColor: C.bg },
      footer: { backgroundColor: C.bg },
    },
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "xl",
      contents: [
        { type: "text", text: "RESERVATION", color: C.textMuted, weight: "bold", size: "xs" },
        { type: "text", text: "ご予約について", color: C.text, weight: "bold", size: "xl", margin: "sm" },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "xl",
      paddingAll: "xl",
      contents: [
        {
          type: "text",
          text: "お電話またはオンラインで\nご予約を承っております。",
          wrap: true,
          size: "sm",
          color: C.textSub,
          lineSpacing: "4px",
        },
        { type: "separator", color: C.divider },
        infoRow("営業時間", "平日 8:00〜21:00\n土日祝 9:00〜20:00"),
        infoRow("定休日", "毎週水曜日"),
        infoRow("席数", "店内22席 + テラス8席"),
        infoRow("電話", "03-6455-XXXX"),
        { type: "separator", color: C.divider },
        {
          type: "text",
          text: "4名様以上 → お電話にて\nテラス席指定 → お電話にてご相談\nキャンセル → 前日17:00まで無料",
          wrap: true,
          size: "xs",
          color: C.textMuted,
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
          action: { type: "uri", label: "オンライン予約", uri: "https://line-ai-bot-seven.vercel.app/reserve.html" },
        },
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: { type: "uri", label: "電話で予約", uri: "tel:0364550000" },
        },
      ],
    },
  };
}

function infoRow(label, value) {
  return {
    type: "box",
    layout: "horizontal",
    margin: "lg",
    contents: [
      { type: "text", text: label, size: "sm", color: C.textMuted, flex: 2 },
      { type: "text", text: value, size: "sm", color: C.text, flex: 4, wrap: true, lineSpacing: "4px" },
    ],
  };
}

function contactCard() {
  return {
    type: "bubble",
    size: "mega",
    styles: {
      header: { backgroundColor: C.accent },
      body: { backgroundColor: C.bg },
      footer: { backgroundColor: C.bg },
    },
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "xl",
      contents: [
        { type: "text", text: "CONTACT", color: "#FFFFFF", weight: "bold", size: "xs" },
        { type: "text", text: "お問い合わせ", color: "#FFFFFF", weight: "bold", size: "xl", margin: "sm" },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "xl",
      paddingAll: "xl",
      contents: [
        {
          type: "text",
          text: "ご不明点やご要望がございましたら、\nお気軽にお問い合わせください。",
          wrap: true,
          size: "sm",
          color: C.textSub,
          lineSpacing: "4px",
        },
        { type: "separator", color: C.divider },
        {
          type: "box",
          layout: "vertical",
          spacing: "lg",
          contents: [
            contactOption("💡", "よくある質問", "営業時間・Wi-Fi・ペット等"),
            contactOption("📞", "電話で問い合わせ", "03-6455-XXXX（10:00〜20:00）"),
            contactOption("💬", "チャットで相談", "AIコンシェルジュが対応します"),
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
          color: C.accent,
          height: "md",
          action: {
            type: "postback",
            label: "よくある質問を見る",
            data: "action=faq",
            displayText: "よくある質問",
          },
        },
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "uri",
            label: "電話する",
            uri: "tel:0364550000",
          },
        },
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "postback",
            label: "チャットで相談",
            data: "action=ai",
            displayText: "AIコンシェルジュに相談",
          },
        },
      ],
    },
  };
}

function contactOption(icon, title, desc) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "lg",
    contents: [
      { type: "text", text: icon, size: "lg", flex: 0 },
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

function faqMessage() {
  return {
    type: "carousel",
    contents: [
      faqBubble("よくある質問 (1/2)", [
        faqButton("営業時間は?", "action=faq_detail&q=hours"),
        faqButton("アクセス・場所は?", "action=faq_detail&q=access"),
        faqButton("Wi-Fi・電源はある?", "action=faq_detail&q=wifi"),
        faqButton("ペット同伴は可能?", "action=faq_detail&q=pet"),
        faqButton("駐車場はある?", "action=faq_detail&q=parking"),
        faqButton("クーポンはある?", "action=faq_detail&q=coupon"),
        faqButton("アレルギー対応は?", "action=faq_detail&q=allergy"),
        faqButton("テイクアウトできる?", "action=faq_detail&q=takeout"),
      ]),
      faqBubble("よくある質問 (2/2)", [
        faqButton("子連れでも大丈夫?", "action=faq_detail&q=kids"),
        faqButton("誕生日のお祝いは?", "action=faq_detail&q=birthday"),
        faqButton("混雑する時間帯は?", "action=faq_detail&q=crowded"),
        faqButton("コーヒー豆は買える?", "action=faq_detail&q=beans"),
        faqButton("個室はある?", "action=faq_detail&q=private_room"),
        faqButton("貸切はできる?", "action=faq_detail&q=party"),
        faqButton("支払い方法は?", "action=faq_detail&q=payment"),
      ]),
    ],
  };
}

function faqBubble(title, buttons) {
  return {
    type: "bubble",
    size: "mega",
    styles: {
      header: { backgroundColor: C.bg },
      body: { backgroundColor: C.bg },
    },
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "xl",
      contents: [
        { type: "text", text: "FAQ", color: C.textMuted, weight: "bold", size: "xs" },
        { type: "text", text: title, color: C.text, weight: "bold", size: "xl", margin: "sm" },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "xl",
      contents: [
        {
          type: "text",
          text: "タップして回答を確認できます",
          size: "sm",
          color: C.textMuted,
        },
        { type: "separator", color: C.divider },
        ...buttons,
      ],
    },
  };
}

function faqButton(label, data) {
  return {
    type: "button",
    style: "secondary",
    height: "sm",
    margin: "md",
    action: {
      type: "postback",
      label: label,
      data: data,
      displayText: label,
    },
  };
}

/**
 * 予約人数選択メッセージ（クイックリプライ付き）
 * 「予約」postback後に人数を選択させる
 */
function reservationPartySizeMessage() {
  return {
    type: "text",
    text: "ご予約ありがとうございます!\nご来店の人数をお選びください。",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "1名",
            data: "action=reserve_party&size=1",
            displayText: "1名で予約したい",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "2名",
            data: "action=reserve_party&size=2",
            displayText: "2名で予約したい",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "3名",
            data: "action=reserve_party&size=3",
            displayText: "3名で予約したい",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "4名以上",
            data: "action=reserve_party&size=4plus",
            displayText: "4名以上で予約したい",
          },
        },
      ],
    },
  };
}

/**
 * 予約確認メッセージ（人数選択後）
 */
function reservationConfirmMessage(partySize) {
  if (partySize === "4plus") {
    return {
      type: "flex",
      altText: "4名以上のご予約はお電話にて承ります",
      contents: {
        type: "bubble",
        size: "mega",
        styles: { body: { backgroundColor: C.bg }, footer: { backgroundColor: C.bg } },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "lg",
          paddingAll: "xl",
          contents: [
            { type: "text", text: "4名様以上のご予約", weight: "bold", size: "lg", color: C.accent },
            {
              type: "text",
              text: "4名様以上のご予約はお電話にて承っております。\n下のボタンからお電話ください。",
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
          paddingAll: "lg",
          contents: [
            {
              type: "button",
              style: "primary",
              color: C.accent,
              height: "md",
              action: { type: "uri", label: "電話で予約する", uri: "tel:0364550000" },
            },
          ],
        },
      },
    };
  }

  // 2名 or 3名
  return {
    type: "flex",
    altText: `${partySize}名様でのご予約`,
    contents: {
      type: "bubble",
      size: "mega",
      styles: { body: { backgroundColor: C.bg }, footer: { backgroundColor: C.bg } },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "xl",
        contents: [
          { type: "text", text: `${partySize}名様でのご予約`, weight: "bold", size: "lg", color: C.accent },
          {
            type: "text",
            text: "ご希望の日時をメッセージでお送りください。\n例: 「3月30日 19時」\n\nまたはオンライン予約もご利用いただけます。",
            wrap: true,
            size: "sm",
            color: C.textSub,
            lineSpacing: "6px",
          },
          { type: "separator", margin: "lg", color: C.divider },
          {
            type: "text",
            text: "キャンセルは前日17:00まで無料です",
            size: "xs",
            color: C.textMuted,
            margin: "lg",
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
            action: { type: "uri", label: "オンライン予約", uri: "https://line-ai-bot-seven.vercel.app/reserve.html" },
          },
          {
            type: "button",
            style: "secondary",
            height: "md",
            action: { type: "uri", label: "電話で予約", uri: "tel:0364550000" },
          },
        ],
      },
    },
  };
}

module.exports = {
  welcomeMessage,
  menuCarousel,
  reservationMessage,
  contactCard,
  faqMessage,
  reservationPartySizeMessage,
  reservationConfirmMessage,
};
