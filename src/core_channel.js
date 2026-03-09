/**
 * Channel基底クラス
 *
 * 設計思想：
 * - すべての通知チャネルは send(message) を持つ
 * - 呼び出し側は具体実装を知らなくてよい
 * - 「送信」という抽象的な概念のみを公開する
 */
class Channel {

  /**
   * 通知送信メソッド（抽象メソッド扱い）
   *
   * サブクラス（LineChannelなど）は
   * このメソッドを必ず実装すること。
   *
   * @param {Message} message
   */
  send(message) {
    throw new Error("send() must be implemented by subclass");
  }
}