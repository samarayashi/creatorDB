import { Metric } from '../src/shared/types';

// Unified baseline date - consistent with MOCK_TODAY in test files
export const MOCK_TODAY = 1739318400000; // 2025-02-12 00:00:00 UTC
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate date relative to MOCK_TODAY
 * @param daysOffset Day offset (negative for past, positive for future)
 * @returns Calculated timestamp
 */
export function getDateOffset(daysOffset: number): number {
  return MOCK_TODAY + daysOffset * MS_PER_DAY;
}

/**
 * Example 1 from problem description
 * Contains 7 records with some missing days
 */
export const example1: Metric[] = [
  {
    date: getDateOffset(-11),
    averageLikesCount: 100,
    followersCount: 200,
    averageEngagementRate: 0.01
  },
  {
    date: getDateOffset(-9),
    averageLikesCount: 105,
    followersCount: 202,
    averageEngagementRate: 0.012
  },
  {
    date: getDateOffset(-7),
    averageLikesCount: 110,
    followersCount: 205,
    averageEngagementRate: 0.015
  },
  {
    date: getDateOffset(-6),
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: getDateOffset(-3),
    averageLikesCount: 130,
    followersCount: 210,
    averageEngagementRate: 0.022
  },
  {
    date: getDateOffset(-2),
    averageLikesCount: 140,
    followersCount: 215,
    averageEngagementRate: 0.023
  },
  {
    date: getDateOffset(0),
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  },
];

/**
 * Example 2 from problem description
 * Only 2 records, requires extensive filling
 */
export const example2: Metric[] = [
  {
    date: getDateOffset(-5),
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: getDateOffset(0),
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  },
];

/**
 * Edge case: single data point
 */
export const singleDataPoint: Metric[] = [
  {
    date: getDateOffset(-2),
    averageLikesCount: 100,
    followersCount: 500,
    averageEngagementRate: 0.05
  }
];

/**
 * Complete data: full 7-day dataset
 */
export const completeData: Metric[] = [
  { date: getDateOffset(-6), averageLikesCount: 100, followersCount: 200, averageEngagementRate: 0.01 },
  { date: getDateOffset(-5), averageLikesCount: 105, followersCount: 205, averageEngagementRate: 0.015 },
  { date: getDateOffset(-4), averageLikesCount: 110, followersCount: 210, averageEngagementRate: 0.02 },
  { date: getDateOffset(-3), averageLikesCount: 115, followersCount: 215, averageEngagementRate: 0.025 },
  { date: getDateOffset(-2), averageLikesCount: 120, followersCount: 220, averageEngagementRate: 0.03 },
  { date: getDateOffset(-1), averageLikesCount: 125, followersCount: 225, averageEngagementRate: 0.035 },
  { date: getDateOffset(0), averageLikesCount: 130, followersCount: 230, averageEngagementRate: 0.04 },
];

/**
 * Generate large test dataset for performance testing
 * @param count Number of records
 * @param startDateOffset Start date offset relative to MOCK_TODAY (default: today)
 * @returns Test data array
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
  
  // Sort by date ascending
  return data.sort((a, b) => a.date - b.date);
} 