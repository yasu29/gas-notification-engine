/**
 * businessSample.gs
 *
 * 通知エンジンの最小利用サンプル。
 * 実務ロジックは含めない。
 *
 * 想定：
 * - 手動実行
 * - トリガー登録
 */


/**
 * LINE通知サンプル
 */
function jobSampleLineNotification() {

  // ScriptPropertiesで指定されたスプレッドシートを開く
  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  const repo = new RetryRepository(sheet);
  const factory = new ChannelFactory();
  const service = new NotificationService(factory, repo);

  const message = new Message(
    "LINE",
    "Uxxxxxxxxxxxxxxxx", // 自分のユーザーID
    "LINE通知テスト"
  );

  service.send(message);
}

/**
 * Google Chat通知サンプル
 *
 * ※ Google Workspace 環境でのみ動作
 */
function jobSampleGoogleChatNotification() {

  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  const repo = new RetryRepository(sheet);
  const factory = new ChannelFactory();
  const service = new NotificationService(factory, repo);

  const message = new Message(
    "GOOGLE_CHAT",
    null, // Webhook方式では宛先不要
    "Google Chat通知テスト"
  );

  service.send(message);
}