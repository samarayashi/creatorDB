import { Metric } from './types';
import { fillMissingMetricsBinary } from './algorithms/binarySearch';
import { fillMissingMetricsTwoPointers } from './algorithms/twoPointers';

/**
 * 演算法選擇策略的配置
 */
interface AlgorithmConfig {
  /** 是否偏好二分查找（在複雜度相近時） */
  preferBinary: boolean;
}

const defaultConfig: AlgorithmConfig = {
  preferBinary: true  // 在複雜度相近時偏好二分查找（通常在小資料集上更穩定）
};


/** 預設的回填天數 */
const DEFAULT_DAYS = 7; 

/**
 * 根據資料量和目標天數，選擇最佳演算法
 * @param dataLength 原始資料筆數 (n)
 * @param targetLength 目標天數 (m)
 * @param config 演算法選擇配置
 * @returns 'binary' | 'twoPointers'
 */
export function selectAlgorithm(
  dataLength: number, 
  targetLength: number,
  config: AlgorithmConfig = defaultConfig
): 'binary' | 'twoPointers' {
  const n = dataLength;
  const m = targetLength;
  
  // 計算兩種演算法的理論複雜度
  const binaryComplexity = m * Math.log2(n);
  const twoPointerComplexity = m + n;
  
  // 直接比較理論複雜度
  if (binaryComplexity < twoPointerComplexity) {
    return 'binary';
  } else if (binaryComplexity > twoPointerComplexity) {
    return 'twoPointers';
  } else {
    // 複雜度相等時，根據配置決定
    return config.preferBinary ? 'binary' : 'twoPointers';
  }
}

/**
 * 填補缺失的每日指標資料
 * 
 * 此函式會自動根據資料量選擇最佳演算法：
 * - 二分查找：適合資料量較小的情況，時間複雜度 O(m * log n)
 * - 雙指針：適合資料量較大的情況，時間複雜度 O(m + n)
 * 
 * @param data 已有的 Metric 陣列，必須按日期升序排列
 * @param length 要生成的天數，預設為 7 天
 * @returns 包含完整 length 天資料的 Metric 陣列，按日期升序排列
 * 
 * @throws {Error} 當輸入資料為空時
 * 
 * @example
 * ```typescript
 * const data = [
 *   { date: 1739068800000, averageLikesCount: 130, followersCount: 210, averageEngagementRate: 0.022 },
 *   { date: 1739328000000, averageLikesCount: 150, followersCount: 220, averageEngagementRate: 0.025 }
 * ];
 * 
 * const result = fillMissingMetrics(data, 7);
 * // 返回 7 天完整資料，缺失的天數會用最近的資料填補
 * ```
 */
export function fillMissingMetrics(
  data: readonly Metric[],
  length: number = DEFAULT_DAYS
): Metric[] {
  if (data.length === 0) {
    throw new Error("輸入資料至少需要包含一筆記錄");
  }

  if (length <= 0) {
    throw new Error("目標天數必須大於 0");
  }

  // 根據資料量動態選擇演算法
  const algorithm = selectAlgorithm(data.length, length);
  
  if (algorithm === 'binary') {
    return fillMissingMetricsBinary(data, length);
  } else {
    return fillMissingMetricsTwoPointers(data, length);
  }
} 