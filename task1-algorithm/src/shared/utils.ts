import { MS_PER_DAY } from './types';

/**
 * Calculate today's UTC midnight timestamp
 * @returns Today's UTC midnight timestamp in milliseconds
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
 * Generate target date array, going back N days from today
 * @param length Number of days to generate
 * @returns Date timestamp array sorted in ascending order
 */
export function generateTargetDates(length: number): number[] {
  const todayMid = getTodayUTCMidnight();
  const targetDates: number[] = [];
  
  // From today-(length-1) to today, total length days
  for (let i = length - 1; i >= 0; i--) {
    targetDates.push(todayMid - i * MS_PER_DAY);
  }
  
  return targetDates;
} 