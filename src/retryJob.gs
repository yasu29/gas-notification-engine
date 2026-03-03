/**
 * retryPending
 *
 * 目的：
 * - 再送対象（PENDING & 実行時刻到来）を取得
 * - 1件ずつ再送処理を実行
 * - 二重実行を防止する
 *
 * 想定：
 * - 時間トリガー（例：5分毎）で実行
 */
function retryPending() {

  // 🔐 スクリプト全体で共有されるロックを取得
  const lock = LockService.getScriptLock();

  try {

    /**
     * 🔐 ロック取得を試みる
     *
     * 30000 = 最大30秒待つ
     *
     * もし他のretryPendingが実行中なら：
     * → ここで待機
     * → 取得できなければ例外発生
     */
    lock.waitLock(30000);

    LoggerService.info("Retry process started");

    /**
     * 🔹 スプレッドシートを明示的に指定して取得
     *
     * getActive() は実行環境に依存するため使用しない
     */
    const spreadsheet = SpreadsheetApp.openById(Config.RETRY_SHEET_ID);

    /**
     * 🔹 リトライ管理シート取得
     */
    const sheet = spreadsheet.getSheetByName(Config.RETRY_SHEET_NAME);

    const repo = new RetryRepository(sheet);
    const factory = new ChannelFactory();
    const service = new NotificationService(factory, repo);

    /**
     * 🔹 再送対象取得
     * 条件：
     * - status = PENDING
     * - nextRunAt <= now
     */
    const targets = repo.findPendingReady();

    targets.forEach(entry => {

      service.send(entry.message, entry.id);

    });

    LoggerService.info("Retry process completed");

  } catch (e) {

    /**
     * 🔹 ロック取得失敗時
     *
     * 他のretryPendingが動いている可能性
     * → 今回はスキップ
     */
    LoggerService.warn("Retry skipped (lock not acquired)", {
      error: e.message
    });

  } finally {

    /**
     * 🔓 必ずロック解放
     *
     * try内で例外が出ても実行される
     */
    lock.releaseLock();
  }
}