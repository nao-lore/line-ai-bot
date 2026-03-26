function welcomeMessage() {
  return {
    type: "bubble",
    hero: {
      type: "image",
      url: "https://placehold.co/1024x400/8B4513/FFFFFF?text=Cafe+Lore",
      size: "full",
      aspectRatio: "20:8",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "Cafe Lore へようこそ!",
          weight: "bold",
          size: "xl",
          color: "#4A2C2A",
        },
        {
          type: "text",
          text: "AIコンシェルジュがお手伝いします。メニューのご案内、アレルギー対応のご相談、おすすめドリンクのご提案など、お気軽にお声がけください。",
          wrap: true,
          size: "sm",
          color: "#666666",
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "できること",
              weight: "bold",
              size: "md",
              color: "#4A2C2A",
            },
            {
              type: "text",
              text: "- 「メニュー」と送信 → メニュー一覧",
              size: "sm",
              color: "#555555",
            },
            {
              type: "text",
              text: "- 「予約」と送信 → 予約のご案内",
              size: "sm",
              color: "#555555",
            },
            {
              type: "text",
              text: "- 何でも質問 → AIがお答えします",
              size: "sm",
              color: "#555555",
            },
          ],
        },
      ],
    },
  };
}

function menuCarousel() {
  return {
    type: "carousel",
    contents: [drinkMenu(), foodMenu(), dessertMenu()],
  };
}

function drinkMenu() {
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#6B3A2A",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "DRINKS",
          color: "#FFFFFF",
          weight: "bold",
          size: "lg",
        },
        {
          type: "text",
          text: "ドリンクメニュー",
          color: "#DDCCBB",
          size: "xs",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "lg",
      contents: [
        menuItem("ドリップコーヒー", "480"),
        menuItem("カフェラテ", "550"),
        menuItem("カプチーノ", "550"),
        menuItem("エスプレッソ", "400"),
        menuItem("抹茶ラテ", "600"),
        menuItem("チャイラテ", "580"),
        menuItem("オレンジジュース", "450"),
        {
          type: "text",
          text: "※ アイスは +50円",
          size: "xxs",
          color: "#999999",
          margin: "md",
        },
      ],
    },
  };
}

function foodMenu() {
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#2A5A3B",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "FOOD",
          color: "#FFFFFF",
          weight: "bold",
          size: "lg",
        },
        {
          type: "text",
          text: "フードメニュー",
          color: "#BBDDCC",
          size: "xs",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "lg",
      contents: [
        menuItem("BLTサンドイッチ", "780"),
        menuItem("アボカドトースト", "850"),
        menuItem("キッシュプレート", "900"),
        menuItem("シーザーサラダ", "750"),
        menuItem("本日のスープ", "500"),
        {
          type: "text",
          text: "※ ランチセット(ドリンク付) +300円",
          size: "xxs",
          color: "#999999",
          margin: "md",
        },
      ],
    },
  };
}

function dessertMenu() {
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#8B5E83",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "DESSERT",
          color: "#FFFFFF",
          weight: "bold",
          size: "lg",
        },
        {
          type: "text",
          text: "デザートメニュー",
          color: "#DDBBDD",
          size: "xs",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "lg",
      contents: [
        menuItem("チーズケーキ", "600"),
        menuItem("ティラミス", "650"),
        menuItem("本日のマフィン", "400"),
        menuItem("アフォガート", "550"),
        menuItem("季節のパフェ", "800"),
      ],
    },
  };
}

function menuItem(name, price) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: name,
        size: "sm",
        color: "#333333",
        flex: 4,
      },
      {
        type: "text",
        text: `¥${price}`,
        size: "sm",
        color: "#4A2C2A",
        align: "end",
        weight: "bold",
        flex: 2,
      },
    ],
  };
}

function reservationMessage() {
  return {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#4A2C2A",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "ご予約について",
          color: "#FFFFFF",
          weight: "bold",
          size: "lg",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "Cafe Lore のご予約はお電話またはオンラインで承っております。",
          wrap: true,
          size: "sm",
          color: "#555555",
        },
        {
          type: "separator",
        },
        infoRow("営業時間", "10:00 - 20:00"),
        infoRow("定休日", "毎週水曜日"),
        infoRow("席数", "24席（テラス8席含む）"),
        infoRow("電話", "03-XXXX-XXXX"),
        {
          type: "separator",
        },
        {
          type: "text",
          text: "※ 4名様以上のご予約はお電話にてお願いいたします。",
          wrap: true,
          size: "xxs",
          color: "#999999",
          margin: "md",
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
          color: "#4A2C2A",
          action: {
            type: "uri",
            label: "オンライン予約",
            uri: "https://example.com/reserve",
          },
        },
        {
          type: "button",
          style: "secondary",
          action: {
            type: "uri",
            label: "電話で予約",
            uri: "tel:03XXXXXXXX",
          },
        },
      ],
    },
  };
}

function infoRow(label, value) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: "#999999",
        flex: 2,
      },
      {
        type: "text",
        text: value,
        size: "sm",
        color: "#333333",
        flex: 4,
      },
    ],
  };
}

module.exports = {
  welcomeMessage,
  menuCarousel,
  reservationMessage,
};
