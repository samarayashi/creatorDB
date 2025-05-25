import {
  fillMissingMetrics,
  fillMissingMetricsBinary,
  fillMissingMetricsTwoPointers,
  MS_PER_DAY,
  selectAlgorithm
} from '../src';
import {
  example1,
  example2,
  singleDataPoint,
  completeData,
  generateLargeDataset,
  MOCK_TODAY
} from './testData';

// 使用統一的基準日期常數
// const MOCK_TODAY = 1739328000000; // 2025-02-12 00:00:00 UTC - 現在從 testData 匯入

// Mock Date 以確保測試穩定性
const originalDate = Date;
beforeAll(() => {
  global.Date = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(MOCK_TODAY);
      } else {
        super(...(args as [string | number | Date]));
      }
    }
    
    static override now() {
      return MOCK_TODAY;
    }
    

    
    override getUTCFullYear() {
      return new originalDate(MOCK_TODAY).getUTCFullYear();
    }
    
    override getUTCMonth() {
      return new originalDate(MOCK_TODAY).getUTCMonth();
    }
    
    override getUTCDate() {
      return new originalDate(MOCK_TODAY).getUTCDate();
    }
  } as any;
});

afterAll(() => {
  global.Date = originalDate;
});

describe('fillMissingMetrics', () => {
  describe('基本功能測試', () => {
    test('應該正確處理範例 1', () => {
      const result = fillMissingMetrics(example1);
      
      expect(result).toHaveLength(7);
      expect(result.every(m => typeof m.date === 'number')).toBe(true);
      expect(result.every(m => typeof m.averageLikesCount === 'number')).toBe(true);
      expect(result.every(m => typeof m.followersCount === 'number')).toBe(true);
      expect(result.every(m => typeof m.averageEngagementRate === 'number')).toBe(true);
      
      // 檢查日期是否連續且升序
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
      
      // 檢查特定日期的填補邏輯
      const targetDates = [
        MOCK_TODAY - 6 * MS_PER_DAY, // -6d
        MOCK_TODAY - 5 * MS_PER_DAY, // -5d
        MOCK_TODAY - 4 * MS_PER_DAY, // -4d
        MOCK_TODAY - 3 * MS_PER_DAY, // -3d
        MOCK_TODAY - 2 * MS_PER_DAY, // -2d
        MOCK_TODAY - 1 * MS_PER_DAY, // -1d
        MOCK_TODAY                   // 0d
      ];
      
      result.forEach((metric, index) => {
        expect(metric.date).toBe(targetDates[index]);
      });
    });

    test('應該正確處理範例 2', () => {
      const result = fillMissingMetrics(example2);
      
      expect(result).toHaveLength(7);
      
      // 檢查填補邏輯：
      // -6d 到 -3d 應該用 -5d 的資料（距離較近）
      // -2d 應該用 0d 的資料（距離 2 天 vs 3 天，0d 較近）
      // -1d 和 0d 應該用 0d 的資料
      const day5Data = example2[0]; // -5d
      const day0Data = example2[1]; // 0d
      
      if (day5Data && day0Data) {
        // -6d: 用 -5d 資料（距離 1 天 vs 6 天）
        expect(result[0]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -5d: 原始資料
        expect(result[1]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -4d: 用 -5d 資料（距離 1 天 vs 4 天）
        expect(result[2]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -3d: 用 -5d 資料（距離 2 天 vs 3 天）
        expect(result[3]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -2d: 用 0d 資料（距離 2 天 vs 3 天，0d 較近）
        expect(result[4]?.averageLikesCount).toBe(day0Data.averageLikesCount);
        // -1d: 用 0d 資料（距離 1 天 vs 4 天）
        expect(result[5]?.averageLikesCount).toBe(day0Data.averageLikesCount);
        // 0d: 原始資料
        expect(result[6]?.averageLikesCount).toBe(day0Data.averageLikesCount);
      }
    });
  });

  describe('邊界情況測試', () => {
    test('應該處理只有一筆資料的情況', () => {
      const result = fillMissingMetrics(singleDataPoint);
      
      expect(result).toHaveLength(7);
      
      // 所有天數都應該使用這唯一的資料
      const sourceData = singleDataPoint[0];
      if (sourceData) {
        result.forEach(metric => {
          expect(metric.averageLikesCount).toBe(sourceData.averageLikesCount);
          expect(metric.followersCount).toBe(sourceData.followersCount);
          expect(metric.averageEngagementRate).toBe(sourceData.averageEngagementRate);
        });
      }
    });

    test('應該處理已經完整的資料', () => {
      const result = fillMissingMetrics(completeData);
      
      expect(result).toHaveLength(7);
      
      // 每一天都應該有對應的原始資料
      result.forEach((metric, index) => {
        const expectedDate = MOCK_TODAY - (6 - index) * MS_PER_DAY;
        expect(metric.date).toBe(expectedDate);
      });
    });

    test('應該在距離相同時選擇較早的時間', () => {
      // 創建一個距離完全相同的測試案例
      const equalDistanceData = [
        {
          date: MOCK_TODAY - 4 * MS_PER_DAY, // -4d
          averageLikesCount: 100,
          followersCount: 400,
          averageEngagementRate: 0.01
        },
        {
          date: MOCK_TODAY - 2 * MS_PER_DAY, // -2d
          averageLikesCount: 200,
          followersCount: 500,
          averageEngagementRate: 0.02
        }
      ];

      const result = fillMissingMetrics(equalDistanceData, 7);
      
      expect(result).toHaveLength(7);
      
      // -3d 到 -4d 和 -2d 的距離都是 1 天，應該選擇較早的 -4d
      const day3Result = result.find(m => m.date === MOCK_TODAY - 3 * MS_PER_DAY);
      expect(day3Result?.averageLikesCount).toBe(100); // 來自 -4d 的資料
      expect(day3Result?.followersCount).toBe(400);
      expect(day3Result?.averageEngagementRate).toBe(0.01);
    });

    test('應該拋出錯誤當輸入為空陣列', () => {
      expect(() => fillMissingMetrics([])).toThrow('輸入資料至少需要包含一筆記錄');
    });

    test('應該拋出錯誤當天數小於等於 0', () => {
      expect(() => fillMissingMetrics(example1, 0)).toThrow('目標天數必須大於 0');
      expect(() => fillMissingMetrics(example1, -1)).toThrow('目標天數必須大於 0');
    });
  });

  describe('可配置天數測試', () => {
    test('應該支援 14 天', () => {
      const result = fillMissingMetrics(example1, 14);
      expect(result).toHaveLength(14);
      
      // 檢查日期連續性
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
    });

    test('應該支援 30 天', () => {
      const result = fillMissingMetrics(example1, 30);
      expect(result).toHaveLength(30);
      
      // 檢查日期連續性
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
    });

    test('應該支援 1 天', () => {
      const result = fillMissingMetrics(example1, 1);
      expect(result).toHaveLength(1);
      expect(result[0]?.date).toBe(MOCK_TODAY);
    });
  });

  describe('演算法一致性測試', () => {
    test('二分查找和雙指針應該產生相同結果', () => {
      const binaryResult = fillMissingMetricsBinary(example1);
      const twoPointerResult = fillMissingMetricsTwoPointers(example1);
      
      expect(binaryResult).toEqual(twoPointerResult);
    });

    test('在不同資料集上兩種演算法應該一致', () => {
      const testCases = [example1, example2, singleDataPoint, completeData];
      
      testCases.forEach(testData => {
        const binaryResult = fillMissingMetricsBinary(testData);
        const twoPointerResult = fillMissingMetricsTwoPointers(testData);
        
        expect(binaryResult).toEqual(twoPointerResult);
      });
    });

    test('在不同天數配置下兩種演算法應該一致', () => {
      const lengths = [1, 7, 14, 30, 365];
      
      lengths.forEach(length => {
        const binaryResult = fillMissingMetricsBinary(example1, length);
        const twoPointerResult = fillMissingMetricsTwoPointers(example1, length);
        
        expect(binaryResult).toEqual(twoPointerResult);
      });
    });
  });

  describe('演算法選擇測試', () => {
    test('小資料集應該選擇二分查找', () => {
      // 對於 selectAlgorithm(5, 7):
      // binaryComplexity = 7 * log2(5) ≈ 7 * 2.32 ≈ 16.24
      // twoPointerComplexity = 7 + 5 = 12
      // 12 < 16.24，所以應該選擇 twoPointers
      expect(selectAlgorithm(5, 7)).toBe('twoPointers');
      
      // 對於 selectAlgorithm(10, 7):
      // binaryComplexity = 7 * log2(10) ≈ 7 * 3.32 ≈ 23.24
      // twoPointerComplexity = 7 + 10 = 17
      // 17 < 23.24，所以應該選擇 twoPointers
      expect(selectAlgorithm(10, 7)).toBe('twoPointers');
    });

    test('大資料集應該選擇雙指針', () => {
      // 對於 selectAlgorithm(1000, 365):
      // binaryComplexity = 365 * log2(1000) ≈ 365 * 9.97 ≈ 3639
      // twoPointerComplexity = 365 + 1000 = 1365
      // 1365 < 3639，所以應該選擇 twoPointers
      expect(selectAlgorithm(1000, 365)).toBe('twoPointers');
      
      // 對於 selectAlgorithm(10000, 30):
      // binaryComplexity = 30 * log2(10000) ≈ 30 * 13.29 ≈ 398.7
      // twoPointerComplexity = 30 + 10000 = 10030
      // 398.7 < 10030，所以應該選擇 binary
      expect(selectAlgorithm(10000, 30)).toBe('binary');
    });

    test('邊界情況的演算法選擇', () => {
      // 對於 selectAlgorithm(1, 1):
      // binaryComplexity = 1 * log2(1) = 1 * 0 = 0
      // twoPointerComplexity = 1 + 1 = 2
      // 0 < 2，所以應該選擇 binary
      expect(selectAlgorithm(1, 1)).toBe('binary');
      
      // 對於 selectAlgorithm(1, 1000):
      // binaryComplexity = 1000 * log2(1) = 1000 * 0 = 0
      // twoPointerComplexity = 1000 + 1 = 1001
      // 0 < 1001，所以應該選擇 binary
      expect(selectAlgorithm(1, 1000)).toBe('binary');
    });
  });

  describe('效能測試', () => {
    test('應該在合理時間內處理大量資料', () => {
      const largeDataset = generateLargeDataset(1000);
      
      const startTime = Date.now();
      const result = fillMissingMetrics(largeDataset, 365);
      const endTime = Date.now();
      
      expect(result).toHaveLength(365);
      expect(endTime - startTime).toBeLessThan(1000); // 應該在 1 秒內完成
    });

    test('二分查找在小資料集上的效能', () => {
      const smallDataset = generateLargeDataset(10);
      
      const startTime = Date.now();
      const result = fillMissingMetricsBinary(smallDataset, 30);
      const endTime = Date.now();
      
      expect(result).toHaveLength(30);
      expect(endTime - startTime).toBeLessThan(100); // 應該很快
    });

    test('雙指針在大資料集上的效能', () => {
      const largeDataset = generateLargeDataset(5000);
      
      const startTime = Date.now();
      const result = fillMissingMetricsTwoPointers(largeDataset, 365);
      const endTime = Date.now();
      
      expect(result).toHaveLength(365);
      expect(endTime - startTime).toBeLessThan(500); // 應該在 0.5 秒內完成
    });
  });

  describe('資料完整性測試', () => {
    test('結果不應該修改原始資料', () => {
      const originalData = JSON.parse(JSON.stringify(example1));
      fillMissingMetrics(example1);
      
      expect(example1).toEqual(originalData);
    });

    test('結果中的物件應該是新的實例', () => {
      const result = fillMissingMetrics(example1);
      
      // 檢查沒有任何結果物件與原始資料共享引用
      result.forEach(resultMetric => {
        example1.forEach(originalMetric => {
          expect(resultMetric).not.toBe(originalMetric);
        });
      });
    });

    test('所有必要欄位都應該存在且為正確型別', () => {
      const result = fillMissingMetrics(example1);
      
      result.forEach(metric => {
        expect(typeof metric.date).toBe('number');
        expect(typeof metric.averageLikesCount).toBe('number');
        expect(typeof metric.followersCount).toBe('number');
        expect(typeof metric.averageEngagementRate).toBe('number');
        
        expect(metric.date).toBeGreaterThan(0);
        expect(metric.averageLikesCount).toBeGreaterThanOrEqual(0);
        expect(metric.followersCount).toBeGreaterThanOrEqual(0);
        expect(metric.averageEngagementRate).toBeGreaterThanOrEqual(0);
      });
    });
  });
}); 