import { fetchAndExtract, truncateText } from '../../../wiki-fetcher.js';
import { summarize } from '../../../claude-api.js';
import { buildTypeCategoryUrl, buildFunctionUrl, buildAxisUrl } from '../../../url-mapper.js';
import { getCategoryName, getFunction, getAxis, formatBuiltinText, formatFunctionTypeList } from '../../../builtin-data.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind');
  const key = searchParams.get('key');
  const category = searchParams.get('category');

  if (!kind || !key) {
    return Response.json({ error: 'kind と key は必須です' }, { status: 400 });
  }

  let url, heading, userMessage, context;

  if (kind === 'type_category') {
    const cat = parseInt(category);
    if (!cat || cat < 1 || cat > 7) {
      return Response.json({ error: 'category は 1-7 が必要です' }, { status: 400 });
    }
    url = buildTypeCategoryUrl(key, cat);
    const catName = getCategoryName(cat);
    heading = `${key} - ${catName}`;
    userMessage = `${key}タイプの「${catName}」について詳しく説明してください。`;
    context = { kind: 'type_category', typeName: key, category: cat };
  } else if (kind === 'function') {
    url = buildFunctionUrl(key);
    const f = getFunction(key);
    if (!f) return Response.json({ error: '無効な機能略称です' }, { status: 400 });
    heading = `${key} - ${f.fullName}`;
    userMessage = `${key}（${f.fullName}）について詳しく説明してください。`;
    context = { kind: 'function', abbr: key };
  } else if (kind === 'axis') {
    url = buildAxisUrl(key);
    const a = getAxis(key);
    if (!a) return Response.json({ error: '無効な軸略称です' }, { status: 400 });
    heading = `${key} - ${a.fullName}`;
    userMessage = `${key}（${a.fullName}）について詳しく説明してください。`;
    context = { kind: 'axis', abbr: key };
  } else {
    return Response.json({ error: 'kind は type_category, function, axis のいずれか' }, { status: 400 });
  }

  if (!url) {
    const builtinText = formatBuiltinText(context);
    return Response.json({ heading, text: builtinText, source: 'builtin', template: 'C' });
  }

  const fetchResult = await fetchAndExtract(url);

  if (!fetchResult.ok) {
    const builtinText = formatBuiltinText(context);
    return Response.json({
      heading,
      text: builtinText,
      source: 'builtin',
      template: 'C',
      error: fetchResult.error,
      sourceUrl: null,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = (process.env.ANTHROPIC_MODEL || '').trim() || 'claude-sonnet-4-6';

  let typeListLine = null;
  if (kind === 'function') {
    typeListLine = formatFunctionTypeList(key);
  }

  if (apiKey) {
    const apiResult = await summarize(fetchResult.text, userMessage, apiKey, model);
    if (apiResult.ok) {
      return Response.json({
        heading,
        text: apiResult.text,
        source: 'api',
        template: 'A',
        sourceUrl: url,
        typeListLine,
      });
    }
  }

  const displayText = truncateText(fetchResult.text, 800);
  return Response.json({
    heading,
    text: displayText,
    source: 'web',
    template: 'B',
    sourceUrl: url,
    typeListLine,
  });
}
