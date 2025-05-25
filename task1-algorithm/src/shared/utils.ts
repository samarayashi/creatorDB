import { MS_PER_DAY } from './types';

/**
 * 計算今日 UTC 零點的時間戳記
 * @returns 今日 UTC 零點的毫秒時間戳記
 */
export function getTodayUTCMidnight(): number {
  const now = new Date();
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
}

/**
 * 生成目標日期陣列，從今日往前推 N 天
 * @param length 要生成的天數
 * @returns 按升序排列的日期時間戳記陣列
 */
export function generateTargetDates(length: number): number[] {
  const todayMid = getTodayUTCMidnight();
  const targetDates: number[] = [];
  
  // 從 today-(length-1) 到 today，共 length 天
  for (let i = length - 1; i >= 0; i--) {
    targetDates.push(todayMid - i * MS_PER_DAY);
  }
  
  return targetDates;
} 