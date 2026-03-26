/**
 * セグメント配信API
 *
 * タグベースでユーザーをフィルタし、対象者のみにプッシュメッセージを配信する。
 *
 * GET  /api/broadcast — ユーザー一覧 + タグ表示 + 統計
 * POST /api/broadcast — タグ指定でセグメント配信を実行
 *
 * POST Body:
 * {
 *   "tag": "allergy_concern",
 *   "message": "グルテンフリーメニューが増えました!"
 * }
 *
 * 使い方（CLIから）:
 *   curl https://your-app.vercel.app/api/broadcast
 *   curl -X POST https://your-app.vercel.app/api/broadcast \
 *     -H "Content-Type: application/json" \
 *     -d '{"tag":"allergy_concern","message":"新しいグルテンフリーメニューが登場!"}'
 */

const { pushMessage } = require("../lib/line");
const { getAllUsers, getUsersByTag, serializeUser, getStats } = require("../lib/user-store");

module.exports = async function handler(req, res) {
  // ----- GET: ユーザー一覧 + 統計 -----
  if (req.method === "GET") {
    const users = getAllUsers().map(serializeUser);
    const stats = getStats();

    return res.status(200).json({
      status: "ok",
      stats,
      users,
    });
  }

  // ----- POST: セグメント配信 -----
  if (req.method === "POST") {
    const { tag, message } = req.body || {};

    if (!tag || !message) {
      return res.status(400).json({
        error: "tag と message は必須です",
        example: {
          tag: "allergy_concern",
          message: "グルテンフリーメニューが増えました!",
        },
      });
    }

    const targetUsers = getUsersByTag(tag);

    if (targetUsers.length === 0) {
      return res.status(200).json({
        status: "ok",
        delivered: 0,
        message: `タグ "${tag}" を持つユーザーはいません`,
      });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const user of targetUsers) {
      try {
        await pushMessage(user.userId, { type: "text", text: message });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ userId: user.userId, error: err.message });
        console.error(`Broadcast failed: ${user.userId}`, err.message);
      }
    }

    return res.status(200).json({
      status: "ok",
      tag,
      targetCount: targetUsers.length,
      delivered: results.success,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
