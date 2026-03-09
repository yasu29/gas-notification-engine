# gas-notification-engine

Google Apps Script (GAS) による拡張可能な通知基盤エンジン。

業務ロジックと完全に分離された通知基盤として設計されています。

現在対応チャネル：

- LINE Messaging API
- Google Chat（Incoming Webhook）
- Slack（将来拡張予定）

本リポジトリは通知エンジンのみを提供します。

***

## Overview

gas-notification-engine は以下を特徴とします。

- チャネル抽象化設計
- NotificationGateway による単一エントリポイント
- リトライ制御（指数バックオフ）
- 状態管理（PENDING / PROCESSING / FAILED）
- 永続化分離（RetryRepository）
- 排他制御（LockService）
- ScriptProperties による環境依存値管理

業務処理側からは notifyText() を呼び出すだけで利用可能です。

***

## Supported Channel

| Channel      | Status |
|--------------|--------|
| LINE         | Implemented |
| Google Chat  | Implemented |
| Slack        | Planned |

***

## Project Structure

```

/src
core_config.js
core_logger.js
core_message.js
core_channel.js
core_lineChannel.js
core_googleChatChannel.js
core_channelFactory.js
core_notificationGateway.js
core_notificationService.js
core_retryRepository.js
core_retryJob.gs
starterExample.js

```

***

## File Responsibilities

| File                         | Responsibility |
|------------------------------|---------------|
| core_config.js              | ScriptProperties取得 |
| core_logger.js              | ログ管理 |
| core_message.js             | 通知モデル・状態管理 |
| core_channel.js             | 通知チャネル抽象 |
| core_lineChannel.js         | LINE送信実装 |
| core_googleChatChannel.js   | Google Chat送信実装 |
| core_channelFactory.js      | チャネル生成 |
| core_notificationGateway.js | 外部公開API |
| core_notificationService.js | 通知制御 |
| core_retryRepository.js     | 再送永続化 |
| core_retryJob.gs            | 再送実行 |
| starterExample.js           | 利用サンプル |

***

## Architecture

```

Business Job
↓
NotificationGateway (notifyText)
↓
NotificationService
↓
ChannelFactory
↓
Channel (abstract)
↓
ConcreteChannel (LINE / GoogleChat)

````

***

## Gateway Usage

外部からは notifyText() のみ使用します。

```javascript
notifyText("LINE", Config.LINE_USER_ID, "Hello");
````

通知基盤内部には直接触れません。

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
| FAILED     | 上限到達        |

---

## Spreadsheet Structure

Sheet name: retry

| Column           | Description |
| ---------------- | ----------- |
| id               | UUID        |
| channelType      | 通知種別        |
| to               | 宛先          |
| body             | 本文          |
| retryCount       | 現在回数        |
| maxRetry         | 最大回数        |
| baseDelayMinutes | 基本遅延        |
| nextRunAt        | 次回実行        |
| status           | 状態          |

---

## Setup

### Script Properties

Apps Script → プロジェクト設定 → Script Properties に登録：

必須：

* LINE_TOKEN
* LINE_USER_ID
* GOOGLE_CHAT_WEBHOOK
* RETRY_SHEET_ID

任意：

* LOG_LEVEL（DEBUG / INFO / WARN / ERROR）
* RETRY_DEFAULT_MAX（既定3）
* RETRY_DEFAULT_BASE_DELAY（既定5分）

例：

```
LOG_LEVEL=DEBUG
RETRY_DEFAULT_MAX=5
RETRY_DEFAULT_BASE_DELAY=10
```

認証情報はコードに直接記載しません。

---

## Trigger

| Function     | Purpose    |
| ------------ | ---------- |
| 業務関数         | 通常通知       |
| retryPending | 再送処理（定期実行） |

---

## Retry Strategy

指数バックオフ：

```
delay = baseDelayMinutes * 2^retryCount
```

---

## Concurrency Control

LockService により同時実行を防止。

---

## Design Philosophy

### Responsibility Separation

| Layer      | Responsibility |
| ---------- | -------------- |
| Gateway    | 外部公開API        |
| Service    | 制御             |
| Channel    | 送信             |
| Repository | 永続化            |
| Message    | 状態管理           |

通知基盤は業務ロジックを持ちません。

---

## Future Extension

* SlackChannel 実装
* Logger抽象化
* FAILED管理拡張

---

## License

MIT
