import { Metric } from '../shared/types';
import { generateTargetDates } from '../shared/utils';

/**
 * Fill missing metrics using two-pointer linear scan approach
 * Time complexity: O(m + n), where m is target days and n is original data count
 * @param data Existing Metric array, sorted by date in ascending order
 * @param daysCount Number of days to generate (defaults to 7)
 * @returns Metric array in ascending order with exactly daysCount elements
 */
export function fillMissingMetricsTwoPointers(
  data: readonly Metric[],
  daysCount: number = 7
): Metric[] {
  if (data.length === 0) {
    throw new Error("Input data must contain at least one record");
  }

  // 1. Generate target date list
  const targetDates = generateTargetDates(daysCount);

  // 2. Prepare two pointers
  const dates = data.map(m => m.date);
  let dataPointer = 0;
  const dataLength = data.length;
  const result: Metric[] = [];

  // 3. Linear scan each target date with same-direction pointers
  for (const targetDate of targetDates) {
    // 3.1. Advance dataPointer until data[dataPointer].date >= targetDate
    while (dataPointer < dataLength) {
      const currentDate = dates[dataPointer];
      if (currentDate === undefined || currentDate >= targetDate) {
        break;
      }
      dataPointer++;
    }

    // 3.2. If exact match found, copy that record directly
    if (dataPointer < dataLength && dates[dataPointer] === targetDate) {
      const currentMetric = data[dataPointer];
      if (currentMetric) {
        result.push({ ...currentMetric });
        continue;  // Move to next target date
      }
    }

    // 3.3. No exact match, compare left and right candidates
    //    Left candidate: data[dataPointer-1] (if dataPointer > 0)
    //    Right candidate: data[dataPointer] (if dataPointer < dataLength)
    const left = dataPointer > 0 ? data[dataPointer - 1] : null;
    const right = dataPointer < dataLength ? data[dataPointer] : null;

    let pick: Metric;
    if (!left) {
      // Left doesn't exist → must choose right
      if (!right) {
        throw new Error('No available data point found');
      }
      pick = right;
    } else if (!right) {
      // Right doesn't exist → must choose left
      pick = left;
    } else {
      // Both exist → compare distances, choose left if equal (earlier)
      const dL = Math.abs(targetDate - left.date);
      const dR = Math.abs(right.date - targetDate);
      pick = dL <= dR ? left : right;
    }

    // 3.4. Use pick's metrics with targetDate to create new Metric
    const { averageLikesCount, followersCount, averageEngagementRate } = pick;
    result.push({
      date: targetDate,
      averageLikesCount,
      followersCount,
      averageEngagementRate
    });
  }

  return result;
} 