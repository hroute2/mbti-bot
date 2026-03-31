// DebugLogger — DEBUG=1 時のみ stderr 出力 (Req 13)

let debugEnabled = false;

export function init(debug) {
  debugEnabled = debug;
}

export function logHttp(url, statusCode, responseTimeMs) {
  if (!debugEnabled) return;
  process.stderr.write(`[HTTP] ${url} ${statusCode} ${responseTimeMs}ms\n`);
}

export function logHttpError(url, errorType, message) {
  if (!debugEnabled) return;
  process.stderr.write(`[HTTP ERROR] ${url} ${errorType}: ${message}\n`);
}

export function logApi(model, estimatedTokens, responseTimeMs) {
  if (!debugEnabled) return;
  process.stderr.write(`[API] model=${model} tokens≈${estimatedTokens} ${responseTimeMs}ms\n`);
}

export function logApiError(statusCode, errorType, message) {
  if (!debugEnabled) return;
  process.stderr.write(`[API ERROR] status=${statusCode} ${errorType}: ${message}\n`);
}
