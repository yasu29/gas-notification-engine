/**
 * starterExample.gs
 *
 * 通知エンジンの利用サンプル集。
 *
 * - starterExample()                → 解説付きサンプル
 * - jobSampleLineNotification()     → LINE最小実行例
 * - jobSampleGoogleChatNotification() → Google Chat最小実行例
 *
 * 実務では必要な関数のみトリガー登録してください。
 */


/**
 * ==========================================
 * 1. 解説付きサンプル（学習用）
 * ==========================================
 *
 * エンジンの基本的な流れを確認するための関数です。
 */
function starterExample() {

  // 再送管理用スプレッドシートを開く
  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);

  // retryシートを取得（失敗時にここへ保存される）
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  // 再送管理クラス生成
  const repo = new RetryRepository(sheet);

  // 通知手段選択用ファクトリ生成
  const factory = new ChannelFactory();

  // 通知制御サービス生成
  const service = new NotificationService(factory, repo);

  // 送信内容作成
  const message = new Message(
    "LINE",
    "あなたのLINEユーザーID",
    "通知エンジン動作確認（解説付きサンプル）"
  );

  // 通知実行
  service.send(message);
}


/**
 * ==========================================
 * 2. LINE 最小実行例（実務用）
 * ==========================================
 *
 * LINE通知だけを行う最小構成。
 * トリガー登録用にそのまま使用可能。
 */
function jobSampleLineNotification() {

  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  const repo = new RetryRepository(sheet);
  const factory = new ChannelFactory();
  const service = new NotificationService(factory, repo);

  const message = new Message(
    "LINE",
    "あなたのLINEユーザーID",
    "LINE通知サンプル"
  );

  service.send(message);
}


/**
 * ==========================================
 * 3. Google Chat 最小実行例
 * ==========================================
 *
 * ※ Google Workspace環境が必要
 * ※ ScriptPropertiesに GOOGLE_CHAT_WEBHOOK を登録してください
 */
function jobSampleGoogleChatNotification() {

  const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);
  const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

  const repo = new RetryRepository(sheet);
  const factory = new ChannelFactory();
  const service = new NotificationService(factory, repo);

  const message = new Message(
    "GOOGLE_CHAT",
    "unused",  // Webhook型のため宛先は使用しない
    "Google Chat通知サンプル"
  );

  service.send(message);
}