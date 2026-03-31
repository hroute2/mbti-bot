import { getAllTypes, getFunction, getAxis } from '../../../builtin-data.js';

const FUNCTION_ABBRS = ['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi'];
const AXIS_ABBRS = ['EI', 'SN', 'TF', 'JP'];

export async function GET() {
  const types = getAllTypes();
  const functions = FUNCTION_ABBRS.map(a => getFunction(a));
  const axes = AXIS_ABBRS.map(a => getAxis(a));

  return Response.json({ types, functions, axes });
}
