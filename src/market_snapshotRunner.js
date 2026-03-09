/**
 * Daily Market Snapshot 実行関数
 *
 * 責務：
 * - 各銘柄のSnapshotを取得
 * - メッセージを生成
 * - 通知Gateway経由で送信
 *
 * 設計方針：
 * - 計算ロジックは持たない
 * - 表示ロジックも持たない
 * - 将来の複数銘柄追加を前提とする
 */
function runDailyMarketSnapshot() {

  try {

    // -----------------------------
    // ① Snapshot取得
    // -----------------------------
    // 現在はUSD/JPYのみ
    const snapshots = [
      buildUsdJpySnapshot()
    ];

    // -----------------------------
    // ② メッセージ生成
    // -----------------------------
    const message = buildMarketSnapshotMessage(snapshots);

    // -----------------------------
    // ③ 通知送信
    // -----------------------------
    // 現状はLINEユーザーID直書き
    // const lineUserId = "あなたのLINEユーザーID";
    const lineUserId = "U716868f5f0fb7e27006ac969fba7b585";

    notifyText("LINE", lineUserId, message);

    Logger.log("Daily Market Snapshot sent successfully.");

  } catch (error) {

    // -----------------------------
    // ④ エラー処理
    // -----------------------------
    Logger.log("Daily Market Snapshot failed:");
    Logger.log(error.message);

    throw error;
  }
}