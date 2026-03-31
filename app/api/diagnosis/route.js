import { evaluate } from '../../../diagnosis-engine.js';
import { getType } from '../../../builtin-data.js';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { answers } = body;

  if (!Array.isArray(answers) || answers.length !== 16) {
    return Response.json({ error: '16問分の回答が必要です' }, { status: 400 });
  }

  if (!answers.every(a => a === 'A' || a === 'B')) {
    return Response.json({ error: '各回答は "A" または "B" のみ' }, { status: 400 });
  }

  const result = evaluate(answers);
  const typeData = getType(result.type);

  return Response.json({
    ...result,
    summary: typeData.summary,
    url: typeData.url,
    mainFunction: typeData.mainFunction,
    auxFunction: typeData.auxFunction,
  });
}
