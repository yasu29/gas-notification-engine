/**
 * RetryRepository
 *
 * 設計思想：
 * - リトライ対象メッセージの永続化を担当
 * - スプレッドシートをデータストアとして扱う
 * - NotificationService からは「保存・取得・更新」だけが見える
 * - 状態(status)を持つことで安全な再送制御を行う
 *
 * シート構造（1行目はヘッダ）：
 * | id | channelType | to | body | retryCount | maxRetry | baseDelay | nextRunAt | status |
 *
 * status:
 * - PENDING    : 再送待ち
 * - PROCESSING : 処理中
 * - DONE       : 完了
 * - FAILED     : 上限到達
 */
class RetryRepository {

  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   */
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Messageを保存（新規登録）
   * statusはPENDINGで登録
   */
  save(message) {

    const id = Utilities.getUuid();

    this.sheet.appendRow([
      id,
      message.channelType,
      message.to,
      message.body,
      message.retryCount,
      message.maxRetry,
      message.baseDelayMinutes,
      message.nextRunAt,
      "PENDING"
    ]);
  }

  /**
   * 再送可能なメッセージを取得
   * 条件：
   * - status = PENDING
   * - nextRunAt <= now
   */
  findPendingReady() {

    const values = this.sheet.getDataRange().getValues();
    const now = new Date();

    return values
      .slice(1) // ヘッダ除外
      .filter(row =>
        row[8] === "PENDING" &&
        row[7] &&
        new Date(row[7]) <= now
      )
      .map(row => ({
        id: row[0],
        message: this.rowToMessage(row)
      }));
  }

  /**
   * 指定IDのステータス更新
   */
  updateStatus(id, newStatus) {

    const values = this.sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {

      if (values[i][0] === id) {

        this.sheet.getRange(i + 1, 9).setValue(newStatus);
        return;
      }
    }
  }

  /**
   * 指定IDの行削除
   */
  deleteById(id) {

    const values = this.sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {

      if (values[i][0] === id) {

        this.sheet.deleteRow(i + 1);
        return;
      }
    }
  }

  /**
   * シート1行をMessageに変換
   */
  rowToMessage(row) {

    return new Message(
      row[1], // channelType
      row[2], // to
      row[3], // body
      {
        retryCount: row[4],
        maxRetry: row[5],
        baseDelayMinutes: row[6],
        nextRunAt: row[7]
      }
    );
  }
}