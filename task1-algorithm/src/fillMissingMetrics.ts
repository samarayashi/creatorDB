import { Metric } from './shared/types';
import { fillMissingMetricsBinary } from './algorithms/binarySearch';
import { fillMissingMetricsTwoPointers } from './algorithms/twoPointers';

/**
 * Algorithm selection strategy configuration
 */
interface AlgorithmConfig {
  preferBinary: boolean;
}
const defaultConfig: AlgorithmConfig = {
  preferBinary: true  
};

/** Default number of days to fill */
const DEFAULT_DAYS = 7; 

/**
 * Select the optimal algorithm based on data size and target days
 * @param dataLength Original data count (n)
 * @param targetLength Target days (m)
 * @param config Algorithm selection configuration
 * @returns 'binary' | 'twoPointers'
 */
export function selectAlgorithm(
  dataLength: number, 
  targetLength: number,
  config: AlgorithmConfig = defaultConfig
): 'binary' | 'twoPointers' {
  const n = dataLength;
  const m = targetLength;
  
  // Calculate theoretical complexity for both algorithms
  const binaryComplexity = m * Math.log2(n);
  const twoPointerComplexity = m + n;
  
  // Direct comparison of theoretical complexity
  if (binaryComplexity < twoPointerComplexity) {
    return 'binary';
  } else if (binaryComplexity > twoPointerComplexity) {
    return 'twoPointers';
  } else {
    // When complexity is equal, decide based on configuration
    return config.preferBinary ? 'binary' : 'twoPointers';
  }
}

/**
 * Fill missing daily metrics data
 * 
 * This function automatically selects the optimal algorithm based on data size:
 * - Binary Search: Suitable for smaller datasets, O(m * log n) time complexity
 * - Two Pointers: Suitable for larger datasets, O(m + n) time complexity
 * 
 * @param data Existing Metric array, must be sorted by date in ascending order
 * @param length Number of days to generate, defaults to 7 days
 * @returns Metric array containing complete data for the specified length of days, sorted by date ascending
 */
export function fillMissingMetrics(
  data: readonly Metric[],
  length: number = DEFAULT_DAYS
): Metric[] {
  if (data.length === 0) {
    throw new Error("Input data must contain at least one record");
  }

  if (length <= 0) {
    throw new Error("Target days must be greater than 0");
  }

  // Dynamically select algorithm based on data size
  const algorithm = selectAlgorithm(data.length, length);
  
  if (algorithm === 'binary') {
    return fillMissingMetricsBinary(data, length);
  } else {
    return fillMissingMetricsTwoPointers(data, length);
  }
} 