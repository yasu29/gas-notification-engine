/**
 * =========================================================
 * Notification Gateway
 * =========================================================
 *
 * 通知基盤の公式エントリーポイント。
 *
 * 設計思想：
 * - アプリ層はこのファイルのみを利用する
 * - Retry / Factory / Repository 等の内部構造は隠蔽する
 * - 将来チャネルが増えてもアプリ側は変更不要
 *
 * 役割：
 * - NotificationService の生成
 * - Message の生成
 * - 通知送信の実行
 *
 * アプリ側は notifyText() だけを呼べばよい
 * =========================================================
 */


/**
 * NotificationService を生成する（内部専用関数）
 *
 * 責務：
 * - RetryRepository を初期化
 * - ChannelFactory を初期化
 * - NotificationService を組み立てる
 *
 * ※ アプリ層から直接呼ばせない
 *
 * @returns {NotificationService}
 */
function createNotificationService() {

  // -------------------------------------------------
  // ① リトライ管理用スプレッドシート取得
  // -------------------------------------------------
  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);

  // リトライ履歴を保存するシート取得
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  // -------------------------------------------------
  // ② RetryRepository 生成
  //    → 失敗時の再送制御を担当
  // -------------------------------------------------
  const repo = new RetryRepository(sheet);

  // -------------------------------------------------
  // ③ ChannelFactory 生成
  //    → LINE / Slack / Chat 等のチャネル生成を担当
  // -------------------------------------------------
  const factory = new ChannelFactory();

  // -------------------------------------------------
  // ④ NotificationService 生成
  //    → 実際の通知実行を担当する中核クラス
  // -------------------------------------------------
  return new NotificationService(factory, repo);
}


/**
 * テキスト通知を送信する（公開インターフェース）
 *
 * アプリ層が利用する唯一の通知関数。
 *
 * @param {string} channel - 通知チャネル種別
 *                           例: "LINE", "SLACK", "CHAT"
 *
 * @param {string} target  - 送信先ID
 *                           LINE: ユーザーID
 *                           Slack: チャンネルID
 *                           Chat: Webhook URL
 *
 * @param {string} text    - 通知本文（プレーンテキスト）
 *
 * 使用例：
 * notifyText("LINE", Config.LINE_USER_ID, "Hello");
 */
function notifyText(channel, target, text) {

  // -------------------------------------------------
  // ① NotificationService を取得
  // -------------------------------------------------
  const service = createNotificationService();

  // -------------------------------------------------
  // ② Message オブジェクト生成
  //    → チャネル・送信先・本文をカプセル化
  // -------------------------------------------------
  const message = new Message(channel, target, text);

  // -------------------------------------------------
  // ③ 通知送信実行
  //    → 内部でチャネル解決・送信・リトライ処理が行われる
  // -------------------------------------------------
  service.send(message);
}