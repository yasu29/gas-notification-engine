/**
 * SlackChannel
 *
 * 設計思想：
 * - Channelの具体実装
 * - 今回はダミー（実際のAPIは叩かない）
 */
class SlackChannel extends Channel {

  send(message) {

    // 実際のSlack API呼び出しはしない
    LoggerService.info("Slack send simulated", {
      to: message.to,
      body: message.body
    });

  }
}