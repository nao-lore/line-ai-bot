/**
 * ユーザーストア
 *
 * タグ管理・ユーザーデータ管理を行う。
 * 現在はインメモリ（Map）で保持。DB接続に差し替え可能な設計。
 */

// --- ユーザーデータの型イメージ ---
// {
//   userId: string,
//   displayName: string,
//   registeredAt: Date,
//   tags: Set<string>,
//   lastMessageAt: Date,
//   reservationData: { partySize, requestedAt } | null,
// }

const store = new Map();

// ---------------------------------------------------------------------------
// 基本操作
// ---------------------------------------------------------------------------

/**
 * ユーザーを登録する（友だち追加時）
 */
function registerUser(userId, displayName = "") {
  if (store.has(userId)) {
    return store.get(userId);
  }
  const user = {
    userId,
    displayName,
    registeredAt: new Date(),
    tags: new Set(),
    lastMessageAt: null,
    reservationData: null,
  };
  store.set(userId, user);
  return user;
}

/**
 * ユーザーデータを取得する
 */
function getUser(userId) {
  return store.get(userId) || null;
}

/**
 * ユーザーが存在しなければ簡易登録する（メッセージ受信時用）
 */
function ensureUser(userId) {
  if (!store.has(userId)) {
    registerUser(userId);
  }
  return store.get(userId);
}

/**
 * 全ユーザーを取得する
 */
function getAllUsers() {
  return Array.from(store.values());
}

// ---------------------------------------------------------------------------
// タグ操作
// ---------------------------------------------------------------------------

/**
 * ユーザーにタグを付与する
 */
function addTag(userId, tag) {
  const user = ensureUser(userId);
  user.tags.add(tag);
}

/**
 * ユーザーからタグを削除する
 */
function removeTag(userId, tag) {
  const user = getUser(userId);
  if (user) {
    user.tags.delete(tag);
  }
}

/**
 * ユーザーが特定のタグを持っているか
 */
function hasTag(userId, tag) {
  const user = getUser(userId);
  return user ? user.tags.has(tag) : false;
}

/**
 * 特定のタグを持つユーザーを全て取得する（セグメント配信用）
 */
function getUsersByTag(tag) {
  return getAllUsers().filter((u) => u.tags.has(tag));
}

// ---------------------------------------------------------------------------
// メッセージ内容からの自動タグ付与
// ---------------------------------------------------------------------------

/** タグ付与ルール: キーワード → タグ名 */
const AUTO_TAG_RULES = [
  { keyword: "メニュー", tag: "menu_viewed" },
  { keyword: "menu", tag: "menu_viewed" },
  { keyword: "予約", tag: "reservation_interest" },
  { keyword: "reserve", tag: "reservation_interest" },
  { keyword: "アレルギー", tag: "allergy_concern" },
  { keyword: "クーポン", tag: "coupon_interest" },
  { keyword: "coupon", tag: "coupon_interest" },
];

/**
 * メッセージ内容に応じてタグを自動付与する
 * @returns {string[]} 今回付与されたタグの配列
 */
function autoTag(userId, messageText) {
  const user = ensureUser(userId);
  user.lastMessageAt = new Date();

  const added = [];
  for (const rule of AUTO_TAG_RULES) {
    if (messageText.includes(rule.keyword) && !user.tags.has(rule.tag)) {
      user.tags.add(rule.tag);
      added.push(rule.tag);
    }
  }
  return added;
}

// ---------------------------------------------------------------------------
// 予約データ
// ---------------------------------------------------------------------------

/**
 * 予約情報を記録する
 */
function setReservation(userId, partySize) {
  const user = ensureUser(userId);
  user.reservationData = {
    partySize,
    requestedAt: new Date(),
  };
  // 予約関連タグも付与
  user.tags.add("reservation_interest");
}

// ---------------------------------------------------------------------------
// ユーティリティ（デバッグ / 管理API用）
// ---------------------------------------------------------------------------

/**
 * ユーザーデータをJSON-serializable形式に変換する
 */
function serializeUser(user) {
  return {
    userId: user.userId,
    displayName: user.displayName,
    registeredAt: user.registeredAt.toISOString(),
    tags: Array.from(user.tags),
    lastMessageAt: user.lastMessageAt ? user.lastMessageAt.toISOString() : null,
    reservationData: user.reservationData
      ? {
          partySize: user.reservationData.partySize,
          requestedAt: user.reservationData.requestedAt.toISOString(),
        }
      : null,
  };
}

/**
 * ストアの統計情報
 */
function getStats() {
  const users = getAllUsers();
  const tagCounts = {};
  for (const user of users) {
    for (const tag of user.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  return {
    totalUsers: users.length,
    tagCounts,
  };
}

module.exports = {
  registerUser,
  getUser,
  ensureUser,
  getAllUsers,
  addTag,
  removeTag,
  hasTag,
  getUsersByTag,
  autoTag,
  setReservation,
  serializeUser,
  getStats,
};
