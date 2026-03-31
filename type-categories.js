// 16タイプ × カテゴリ2〜7のリッチコンテンツ（4グループから統合）

import { GROUP1 } from './type-categories-group1.js';
import { GROUP2 } from './type-categories-group2.js';
import { GROUP3 } from './type-categories-group3.js';
import { GROUP4 } from './type-categories-group4.js';

export const TYPE_CATEGORY_DATA = {
  ...GROUP1,
  ...GROUP2,
  ...GROUP3,
  ...GROUP4,
};
