/**
 * Configクラス
 * 
 * ScriptPropertiesから設定値を取得するための窓口。
 * 
 * 設計思想：
 * - 設定値そのものはコードに書かない
 * - ScriptPropertiesのみを参照する
 * - 必須設定は明示的にエラーを出す
 * - 型変換はここで行う
 */
class Config {

  /**
   * リトライ管理用スプレッドシートID
   *
   * ScriptProperties に登録しておく：
   * キー：RETRY_SHEET_ID
   */
  static get RETRY_SHEET_ID() {
    return PropertiesService
      .getScriptProperties()
      .getProperty("RETRY_SHEET_ID");
  }

  /**
   * リトライシート名
   *
   * 将来変更があってもここだけ修正すればよい
   */
  static get RETRY_SHEET_NAME() {
    return "retry";
  }

  /**
   * LINEチャネルアクセストークン（必須）
   */
  static get LINE_TOKEN() {
    return this.getRequired("LINE_TOKEN");
  }

  /**
   * LINEユーザーID
   */
  static get LINE_USER_ID() {
    return this.get("LINE_USER_ID");
  }

  /**
   * Google Chat Incoming Webhook URL（任意）
   *
   * 注意：
   * - Google Workspace 環境でのみ利用可能
   * - 未設定の場合、GoogleChatChannel でエラーになる
   */
  static get GOOGLE_CHAT_WEBHOOK() {
    return this.get("GOOGLE_CHAT_WEBHOOK");
  }

  /**
   * ログレベル（DEBUG / INFO / WARN / ERROR）
   * 未設定時はINFOをデフォルトとする
   */
  static get LOG_LEVEL() {
    return this.get("LOG_LEVEL", "INFO");
  }

  /**
   * デフォルト最大リトライ回数
   * 文字列で取得されるため数値に変換
   */
  static get RETRY_DEFAULT_MAX() {
    return parseInt(this.get("RETRY_DEFAULT_MAX", "3"), 10);
  }

  /**
   * デフォルト再試行間隔（分）
   */
  static get RETRY_DEFAULT_BASE_DELAY() {
    return parseInt(this.get("RETRY_DEFAULT_BASE_DELAY", "5"), 10);
  }

  // ==============================
  // 内部共通処理
  // ==============================

  /**
   * ScriptPropertiesから値を取得
   * 存在しない場合はdefaultValueを返す
   */
  static get(key, defaultValue = null) {
    const value = PropertiesService
      .getScriptProperties()
      .getProperty(key);

    return value ?? defaultValue;
  }

  /**
   * 必須設定取得
   * 存在しない場合は即例外を投げる
   */
  static getRequired(key) {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }
    return value;
  }
}