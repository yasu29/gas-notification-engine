/**
 * Messageクラス
 *
 * 通知1件を表すドメインオブジェクト
 *
 * 設計思想：
 * - 通知に必要な情報を1つにまとめる
 * - リトライ状態を保持する
 * - 次回実行時刻を計算できる
 */
class Message {

  /**
   * @param {string} channelType - 通知チャネル種別（例: LINE）
   * @param {string} to - 宛先
   * @param {string} body - メッセージ本文
   * @param {object} options - オプション（リトライ設定など）
   */
  constructor(channelType, to, body, options = {}) {
    this.channelType = channelType;
    this.to = to;
    this.body = body;

    // リトライ関連
    this.retryCount = options.retryCount ?? 0;
    this.maxRetry = options.maxRetry ?? Config.RETRY_DEFAULT_MAX;
    this.baseDelayMinutes = options.baseDelayMinutes ?? Config.RETRY_DEFAULT_BASE_DELAY;

    this.nextRunAt = options.nextRunAt ?? null;
    this.status = options.status ?? "PENDING";
  }

  /**
   * リトライ可能かどうか判定
   */
  canRetry() {
    return this.retryCount < this.maxRetry;
  }

  /**
   * 次回実行時刻を計算（指数バックオフ）
   */
  calculateNextRunTime() {
    const delay = this.baseDelayMinutes * Math.pow(2, this.retryCount);
    const next = new Date();
    next.setMinutes(next.getMinutes() + delay);
    return next;
  }

  /**
   * リトライ回数を増やし、次回実行時刻を更新
   */
  markForRetry() {
    this.retryCount += 1;
    this.nextRunAt = this.calculateNextRunTime();
  }

  /**
   * 永続化用オブジェクトに変換
   */
  toObject() {
    return {
      channelType: this.channelType,
      to: this.to,
      body: this.body,
      retryCount: this.retryCount,
      maxRetry: this.maxRetry,
      baseDelayMinutes: this.baseDelayMinutes,
      nextRunAt: this.nextRunAt
    };
  }

  markProcessing() {
    this.status = "PROCESSING";
  }

  markSuccess() {
    this.status = "SUCCESS";
  }

  markFailed() {
    this.status = "FAILED";
  }
}