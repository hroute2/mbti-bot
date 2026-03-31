import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { getSystemPromptPrefix } from '../claude-api.js';

describe('ClaudeAPI: システムプロンプト全文一致 (Req 15.2)', () => {
  const EXPECTED_PREFIX = `あなたはMBTI（Myers-Briggs Type Indicator）の専門家です。
以下のwikiwiki.jp/16typesの内容のみを根拠として日本語で回答してください。
提供されたテキストに記載のない情報を補足・推測・外挿してはいけません。
回答は箇条書きまたは短い段落で構成し、簡潔にまとめてください。

--- 参考テキスト ---
`;

  it('システムプロンプト固定部分が要件と一致', () => {
    assert.equal(getSystemPromptPrefix(), EXPECTED_PREFIX);
  });
});
