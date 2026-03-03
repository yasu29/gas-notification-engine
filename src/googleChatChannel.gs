/**
 * GoogleChatChannel
 *
 * 役割：
 * - Channel 抽象クラスを継承した具体実装
 * - Google Chat Incoming Webhook を利用して通知を送信する
 *
 * 設計ポイント：
 * - Message は変更しない
 * - Webhook URL は ScriptProperties から取得
 * - NotificationService には依存しない
 */

class GoogleChatChannel extends Channel {

  /**
   * Google Chat へメッセージ送信
   *
   * @param {Message} message
   */
  send(message) {

    // ==============================
    // ① Webhook URL 取得
    // ==============================
    // ScriptProperties に登録した
    // GOOGLE_CHAT_WEBHOOK を取得する
    const webhookUrl = Config.GOOGLE_CHAT_WEBHOOK;

    if (!webhookUrl) {
      throw new Error("GOOGLE_CHAT_WEBHOOK is not configured");
    }


    // ==============================
    // ② Google Chat 送信用 JSON 作成
    // ==============================
    // Incoming Webhook は
    // { text: "message" } 形式を受け取る
    const payload = {
      text: message.body
    };


    // ==============================
    // ③ HTTPリクエスト設定
    // ==============================
    const options = {
      method: "post",                 // POSTで送信
      contentType: "application/json",// JSON形式
      payload: JSON.stringify(payload), // JSON文字列化
      muteHttpExceptions: true        // エラー時も例外を投げずレスポンス取得
    };


    // ==============================
    // ④ Webhook URL にHTTPリクエスト送信
    // ==============================
    // ここで実際に Google Chat サーバーへ
    // POST リクエストを送信する
    const response = UrlFetchApp.fetch(webhookUrl, options);


    // ==============================
    // ⑤ ステータスコード確認
    // ==============================
    const status = response.getResponseCode();

    if (status !== 200) {
      // 200以外は送信失敗とみなす
      throw new Error("Google Chat send failed. status=" + status);
    }


    // ==============================
    // ⑥ 成功ログ出力
    // ==============================
    LoggerService.info("Google Chat message sent", {
      status: status
    });
  }
}