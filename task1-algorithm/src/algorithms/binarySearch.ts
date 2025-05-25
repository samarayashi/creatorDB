import { Metric } from '../shared/types';
import { generateTargetDates } from '../shared/utils';

/**
 * Binary search: Find the first index that is strictly greater than target
 * @param arr Sorted number array (must not be empty)
 * @param target Target number
 * @returns First index where arr[i] > target; returns arr.length if none found
 * @throws Error when array is empty
 */
function bisectRight(arr: readonly number[], target: number): number {
  if (arr.length === 0) {
    throw new Error("bisectRight: empty array not accepted");
  }

  let lo = 0;
  let hi = arr.length;
  
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midValue = arr[mid]!; 
    if (midValue <= target) {
      // Mid point <= target, search right half
      lo = mid + 1;
    } else {
      // Mid point > target, could be answer or in left half
      hi = mid;
    }
  }
  
  return lo;
}

/**
 * Find the nearest Metric for a target date using binary search
 * When distances are equal, prefer the earlier date
 * @param targetDate Target date
 * @param data Original data array (guaranteed non-empty)
 * @param dates Extracted date array (guaranteed non-empty, used for binary search)
 * @returns Nearest Metric data
 */
function findNearestMetricBinary(
  targetDate: number,
  data: readonly Metric[],
  dates: readonly number[]
): Metric {
  // Find first position greater than targetDate in dates
  const idx = bisectRight(dates, targetDate);
  const leftIdx = idx - 1;
  const rightIdx = idx;

  // Handle out of bounds: target before leftmost or after rightmost
  if (leftIdx < 0) {
    // Only right side available
    return data[rightIdx]!; // Non-null assertion since array is guaranteed non-empty
  }
  if (rightIdx >= dates.length) {
    // Only left side available
    return data[leftIdx]!; // Non-null assertion since array is guaranteed non-empty
  }

  // Compare distances from left and right sides
  const leftDate = dates[leftIdx]!;
  const rightDate = dates[rightIdx]!;
  const leftMetric = data[leftIdx]!;
  const rightMetric = data[rightIdx]!;
  
  const distLeft = Math.abs(targetDate - leftDate);
  const distRight = Math.abs(rightDate - targetDate);

  if (distLeft < distRight) {
    return leftMetric;
  } else if (distRight < distLeft) {
    return rightMetric;
  } else {
    // Equal distance, choose left side (earlier)
    return leftMetric;
  }
}

/**
 * Binary search optimized version of fillMissingMetrics
 * Time complexity: O(m * log n), where m is target days and n is original data count
 * @param data Existing Metric array, sorted in ascending order
 * @param length Number of days to generate, defaults to 7
 * @returns Metric array in ascending order with exactly length elements
 */
export function fillMissingMetricsBinary(
  data: readonly Metric[],
  length: number = 7
): Metric[] {
  if (data.length === 0) {
    throw new Error("Input data must contain at least one record");
  }

  // 1. Generate target date list
  const targetDates = generateTargetDates(length);

  // 2. Extract date array from existing records (for binary search)
  const dates = data.map(m => m.date);

  // 3. Fill day by day
  const result: Metric[] = targetDates.map(date => {
    // If exact data exists, copy it
    const exact = data.find(m => m.date === date);
    if (exact) {
      return { ...exact };
    }
    
    // Otherwise use binary search to find nearest data
    const nearest = findNearestMetricBinary(date, data, dates);
    
    // Use nearest data's metrics but replace date with target date
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