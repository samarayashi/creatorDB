# Fill Missing Daily Metrics Algorithm

A high-performance TypeScript algorithm library for filling missing daily metrics data for social media creators. Supports two optimization strategies: binary search and two-pointer approach, with automatic algorithm selection based on data size.

## 🚀 Features

- **Smart Algorithm Selection**: Automatically chooses the optimal algorithm based on data size and target days
- **Dual Algorithm Support**:
  - Binary Search: Suitable for small datasets, O(m × log n) time complexity
  - Two Pointers: Suitable for large datasets, O(m + n) time complexity
- **Highly Configurable**: Supports any number of days (not limited to 7 days)
- **Type Safe**: Complete TypeScript type definitions

## 💡 Real-World Usage Recommendation

**Based on actual production scenarios**, we found that the typical use case involves **filling sparse data over many days** (e.g., receiving 3 data points to fill 30 days). In such scenarios, the **Two Pointer algorithm is consistently optimal** due to its O(m + n) linear complexity.

**Recommendation**: For most real-world applications, you can directly use `fillMissingMetricsTwoPointers()` without the overhead of algorithm selection logic.

## 🎯 Quick Start

```typescript
import { fillMissingMetrics, Metric } from 'fill-missing-metrics';

// Prepare data (must be sorted by date in ascending order)
const data: Metric[] = [
  {
    date: 1738800000000,           // -6d
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02
  },
  {
    date: 1739068800000,           // -3d
    averageLikesCount: 130,
    followersCount: 210,
    averageEngagementRate: 0.022
  },
  {
    date: 1739328000000,           // 0d (today)
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  }
];

// Fill missing 7-day data
const result = fillMissingMetrics(data);
console.log(result.length); // 7

// Custom number of days
const monthlyData = fillMissingMetrics(data, 30);
console.log(monthlyData.length); // 30

// Direct use of Two Pointer algorithm (recommended for production)
import { fillMissingMetricsTwoPointers } from 'fill-missing-metrics';
const optimizedResult = fillMissingMetricsTwoPointers(data, 30);
```

## 📊 Algorithm Description

### Fill Logic

For each missing date:

1. **Find the nearest available date** (can be from past or future)
2. **Prefer earlier date when distances are equal**
3. **Use metrics from nearest date while maintaining target date**

### Algorithm Selection Strategy

The system automatically selects the optimal algorithm based on:
- Choose two-pointer when m × log(n) > (m + n)
- where m = target days, n = original data count

**Note**: In practice, most scenarios favor the two-pointer approach due to sparse data patterns.

## Main Functions

#### `fillMissingMetrics(data, daysCount?)`

Automatically selects the optimal algorithm to fill missing data.

```typescript
function fillMissingMetrics(
  data: readonly Metric[],
  daysCount: number = 7
): Metric[]
```

**Parameters:**
- `data`: Existing metrics data array (must be sorted by date ascending)
- `daysCount`: Number of days to generate (default 7 days)

**Returns:** Metrics array with complete days

#### `fillMissingMetricsBinary(data, daysCount?)`

Forces use of binary search algorithm.

#### `fillMissingMetricsTwoPointers(data, daysCount?)`

Forces use of two-pointer algorithm. **Recommended for production use**.

### Type Definitions

```typescript
type Metric = {
  date: number;                    // UTC timestamp at midnight
  averageLikesCount: number;       // Average likes count
  followersCount: number;          // Followers count
  averageEngagementRate: number;   // Average engagement rate
};
```


```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

Test coverage includes:
- ✅ Basic functionality tests
- ✅ Edge case handling
- ✅ Algorithm consistency verification
- ✅ Performance benchmark tests
- ✅ Data integrity checks

## 🎨 Demo

Run the demo:

```bash
npm run task1:demo
```