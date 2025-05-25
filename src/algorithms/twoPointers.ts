import { Metric } from '../types';
import { generateTargetDates } from '../utils';

/**
 * 使用「同向雙指針」線性掃描，填補缺失的 metrics
 * 時間複雜度：O(m + n)，其中 m 是目標天數，n 是原始資料筆數
 * @param data 已有 Metric 陣列，按 date 升序排列
 * @param daysCount 要生成的天數（預設 7）
 * @returns 按升序、長度恰好為 daysCount 的 Metric 陣列
 */
export function fillMissingMetricsTwoPointers(
  data: readonly Metric[],
  daysCount: number = 7
): Metric[] {
  if (data.length === 0) {
    throw new Error("輸入資料至少需要一筆記錄");
  }

  // 1. 構造目標日期列表
  const targetDates = generateTargetDates(daysCount);

  // 2. 準備雙指針
  const dates = data.map(m => m.date);  // 只要日期值
  let dataPointer = 0;                 // 指向 data 陣列的當前位置
  const dataLength = data.length;      // data 陣列的總長度
  const result: Metric[] = [];

  // 3. 同向線性掃描每個目標日期
  for (const targetDate of targetDates) {
    // 3.1. 推動 dataPointer，直到 data[dataPointer].date >= targetDate 為止
    while (dataPointer < dataLength) {
      const currentDate = dates[dataPointer];
      if (currentDate === undefined || currentDate >= targetDate) {
        break;
      }
      dataPointer++;
    }

    // 3.2. 若剛好命中，直接複製該筆
    if (dataPointer < dataLength && dates[dataPointer] === targetDate) {
      const currentMetric = data[dataPointer];
      if (currentMetric) {
        result.push({ ...currentMetric });
        continue;  // 進入下一個目標日期
      }
    }

    // 3.3. 沒命中時，比較左右候選
    //    左候選：data[dataPointer-1]（若 dataPointer>0）
    //    右候選：data[dataPointer]   （若 dataPointer<dataLength）
    const left = dataPointer > 0 ? data[dataPointer - 1] : null;
    const right = dataPointer < dataLength ? data[dataPointer] : null;

    let pick: Metric;
    if (!left) {
      // 左邊不存在 → 只能選右
      if (!right) {
        throw new Error('無法找到可用的資料點');
      }
      pick = right;
    } else if (!right) {
      // 右邊不存在 → 只能選左
      pick = left;
    } else {
      // 都存在 → 比較距離，若相同則選左（較早）
      const dL = Math.abs(targetDate - left.date);
      const dR = Math.abs(right.date - targetDate);
      pick = dL <= dR ? left : right;
    }

    // 3.4. 用 pick 的各項指標，並把日期設為 targetDate，組成新的 Metric
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