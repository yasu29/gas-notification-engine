/**
 * LineChannel
 *
 * Channelの具体実装。
 * LINE Messaging API を利用してメッセージを送信する。
 *
 * 設計思想：
 * - LINE固有のHTTP仕様はここに閉じ込める
 * - 呼び出し側はLINE APIの詳細を知らなくてよい
 */
class LineChannel extends Channel {

  /**
   * LINEへ通知を送信
   *
   * @param {Message} message
   */
  send(message) {

    // --------------------------------------------
    // メッセージタイプ判定
    // --------------------------------------------
    let messages;

    if (message.meta && message.meta.type === "image") {

      // 画像メッセージ
      messages = [{
        type: "image",
        originalContentUrl: message.body,
        previewImageUrl: message.body
      }];

    } else {

      // デフォルトはテキストメッセージ
      messages = [{
        type: "text",
        text: message.body
      }];
    }

    // LINE API用のペイロード作成
    const payload = {
      to: message.to,
      messages: messages
    };

    // HTTPオプション設定
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        // ScriptPropertiesから取得したトークンを使用
        "Authorization": "Bearer " + Config.LINE_TOKEN
      },
      payload: JSON.stringify(payload),

      // エラー時も例外を即スローせず、
      // ステータスコードを確認できるようにする
      muteHttpExceptions: true
    };

    // LINE APIへリクエスト送信
    const response = UrlFetchApp.fetch(
      "https://api.line.me/v2/bot/message/push",
      options
    );

    const statusCode = response.getResponseCode();

    // 400以上は失敗とみなす
    if (statusCode >= 400) {
      throw new Error("LINE send failed. status=" + statusCode);
    }

    // 成功ログ
    LoggerService.info("LINE message sent", {
      to: message.to
    });
  }
}