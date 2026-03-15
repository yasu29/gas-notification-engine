/**
 * =========================================================
 * Starter Example
 * =========================================================
 *
 * Notification Gateway の使用例。
 *
 * 設計方針：
 * - 環境依存値はすべて Config 経由で取得する
 * - 通知基盤内部には直接触れない
 * - notifyText() を通じて送信する
 *
 * 必要な ScriptProperties：
 * - LINE_USER_ID
 * - GOOGLE_CHAT_WEBHOOK
 * =========================================================
 */

function jobSampleNotification() {

  // --------------------------------------------
  // ① 通知本文
  // --------------------------------------------
  const message = "Notification sample";

  // --------------------------------------------
  // ② LINE通知
  // --------------------------------------------
  // LINE_USER_ID は ScriptProperty から取得
  notifyText("LINE", Config.LINE_USER_ID, message);

  // --------------------------------------------
  // ③ Google Chat通知
  // --------------------------------------------
  // GOOGLE_CHAT_WEBHOOK も ScriptProperty から取得
  notifyText("GOOGLE_CHAT", Config.GOOGLE_CHAT_WEBHOOK, message);

  Logger.log("Starter notification executed.");
}