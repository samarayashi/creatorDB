import {
  fillMissingMetrics,
  fillMissingMetricsBinary,
  fillMissingMetricsTwoPointers,
  Metric,
  MS_PER_DAY
} from '../src';

// Example data from the problem description
const exampleData: Metric[] = [
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
    date: 1739155200000,           // -2d
    averageLikesCount: 140,
    followersCount: 215,
    averageEngagementRate: 0.023
  },
  {
    date: 1739328000000,           // 0d (today)
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025
  },
];

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0] || '';
}

function printMetrics(metrics: Metric[], title: string) {
  console.log(`\n=== ${title} ===`);
  console.log('Date\t\tLikes\tFollowers\tEngagement');
  console.log('----------------------------------------');
  
  metrics.forEach(metric => {
    console.log(
      `${formatDate(metric.date)}\t${metric.averageLikesCount}\t${metric.followersCount}\t${metric.averageEngagementRate.toFixed(3)}`
    );
  });
}

function demonstrateAlgorithm() {
  console.log('🚀 Fill Missing Daily Metrics Algorithm Demo');
  console.log('=====================================');
  
  printMetrics(exampleData, 'Original Data (with gaps)');
  
  console.log('\n📊 Using automatic algorithm selection:');
  const autoResult = fillMissingMetrics(exampleData);
  printMetrics(autoResult, 'Auto-filled Result');
  
  console.log('\n🔍 Using binary search algorithm:');
  const binaryResult = fillMissingMetricsBinary(exampleData);
  printMetrics(binaryResult, 'Binary Search Result');
  
  console.log('\n👆 Using two-pointer algorithm:');
  const twoPointerResult = fillMissingMetricsTwoPointers(exampleData);
  printMetrics(twoPointerResult, 'Two-Pointer Result');
  
  // Verify consistency
  const isConsistent = JSON.stringify(autoResult) === JSON.stringify(binaryResult) &&
                      JSON.stringify(binaryResult) === JSON.stringify(twoPointerResult);
  
  console.log(`\n✅ Algorithm consistency check: ${isConsistent ? 'PASS' : 'FAIL'}`);
  
  console.log('\n📅 Different day configurations:');
  
  const configs = [
    { days: 3, name: '3 days' },
    { days: 14, name: '14 days' },
    { days: 30, name: '30 days' }
  ];
  
  configs.forEach(config => {
    const result = fillMissingMetrics(exampleData, config.days);
    console.log(`${config.name}: Generated ${result.length} records`);
    console.log(`  Date range: ${formatDate(result[0]!.date)} to ${formatDate(result[result.length - 1]!.date)}`);
  });
}

function performanceDemo() {
  console.log('\n⚡ Performance Test Demo');
  console.log('================');
  
  function generateTestData(count: number): Metric[] {
    const data: Metric[] = [];
    const baseDate = Date.now();
    
    for (let i = 0; i < count; i++) {
      data.push({
        date: baseDate - i * MS_PER_DAY * 2, // Every 2 days
        averageLikesCount: 100 + Math.floor(Math.random() * 100),
        followersCount: 1000 + Math.floor(Math.random() * 1000),
        averageEngagementRate: 0.01 + Math.random() * 0.05
      });
    }
    
    return data.sort((a, b) => a.date - b.date);
  }
  
  const testCases = [
    { dataSize: 10, targetDays: 30, name: 'Small dataset' },
    { dataSize: 100, targetDays: 365, name: 'Medium dataset' },
    { dataSize: 1000, targetDays: 365, name: 'Large dataset' }
  ];
  
  testCases.forEach(testCase => {
    const testData = generateTestData(testCase.dataSize);
    
    console.log(`\n${testCase.name} (${testCase.dataSize} records, target ${testCase.targetDays} days):`);
    
    // Test binary search
    const binaryStart = performance.now();
    const binaryResult = fillMissingMetricsBinary(testData, testCase.targetDays);
    const binaryTime = performance.now() - binaryStart;
    
    // Test two-pointer
    const twoPointerStart = performance.now();
    const twoPointerResult = fillMissingMetricsTwoPointers(testData, testCase.targetDays);
    const twoPointerTime = performance.now() - twoPointerStart;
    
    // Test auto selection
    const autoStart = performance.now();
    const autoResult = fillMissingMetrics(testData, testCase.targetDays);
    const autoTime = performance.now() - autoStart;
    
    console.log(`  Binary search: ${binaryTime.toFixed(2)}ms`);
    console.log(`  Two-pointer: ${twoPointerTime.toFixed(2)}ms`);
    console.log(`  Auto selection: ${autoTime.toFixed(2)}ms`);
    console.log(`  Result length: ${autoResult.length}`);
    
    // Verify consistency
    const consistent = JSON.stringify(binaryResult) === JSON.stringify(twoPointerResult) &&
                      JSON.stringify(twoPointerResult) === JSON.stringify(autoResult);
    console.log(`  Consistent: ${consistent ? '✅' : '❌'}`);
  });
}

// Run demo
if (require.main === module) {
  demonstrateAlgorithm();
  performanceDemo();
} 