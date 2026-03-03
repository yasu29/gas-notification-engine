/**
 * LoggerService
 *
 * 設計思想：
 * - console.log を直接使わせない（将来差し替え可能にするため）
 * - ログレベル制御を可能にする
 * - ログ構造を統一（JSON形式）
 * - GASの制約（staticフィールド非対応）を考慮する
 */
class LoggerService {

  /**
   * ログレベル定義を返す
   *
   * ※ GASはクラス内の static フィールド初期化構文
   *    （例: static LEVELS = {...}）をサポートしていない。
   *
   * そのため、定数はメソッドで返す方式を採用する。
   */
  static getLevels() {
    return {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
  }

  /**
   * 共通ログ出力処理
   *
   * @param {string} level - ログレベル（DEBUG / INFO / WARN / ERROR）
   * @param {string} message - ログメッセージ
   * @param {object} meta - 補足情報（任意）
   */
  static log(level, message, meta = {}) {

    // ログレベル定義を取得
    const LEVELS = this.getLevels();

    // ScriptPropertiesから現在のログレベルを取得
    // 未設定時はINFOレベル（1）とする
    const currentLevel = LEVELS[Config.LOG_LEVEL] ?? 1;

    // 出力対象ログのレベル
    const messageLevel = LEVELS[level];

    // 出力対象レベルが現在設定より低ければ何もしない
    // 例：現在INFOの場合、DEBUGは出力されない
    if (messageLevel < currentLevel) return;

    // ログ構造を統一（将来の永続化や外部送信を想定）
    const logEntry = {
      level,
      message,
      meta,
      timestamp: new Date().toISOString()
    };

    // GAS標準ログへ出力
    // 将来ここを差し替えれば、シート保存やSlack通知に変更可能
    console.log(JSON.stringify(logEntry));
  }

  /**
   * DEBUGログ出力
   * 最も詳細なログ
   */
  static debug(message, meta) {
    this.log("DEBUG", message, meta);
  }

  /**
   * INFOログ出力
   * 通常の処理ログ
   */
  static info(message, meta) {
    this.log("INFO", message, meta);
  }

  /**
   * WARNログ出力
   * 警告レベル（処理は継続可能）
   */
  static warn(message, meta) {
    this.log("WARN", message, meta);
  }

  /**
   * ERRORログ出力
   * 重大エラー
   */
  static error(message, meta) {
    this.log("ERROR", message, meta);
  }
}