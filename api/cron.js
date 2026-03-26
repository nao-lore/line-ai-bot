/**
 * Cron Job: ステップ配信 & リマインド配信
 *
 * Vercel Cron Jobsで毎日9:00 JSTに実行される。
 * 1. 友だち登録日からの経過日数に応じてステップメッセージを配信
 * 2. 予約関心タグを持つユーザーにリマインドメッセージを配信
 *
 * エンドポイント: GET /api/cron
 * 認証: CRON_SECRET ヘッダーで保護（Vercelが自動付与）
 */

const { pushMessage } = require("../lib/line");
const { getAllUsers } = require("../lib/user-store");
const { STEP_SCHEDULE, reservationReminderMessage } = require("../lib/step-messages");

module.exports = async function handler(req, res) {
  // Vercel Cron Jobsからの呼び出しを検証（CRON_SECRET ヘッダーで保護）
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const results = {
    stepDeliveries: [],
    reminders: [],
    errors: [],
  };

  try {
    const users = getAllUsers();
    const now = new Date();

    // ----- ステップ配信 -----
    for (const user of users) {
      const daysSinceRegistration = Math.floor(
        (now - user.registeredAt) / (1000 * 60 * 60 * 24)
      );

      for (const step of STEP_SCHEDULE) {
        if (daysSinceRegistration === step.day) {
          try {
            await pushMessage(user.userId, [step.getMessage()]);
            results.stepDeliveries.push({
              userId: user.userId,
              day: step.day,
              description: step.description,
            });
            console.log(
              `Step delivery: Day ${step.day} "${step.description}" -> ${user.userId}`
            );
          } catch (err) {
            console.error(`Step delivery failed: ${user.userId}`, err.message);
            results.errors.push({
              type: "step",
              userId: user.userId,
              day: step.day,
              error: err.message,
            });
          }
        }
      }
    }

    // ----- リマインド配信 -----
    // 予約関心タグを持ち、予約問い合わせから1日経過したユーザー
    for (const user of users) {
      if (!user.tags.has("reservation_interest")) continue;
      if (!user.reservationData) continue;

      const daysSinceReservation = Math.floor(
        (now - user.reservationData.requestedAt) / (1000 * 60 * 60 * 24)
      );

      // 問い合わせ翌日にリマインド送信
      if (daysSinceReservation === 1) {
        try {
          await pushMessage(user.userId, [reservationReminderMessage()]);
          results.reminders.push({ userId: user.userId });
          console.log(`Reservation reminder -> ${user.userId}`);
        } catch (err) {
          console.error(`Reminder failed: ${user.userId}`, err.message);
          results.errors.push({
            type: "reminder",
            userId: user.userId,
            error: err.message,
          });
        }
      }
    }

    return res.status(200).json({
      status: "ok",
      timestamp: now.toISOString(),
      summary: {
        stepDeliveries: results.stepDeliveries.length,
        reminders: results.reminders.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
