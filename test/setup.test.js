import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

describe('プロジェクト初期化 (Task 1.1)', () => {
  let pkg;

  it('package.json が存在し JSON として読める', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    assert.ok(pkg);
  });

  it('type が "module" で ESM モードになっている', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    assert.equal(pkg.type, 'module');
  });

  it('engines.node が ">=22" を指定している', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    assert.ok(pkg.engines, 'engines フィールドが存在しない');
    assert.ok(pkg.engines.node, 'engines.node が存在しない');
    assert.match(pkg.engines.node, />=\s*22/, 'Node.js v22 以上の指定がない');
  });

  it('cheerio が dependencies に含まれている', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    assert.ok(pkg.dependencies, 'dependencies が存在しない');
    assert.ok(pkg.dependencies.cheerio, 'cheerio が dependencies にない');
    assert.match(pkg.dependencies.cheerio, /\^1/, 'cheerio のバージョンが ^1.x でない');
  });

  it('@anthropic-ai/sdk が dependencies に含まれていない（native fetch を使用）', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    const deps = pkg.dependencies || {};
    assert.equal(deps['@anthropic-ai/sdk'], undefined, '@anthropic-ai/sdk は不要（Req 14.1）');
  });

  it('test スクリプトが node:test を使用する設定になっている', async () => {
    const raw = await readFile(resolve('package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    assert.ok(pkg.scripts, 'scripts が存在しない');
    assert.ok(pkg.scripts.test, 'test スクリプトが存在しない');
    assert.match(pkg.scripts.test, /node\s+--test/, 'node --test が設定されていない');
  });

  it('index.js が存在する', async () => {
    const content = await readFile(resolve('index.js'), 'utf-8');
    assert.ok(content.length > 0, 'index.js が空');
  });
});
