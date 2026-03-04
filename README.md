---

# gas-notification-engine

Google Apps Script (GAS) による通知エンジン。

業務ロジックと分離された通知基盤として設計されており、
現在は **LINE通知に正式対応** しています。
Google Chat（Incoming Webhook）にも対応していますが、Google Workspace 環境が必要です。

将来的な Slack などへの拡張を想定した構造になっています。

---

## Overview

`gas-notification-engine` は、業務処理と通知処理を分離するための通知基盤テンプレートです。

業務側は `NotificationService.send()` を呼び出すだけで通知可能です。

---

## Features

* LINE通知実装済み
* Google Chat Webhook対応
* チャネル抽象化（他チャネル追加可能）
* リトライ制御（指数バックオフ）
* 状態管理（PENDING / PROCESSING / FAILED）
* 永続化分離（RetryRepository）
* 排他制御（LockService）
* 依存性分離（DI設計）

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
LineChannel / GoogleChatChannel
```

---

### Channel Abstraction（具体例）

通知処理は `Channel` 抽象クラスを通して実行されます。

#### 抽象定義（channel.gs）

```javascript
class Channel {
  send(message) {
    throw new Error("send() must be implemented by subclass");
  }
}
```

#### LINE実装（lineChannel.gs）

```javascript
class LineChannel extends Channel {
  send(message) {
    // LINE Messaging API 呼び出し処理
  }
}
```

#### Factory登録（channelFactory.gs）

```javascript
const CHANNEL_MAP = {
  LINE: LineChannel,
  GOOGLE_CHAT: GoogleChatChannel
};
```

新しい通知手段を追加する場合：

1. Channel を継承したクラスを作成
2. ChannelFactory に登録

するだけで拡張できます。
`NotificationService` の変更は不要です。

---

### Retry Flow

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

### State Management

| Status     | Description |
| ---------- | ----------- |
| PENDING    | 再送待ち        |
| PROCESSING | 実行中         |
| FAILED     | リトライ上限到達    |

---

## Project Structure

```
/src
  config.gs
  logger.gs
  message.gs
  channel.gs
  lineChannel.gs
  googleChatChannel.gs
  channelFactory.gs
  notificationService.gs
  retryRepository.gs
  retryJob.gs
  starterExample.gs
```

---

### File Responsibilities

| File                   | Responsibility           |
| ---------------------- | ------------------------ |
| config.gs              | ScriptProperties から設定値取得 |
| logger.gs              | ログ出力管理                   |
| message.gs             | 通知1件の状態管理とリトライ制御         |
| channel.gs             | 通知チャネルの抽象定義              |
| lineChannel.gs         | LINE Messaging API 送信実装  |
| googleChatChannel.gs   | Google Chat Webhook送信実装  |
| channelFactory.gs      | チャネル生成処理                 |
| notificationService.gs | 通知制御の司令塔                 |
| retryRepository.gs     | 再送対象の永続化管理               |
| retryJob.gs            | 再送トリガー処理                 |
| starterExample.gs      | 利用サンプル（必須構成ではない）         |

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

#### 必須

* `LINE_TOKEN`
* `RETRY_SHEET_ID`

#### Google Chat を利用する場合

* `GOOGLE_CHAT_WEBHOOK`
  ※ Google Workspace 環境が必要

---

### 任意設定（未設定時はデフォルト値使用）

* `LOG_LEVEL`（DEBUG / INFO / WARN / ERROR）
  デフォルト: INFO

* `RETRY_DEFAULT_MAX`（最大リトライ回数）
  デフォルト: 3

* `RETRY_DEFAULT_BASE_DELAY`（基本遅延時間 分）
  デフォルト: 5

例：

```
LOG_LEVEL=DEBUG
RETRY_DEFAULT_MAX=5
RETRY_DEFAULT_BASE_DELAY=10
```

※ 認証情報はコードに直接記載しません。

---

### 2. 初回通知（サンプル）

`starterExample.gs` は利用方法を示すためのサンプルコードです。
本エンジンの必須構成要素ではありません。

実務では業務処理から `NotificationService.send()` を呼び出します。

---

### 3. Trigger

* 業務通知 → 任意の業務関数を登録
* `retryPending()` → 5分毎などで時間トリガー登録

---

## Supported Channel

| Channel     | Status               |
| ----------- | -------------------- |
| LINE        | ✅ Implemented        |
| Google Chat | ⚠ Workspace Required |
| Slack       | ⬜ Planned            |

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

`LockService` により同時実行を防止します。

---

## Future Extension

* SlackChannel 実装
* Logger 抽象化
* FAILED アーカイブ処理

---

## License

MIT

---
