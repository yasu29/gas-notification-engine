/**
 * NotificationService
 *
 * 設計思想：
 * - 通知処理の司令塔（オーケストレーター）
 * - 状態遷移を一元管理する
 * - Channel実装やRepository実装の詳細は知らない
 *
 * 役割：
 * 1. Channel生成
 * 2. 送信実行
 * 3. 成功/失敗の判定
 * 4. 状態遷移管理
 * 5. 永続化指示
 */
class NotificationService {

  /**
   * @param {ChannelFactory} channelFactory
   * @param {RetryRepository} retryRepository
   */
  constructor(channelFactory, retryRepository) {
    this.channelFactory = channelFactory;
    this.retryRepository = retryRepository;
  }

  /**
   * 通知送信処理
   *
   * @param {Message} message
   * @param {string|null} id
   *        再送時のみ既存レコードのIDが入る
   */
  send(message, id = null) {

    try {

      /**
       * 🔹 再送時のみ PROCESSING に更新
       *
       * 新規送信時は id が null なのでスキップされる
       */
      if (id && this.retryRepository) {
        message.markProcessing();
        this.retryRepository.updateStatus(id, "PROCESSING");
      }

      /**
       * 🔹 Channel生成
       */
      const channel = this.channelFactory.create(message.channelType);

      /**
       * 🔹 実際の送信
       */
      channel.send(message);

      /**
       * 🔹 成功時
       */
      message.markSuccess();

      LoggerService.info("Notification success", message.toObject());

      /**
       * 🔹 再送成功時はレコード削除
       * （SUCCESSとして残す設計も可能）
       */
      if (id && this.retryRepository) {
        this.retryRepository.deleteById(id);
      }

    } catch (error) {

      /**
       * 🔹 送信失敗
       */
      LoggerService.error("Notification failed", {
        error: error.message,
        message: message.toObject()
      });

      /**
       * 🔹 リトライ可能なら再保存
       */
      if (message.canRetry()) {

        message.markForRetry();

        if (this.retryRepository) {

          // 再送の場合は古い行削除
          if (id) {
            this.retryRepository.deleteById(id);
          }

          this.retryRepository.save(message);
        }

      } else {

        /**
         * 🔹 上限到達
         */
        message.markFailed();

        if (id && this.retryRepository) {
          this.retryRepository.updateStatus(id, "FAILED");
        }
      }
    }
  }
}