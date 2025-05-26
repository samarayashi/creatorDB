import { Metric } from '../shared/types';
import { generateTargetDates } from '../shared/utils';

/**
 * 二分查找：尋找陣列中第一個嚴格大於 target 的索引
 * @param arr 已排序的數字陣列（不可為空）
 * @param target 目標數字
 * @returns 第一個 arr[i] > target 的索引；若都不大於，則返回 arr.length
 * @throws Error 當陣列為空時拋出異常
 */
function bisectRight(arr: readonly number[], target: number): number {
  // 早期失敗：明確拒絕空陣列
  if (arr.length === 0) {
    throw new Error("bisectRight: 不接受空陣列");
  }

  let lo = 0;
  let hi = arr.length;
  
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midValue = arr[mid]!; // 使用非空斷言，因為我們已經檢查了陣列非空
    if (midValue <= target) {
      // 中點 <= target，則右半區有可能
      lo = mid + 1;
    } else {
      // 中點 > target，可能是答案，也可能在左半區
      hi = mid;
    }
  }
  
  return lo;
}

/**
 * 在已有 data 中，針對某個 targetDate，使用二分法找出最近的 Metric
 * 距離相同則偏好日期更小（更早）的那一個
 * @param targetDate 目標日期
 * @param data 原始資料陣列（已保證非空）
 * @param dates 提取出的日期陣列（已保證非空，用於二分查找）
 * @returns 最近的 Metric 資料
 */
function findNearestMetricBinary(
  targetDate: number,
  data: readonly Metric[],
  dates: readonly number[]
): Metric {
  // 在 dates 中尋找第一個大於 targetDate 的位置
  const idx = bisectRight(dates, targetDate);
  const leftIdx = idx - 1;
  const rightIdx = idx;

  // 處理越界：若目標在最左側之前或最右側之後
  if (leftIdx < 0) {
    // 只有右側可選
    return data[rightIdx]!; // 使用非空斷言，因為我們已經保證陣列非空
  }
  if (rightIdx >= dates.length) {
    // 只有左側可選
    return data[leftIdx]!; // 使用非空斷言，因為我們已經保證陣列非空
  }

  // 比較左右兩側的距離
  const leftDate = dates[leftIdx]!;   // 使用非空斷言
  const rightDate = dates[rightIdx]!; // 使用非空斷言
  const leftMetric = data[leftIdx]!;  // 使用非空斷言
  const rightMetric = data[rightIdx]!; // 使用非空斷言
  
  const distLeft = Math.abs(targetDate - leftDate);
  const distRight = Math.abs(rightDate - targetDate);

  if (distLeft < distRight) {
    return leftMetric;
  } else if (distRight < distLeft) {
    return rightMetric;
  } else {
    // 相同距離，取左側（更早）
    return leftMetric;
  }
}

/**
 * 使用二分查找優化版的 fillMissingMetrics
 * 時間複雜度：O(m * log n)，其中 m 是目標天數，n 是原始資料筆數
 * @param data 已有的 Metric 陣列，升序排列
 * @param daysCount 要生成的天數，預設 7 天
 * @returns 按升序、長度恰好為 daysCount 的 Metric 陣列
 */
export function fillMissingMetricsBinary(
  data: readonly Metric[],
  daysCount: number = 7
): Metric[] {
  if (data.length === 0) {
    throw new Error("輸入資料至少需要包含一筆記錄");
  }

  // 1. 構造目標日期列表
  const targetDates = generateTargetDates(daysCount);

  // 2. 提取已有記錄的日期陣列（用於二分查找）
  const dates = data.map(m => m.date);

  // 3. 逐日填充
  const result: Metric[] = targetDates.map(date => {
    // 若已有原始資料，直接複製一份
    const exact = data.find(m => m.date === date);
    if (exact) {
      return { ...exact };
    }
    
    // 否則二分查找最近資料
    const nearest = findNearestMetricBinary(date, data, dates);
    
    // 用最近資料的指標，但把 date 換成目標日期
    const { averageLikesCount, followersCount, averageEngagementRate } = nearest;
    return { 
      date, 
      averageLikesCount, 
      followersCount, 
      averageEngagementRate 
    };
  });

  return result;
} 