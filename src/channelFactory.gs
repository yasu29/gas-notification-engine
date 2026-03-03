/**
 * ChannelFactory
 *
 * 設計思想：
 * - 通知チャネル生成の責務を持つ
 * - NotificationService は具体実装を知らない
 * - チャネルの追加は「対応表」に1行追加するだけ
 *
 * Linux的に言えば：
 * - 文字列キー → 実装クラス の対応表
 * - 外部定義のリストを読み込む構造と同じ思想
 */
class ChannelFactory {

  constructor() {

    /**
     * チャネル対応表
     *
     * key   : チャネル種別（文字列）
     * value : そのチャネルのクラス（設計図）
     *
     * ここに追加すれば拡張可能。
     * if文は増えない。
     */
    this.channels = {
      LINE: LineChannel,
      GOOGLE_CHAT: GoogleChatChannel,
      SLACK: SlackChannel
      // 例:
      // CHATWORK: ChatworkChannel
    };
  }

  /**
   * 指定されたチャネル種別からインスタンスを生成
   *
   * @param {string} type - チャネル種別（例: "LINE"）
   * @returns {Channel} 生成されたチャネルインスタンス
   */
  create(type) {

    // 対応表からクラスを取得
    const ChannelClass = this.channels[type];

    // 未対応チャネルの場合はエラー
    if (!ChannelClass) {
      throw new Error("Unsupported channel: " + type);
    }

    // クラス（設計図）からインスタンス生成
    return new ChannelClass();
  }
}