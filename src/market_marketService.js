/**
 * USD/JPY Snapshot を構築する
 *
 * 責務：
 * - Alphaからデータ取得
 * - 必要データ抽出
 * - 差分計算
 * - 内部モデル生成
 *
 * @returns {Object} Snapshot内部モデル
 */
function buildUsdJpySnapshot() {

  // -------------------------------
  // ① Alpha API呼び出し
  // -------------------------------
  const raw = alphaRequest({
    function: "FX_DAILY",
    from_symbol: "USD",
    to_symbol: "JPY",
    outputsize: "compact"
  });

  const series = raw["Time Series FX (Daily)"];

  if (!series) {
    throw new Error("FX time series not found.");
  }

  // -------------------------------
  // ② 日付を明示的にソート
  // -------------------------------
  const dates = Object.keys(series)
    .sort((a, b) => new Date(b) - new Date(a))
    .slice(0, 5);

  // -------------------------------
  // ③ データ件数チェック
  // -------------------------------
  if (dates.length < 2) {
    throw new Error("Insufficient FX data.");
  }

  // -------------------------------
  // ④ history生成（数値化）
  // -------------------------------
  const history = dates.map(date => ({
    date: date,
    close: Number(series[date]["4. close"])
  }));

  // -------------------------------
  // ⑤ 最新値・前日値取得
  // -------------------------------
  const latest = history[0].close;
  const previous = history[1].close;

  // -------------------------------
  // ⑥ 差分計算
  // -------------------------------
  const diff = latest - previous;
  const diffPercent = (diff / previous) * 100;

  // -------------------------------
  // ⑦ 内部モデル返却
  // -------------------------------
  return {
    symbol: "USDJPY",
    label: "USD/JPY",
    latest: latest,
    previous: previous,
    diff: diff,
    diffPercent: diffPercent,
    history: {
      period: "5d",
      tradingDays: true,
      data: history
    }
  };
}