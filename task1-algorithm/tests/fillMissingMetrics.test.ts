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

// Use unified baseline date constant
// const MOCK_TODAY = 1739328000000; // 2025-02-12 00:00:00 UTC - now imported from testData

// Mock Date to ensure test stability
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
  describe('Basic functionality tests', () => {
    test('should correctly handle example 1', () => {
      const result = fillMissingMetrics(example1);
      
      expect(result).toHaveLength(7);
      expect(result.every(m => typeof m.date === 'number')).toBe(true);
      expect(result.every(m => typeof m.averageLikesCount === 'number')).toBe(true);
      expect(result.every(m => typeof m.followersCount === 'number')).toBe(true);
      expect(result.every(m => typeof m.averageEngagementRate === 'number')).toBe(true);
      
      // Check if dates are consecutive and ascending
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
      
      // Check specific date fill logic
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

    test('should correctly handle example 2', () => {
      const result = fillMissingMetrics(example2);
      
      expect(result).toHaveLength(7);
      
      // Check fill logic:
      // -6d to -3d should use -5d data (closer distance)
      // -2d should use 0d data (2 days vs 3 days distance, 0d is closer)
      // -1d and 0d should use 0d data
      const day5Data = example2[0]; // -5d
      const day0Data = example2[1]; // 0d
      
      if (day5Data && day0Data) {
        // -6d: use -5d data (1 day vs 6 days distance)
        expect(result[0]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -5d: original data
        expect(result[1]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -4d: use -5d data (1 day vs 4 days distance)
        expect(result[2]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -3d: use -5d data (2 days vs 3 days distance)
        expect(result[3]?.averageLikesCount).toBe(day5Data.averageLikesCount);
        // -2d: use 0d data (2 days vs 3 days distance, 0d is closer)
        expect(result[4]?.averageLikesCount).toBe(day0Data.averageLikesCount);
        // -1d: use 0d data (1 day vs 4 days distance)
        expect(result[5]?.averageLikesCount).toBe(day0Data.averageLikesCount);
        // 0d: original data
        expect(result[6]?.averageLikesCount).toBe(day0Data.averageLikesCount);
      }
    });
  });

  describe('Edge case tests', () => {
    test('should handle single data point', () => {
      const result = fillMissingMetrics(singleDataPoint);
      
      expect(result).toHaveLength(7);
      
      // All days should use this single data point
      const sourceData = singleDataPoint[0];
      if (sourceData) {
        result.forEach(metric => {
          expect(metric.averageLikesCount).toBe(sourceData.averageLikesCount);
          expect(metric.followersCount).toBe(sourceData.followersCount);
          expect(metric.averageEngagementRate).toBe(sourceData.averageEngagementRate);
        });
      }
    });

    test('should handle complete data', () => {
      const result = fillMissingMetrics(completeData);
      
      expect(result).toHaveLength(7);
      
      // Each day should have corresponding original data
      result.forEach((metric, index) => {
        const expectedDate = MOCK_TODAY - (6 - index) * MS_PER_DAY;
        expect(metric.date).toBe(expectedDate);
      });
    });

    test('should choose earlier time when distances are equal', () => {
      // Create a test case with exactly equal distances
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
      
      // -3d has equal distance (1 day) to both -4d and -2d, should choose earlier -4d
      const day3Result = result.find(m => m.date === MOCK_TODAY - 3 * MS_PER_DAY);
      expect(day3Result?.averageLikesCount).toBe(100); // From -4d data
      expect(day3Result?.followersCount).toBe(400);
      expect(day3Result?.averageEngagementRate).toBe(0.01);
    });

    test('should throw error when input is empty array', () => {
      expect(() => fillMissingMetrics([])).toThrow('Input data must contain at least one record');
    });

    test('should throw error when days is less than or equal to 0', () => {
      expect(() => fillMissingMetrics(example1, 0)).toThrow('Target days must be greater than 0');
      expect(() => fillMissingMetrics(example1, -1)).toThrow('Target days must be greater than 0');
    });
  });

  describe('Configurable days tests', () => {
    test('should support 14 days', () => {
      const result = fillMissingMetrics(example1, 14);
      expect(result).toHaveLength(14);
      
      // Check date continuity
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
    });

    test('should support 30 days', () => {
      const result = fillMissingMetrics(example1, 30);
      expect(result).toHaveLength(30);
      
      // Check date continuity
      for (let i = 1; i < result.length; i++) {
        const current = result[i];
        const previous = result[i-1];
        if (current && previous) {
          expect(current.date - previous.date).toBe(MS_PER_DAY);
        }
      }
    });

    test('should support 1 day', () => {
      const result = fillMissingMetrics(example1, 1);
      expect(result).toHaveLength(1);
      expect(result[0]?.date).toBe(MOCK_TODAY);
    });
  });

  describe('Algorithm consistency tests', () => {
    test('binary search and two pointers should produce same results', () => {
      const binaryResult = fillMissingMetricsBinary(example1);
      const twoPointerResult = fillMissingMetricsTwoPointers(example1);
      
      expect(binaryResult).toEqual(twoPointerResult);
    });

    test('both algorithms should be consistent across different datasets', () => {
      const datasets = [example1, example2, singleDataPoint, completeData];
      
      datasets.forEach(dataset => {
        const binaryResult = fillMissingMetricsBinary(dataset);
        const twoPointerResult = fillMissingMetricsTwoPointers(dataset);
        expect(binaryResult).toEqual(twoPointerResult);
      });
    });

    test('both algorithms should be consistent across different day configurations', () => {
      const dayConfigs = [1, 7, 14, 30];
      
      dayConfigs.forEach(days => {
        const binaryResult = fillMissingMetricsBinary(example1, days);
        const twoPointerResult = fillMissingMetricsTwoPointers(example1, days);
        expect(binaryResult).toEqual(twoPointerResult);
      });
    });
  });

  describe('Algorithm selection tests', () => {
    test('small datasets should choose appropriate algorithm', () => {
      // For selectAlgorithm(3, 7) - 3 existing records, fill to 7 days:
      // Binary: 7 * log2(3) ≈ 7 * 1.58 ≈ 11.06
      // Two-pointer: 7 + 3 = 10
      // 10 < 11.06, so should choose twoPointers
      expect(selectAlgorithm(3, 7)).toBe('twoPointers');
      
      // For selectAlgorithm(5, 14) - 5 existing records, fill to 14 days:
      // Binary: 14 * log2(5) ≈ 14 * 2.32 ≈ 32.48
      // Two-pointer: 14 + 5 = 19
      // 19 < 32.48, so should choose twoPointers
      expect(selectAlgorithm(5, 14)).toBe('twoPointers');
      
      // For selectAlgorithm(2, 30) - 2 existing records, fill to 30 days:
      // Binary: 30 * log2(2) ≈ 30 * 1 = 30
      // Two-pointer: 30 + 2 = 32
      // 30 < 32, so should choose binary
      expect(selectAlgorithm(2, 30)).toBe('binary');
    });

    test('larger datasets should choose appropriate algorithm', () => {
      // For selectAlgorithm(50, 365) - 50 existing records, fill to 365 days:
      // Binary: 365 * log2(50) ≈ 365 * 5.64 ≈ 2058.6
      // Two-pointer: 365 + 50 = 415
      // 415 < 2058.6, so should choose twoPointers
      expect(selectAlgorithm(50, 365)).toBe('twoPointers');
      
      // For selectAlgorithm(100, 365) - 100 existing records, fill to 365 days:
      // Binary: 365 * log2(100) ≈ 365 * 6.64 ≈ 2423.6
      // Two-pointer: 365 + 100 = 465
      // 465 < 2423.6, so should choose twoPointers
      expect(selectAlgorithm(100, 365)).toBe('twoPointers');
      
      // For selectAlgorithm(10, 365) - 10 existing records, fill to 365 days:
      // Binary: 365 * log2(10) ≈ 365 * 3.32 ≈ 1211.8
      // Two-pointer: 365 + 10 = 375
      // 375 < 1211.8, so should choose twoPointers
      expect(selectAlgorithm(10, 365)).toBe('twoPointers');
    });

    test('edge cases for algorithm selection', () => {
      // For selectAlgorithm(1, 1) - 1 existing record, fill to 1 day:
      // Binary: 1 * log2(1) = 1 * 0 = 0
      // Two-pointer: 1 + 1 = 2
      // 0 < 2, so should choose binary
      expect(selectAlgorithm(1, 1)).toBe('binary');
      
      // For selectAlgorithm(1, 7) - 1 existing record, fill to 7 days:
      // Binary: 7 * log2(1) = 7 * 0 = 0
      // Two-pointer: 7 + 1 = 8
      // 0 < 8, so should choose binary
      expect(selectAlgorithm(1, 7)).toBe('binary');
      
      // For selectAlgorithm(1, 30) - 1 existing record, fill to 30 days:
      // Binary: 30 * log2(1) = 30 * 0 = 0
      // Two-pointer: 30 + 1 = 31
      // 0 < 31, so should choose binary
      expect(selectAlgorithm(1, 30)).toBe('binary');
    });
  });

  describe('Performance tests', () => {
    test('should handle large amounts of data within reasonable time', () => {
      const largeDataset = generateLargeDataset(1000);
      
      const startTime = Date.now();
      const result = fillMissingMetrics(largeDataset, 365);
      const endTime = Date.now();
      
      expect(result).toHaveLength(365);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('binary search should be fast on small datasets', () => {
      const startTime = Date.now();
      const result = fillMissingMetricsBinary(example1, 30);
      const endTime = Date.now();
      
      expect(result).toHaveLength(30);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    test('two pointers should be fast on large datasets', () => {
      const largeDataset = generateLargeDataset(1000);
      
      const startTime = Date.now();
      const result = fillMissingMetricsTwoPointers(largeDataset, 365);
      const endTime = Date.now();
      
      expect(result).toHaveLength(365);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 0.5 seconds
    });
  });

  describe('Data integrity tests', () => {
    test('result should not modify original data', () => {
      const originalData = JSON.parse(JSON.stringify(example1));
      fillMissingMetrics(example1);
      expect(example1).toEqual(originalData);
    });

    test('result objects should be new instances', () => {
      const result = fillMissingMetrics(example1);
      
      // Check that no result object shares reference with original data
      result.forEach(resultMetric => {
        example1.forEach(originalMetric => {
          expect(resultMetric).not.toBe(originalMetric);
        });
      });
    });

    test('all required fields should exist and be of correct type', () => {
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