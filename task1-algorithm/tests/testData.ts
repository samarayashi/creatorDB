import { Metric } from '../src/shared/types';

// 統一的基準日期 - 與測試檔案中的 MOCK_TODAY 保持一致
export const MOCK_TODAY = 1739318400000; // 2025-02-12 00:00:00 UTC (修正為真正的零點)
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 計算相對於 MOCK_TODAY 的日期
 * @param daysOffset 天數偏移（負數表示過去，正數表示未來）
 * @returns 計算後的時間戳
 */
export function getDateOffset(daysOffset: number): number {
  return MOCK_TODAY + daysOffset * MS_PER_DAY;
}

/**
 * 題目提供的範例 1
 * 包含 7 筆資料，但有部分天數缺失
 * 基於 MOCK_TODAY 計算所有日期
 */
export const example1: Metric[] = [
  {
    date: getDateOffset(-11),      // -11d
    averageLikesCount: 100,
    followersCount: 200,
    averageEngagementRate: 0.01
  },
  {
    date: getDateOffset(-9),       // -9d
    averageLikesCount: 105,
    followersCount: 202,
    averageEngagementRate: 0.012
  },
  {
    date: getDateOffset(-7),       // -7d
    averageLikesCount: 110,
    followersCount: 205,
    averageEngagementRate: 0.015
  },
  {
    date: getDateOffset(-6),       // -6d
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: getDateOffset(-3),       // -3d
    averageLikesCount: 130,
    followersCount: 210,
    averageEngagementRate: 0.022
  },
  {
    date: getDateOffset(-2),       // -2d
    averageLikesCount: 140,
    followersCount: 215,
    averageEngagementRate: 0.023
  },
  {
    date: getDateOffset(0),        // 0d (today)
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  },
];

/**
 * 題目提供的範例 2
 * 只有 2 筆資料，需要大量填補
 * 基於 MOCK_TODAY 計算所有日期
 */
export const example2: Metric[] = [
  {
    date: getDateOffset(-5),       // -5d
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: getDateOffset(0),        // 0d (today)
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  },
];

/**
 * 邊界測試：只有一筆資料
 * 基於 MOCK_TODAY 計算日期
 */
export const singleDataPoint: Metric[] = [
  {
    date: getDateOffset(-2),       // -2d
    averageLikesCount: 100,
    followersCount: 500,
    averageEngagementRate: 0.05
  }
];

/**
 * 完整資料：已經有完整的 7 天資料
 * 基於 MOCK_TODAY 計算所有日期，確保完全對應目標範圍
 */
export const completeData: Metric[] = [
  { date: getDateOffset(-6), averageLikesCount: 100, followersCount: 200, averageEngagementRate: 0.01 }, // -6d
  { date: getDateOffset(-5), averageLikesCount: 105, followersCount: 205, averageEngagementRate: 0.015 }, // -5d
  { date: getDateOffset(-4), averageLikesCount: 110, followersCount: 210, averageEngagementRate: 0.02 }, // -4d
  { date: getDateOffset(-3), averageLikesCount: 115, followersCount: 215, averageEngagementRate: 0.025 }, // -3d
  { date: getDateOffset(-2), averageLikesCount: 120, followersCount: 220, averageEngagementRate: 0.03 }, // -2d
  { date: getDateOffset(-1), averageLikesCount: 125, followersCount: 225, averageEngagementRate: 0.035 }, // -1d
  { date: getDateOffset(0), averageLikesCount: 130, followersCount: 230, averageEngagementRate: 0.04 }, // 0d (today)
];

/**
 * 生成大量測試資料（用於效能測試）
 * @param count 資料筆數
 * @param startDateOffset 起始日期相對於 MOCK_TODAY 的偏移天數（預設為今天）
 * @returns 測試資料陣列
 */
export function generateLargeDataset(count: number, startDateOffset: number = 0): Metric[] {
  const data: Metric[] = [];
  
  for (let i = 0; i < count; i++) {
    data.push({
      date: getDateOffset(startDateOffset - i),
      averageLikesCount: 100 + Math.floor(Math.random() * 100),
      followersCount: 1000 + Math.floor(Math.random() * 1000),
      averageEngagementRate: 0.01 + Math.random() * 0.05
    });
  }
  
  // 按日期升序排列
  return data.sort((a, b) => a.date - b.date);
} 