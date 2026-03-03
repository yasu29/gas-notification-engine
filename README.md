# gas-notification-engine

Google Apps Script (GAS) による通知エンジン。

業務ロジックと分離された通知基盤として設計されており、
現在は **LINE通知に対応** しています。

将来的な Slack / Google Chat などへの拡張を想定した構造になっています。

---

## Overview

`gas-notification-engine` は以下を特徴とします。

* LINE通知実装済み
* チャネル抽象化（他チャネル追加可能）
* リトライ制御（指数バックオフ）
* 状態管理（PENDING / PROCESSING / FAILED）
* 永続化分離（RetryRepository）
* 排他制御（LockService）
* 依存性分離（DI設計）

業務処理からは `NotificationService.send()` を呼び出すだけで利用できます。

---

## Supported Channel

| Channel     | Status        |
| ----------- | ------------- |
| LINE        | ✅ Implemented |
| Slack       | ⬜ Planned     |
| Google Chat | ⬜ Planned     |

---

## Project Structure

```
/src
  config.gs
  logger.gs
  message.gs
  channel.gs
  lineChannel.gs
  channelFactory.gs
  notificationService.gs
  retryRepository.gs
  retryJob.gs
  businessSample.gs
```

---

## File Responsibilities

| File                   | Responsibility              |
| ---------------------- | --------------------------- |
| config.gs              | ScriptProperties から設定値を取得   |
| logger.gs              | ログ出力管理（INFO / WARN / ERROR） |
| message.gs             | 通知1件の状態管理とリトライ制御            |
| channel.gs             | 通知チャネルの抽象定義                 |
| lineChannel.gs         | LINE Messaging API 送信実装     |
| channelFactory.gs      | チャネル生成処理                    |
| notificationService.gs | 通知制御の司令塔                    |
| retryRepository.gs     | 再送対象の永続化管理                  |
| retryJob.gs            | 再送トリガー処理                    |
| businessSample.gs      | 利用サンプル                      |

---

## Architecture

```
Business Job
    ↓
NotificationService
    ↓
ChannelFactory
    ↓
Channel (abstract)
    ↓
LineChannel (implementation)
```

---

## Channel Abstraction（具体例）

通知処理は「Channel」という抽象クラスを通して実行されます。

現在は `LineChannel` が実装されています。

### 1. 抽象定義（channel.gs）

```javascript
class Channel {
  send(message) {
    throw new Error("send() must be implemented by subclass");
  }
}
```

### 2. LINE実装（lineChannel.gs）

```javascript
class LineChannel extends Channel {
  send(message) {
    // LINE Messaging API 呼び出し処理
  }
}
```

### 3. Factory登録（channelFactory.gs）

```javascript
const CHANNEL_MAP = {
  LINE: LineChannel
};
```

この構造により、新しい通知手段を追加する場合は：

1. Channel を継承したクラスを作成
2. ChannelFactory に登録

するだけで拡張できます。

既存の `NotificationService` は変更不要です。

---

## Retry Flow

```
send() 失敗
    ↓
markForRetry()
    ↓
RetryRepository.save()
    ↓
（Time Trigger）
    ↓
retryPending()
    ↓
再送
```

---

## State Management

| Status     | Description |
| ---------- | ----------- |
| PENDING    | 再送待ち        |
| PROCESSING | 実行中         |
| FAILED     | リトライ上限到達    |

---

## Spreadsheet Structure

Sheet name: `retry`

| Column           | Description       |
| ---------------- | ----------------- |
| id               | UUID              |
| channelType      | 通知チャネル種別（例: LINE） |
| to               | 宛先                |
| body             | メッセージ本文           |
| retryCount       | 現在のリトライ回数         |
| maxRetry         | 最大リトライ回数          |
| baseDelayMinutes | 基本遅延時間            |
| nextRunAt        | 次回実行時刻            |
| status           | 現在の状態             |

---

## Setup

### 1. Script Properties

Apps Script → プロジェクト設定 → Script Properties に登録：

* `LINE_TOKEN`

※ 認証情報はコードに直接記載しません。

---

### 2. Trigger

* 業務通知 → 任意の業務関数を登録
* retryPending → 5分毎などで登録

---

## Design Philosophy

### Responsibility Separation

* NotificationService → 制御
* Channel → 送信
* Repository → 永続化
* Message → 状態管理

---

### Retry Strategy

指数バックオフを採用：

```
delay = baseDelayMinutes * 2^retryCount
```

---

### Concurrency Control

`LockService` により同時実行を防止。

---

## Future Extension

* SlackChannel 実装
* Google Chat 対応
* Logger 抽象化
* FAILED アーカイブ処理

---

## License

MIT

```
```
