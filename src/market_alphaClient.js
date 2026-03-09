/**
 * Alpha Vantage 汎用リクエスト関数
 *
 * @param {Object} params - Alpha Vantageのfunction指定パラメータ
 * 例:
 * {
 *   function: "FX_DAILY",
 *   from_symbol: "USD",
 *   to_symbol: "JPY",
 *   outputsize: "compact"
 * }
 *
 * @returns {Object} Alpha Vantageから返却されるJSON
 */
function alphaRequest(params) {

  // ① ScriptProperties から APIキー取得
  const apiKey = PropertiesService
    .getScriptProperties()
    .getProperty("ALPHA_API_KEY");

  if (!apiKey) {
    throw new Error("ALPHA_API_KEY is not set.");
  }

  // ② ベースURL
  const baseUrl = "https://www.alphavantage.co/query";

  // ③ パラメータにapikeyを追加
  // {...params, apikey: apiKey}
  // → paramsの中身を展開しつつapikeyを追加
  const allParams = {
    ...params,
    apikey: apiKey
  };

  // ④ オブジェクトをクエリ文字列に変換
  // {a:1, b:2} → "a=1&b=2"
  const query = Object.entries(allParams)
    .map(([key, value]) => {
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");

  // ⑤ 完成URL
  const url = `${baseUrl}?${query}`;

  // ⑥ HTTPリクエスト送信
  const response = UrlFetchApp.fetch(url);

  // ⑦ JSON文字列をオブジェクトに変換
  const json = JSON.parse(response.getContentText());

  // ⑧ Alpha特有のエラーパターン検知
  if (json.Note || json["Error Message"]) {
    throw new Error("Alpha API Error: " + JSON.stringify(json));
  }

  return json;
}