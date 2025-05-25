// 主要 API
export { 
  fillMissingMetrics,
  selectAlgorithm
} from './fillMissingMetrics';

// 型別定義
export type { Metric } from './types';
export { MS_PER_DAY } from './types';

// 工具函式
export { getTodayUTCMidnight, generateTargetDates } from './utils';

// 個別演算法（供進階使用者）
export { fillMissingMetricsBinary } from './algorithms/binarySearch';
export { fillMissingMetricsTwoPointers } from './algorithms/twoPointers'; 