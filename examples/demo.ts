import {
  fillMissingMetrics,
  fillMissingMetricsBinary,
  fillMissingMetricsTwoPointers,
  Metric,
  MS_PER_DAY
} from '../src';

// 示範資料：模擬題目中的範例
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
  return new Date(timestamp).toISOString().split('T')[0];
}

function printMetrics(metrics: Metric[], title: string) {
  console.log(`\n=== ${title} ===`);
  console.log('日期\t\t按讚數\t追蹤者\t互動率');
  console.log('----------------------------------------');
  
  metrics.forEach(metric => {
    console.log(
      `${formatDate(metric.date)}\t${metric.averageLikesCount}\t${metric.followersCount}\t${metric.averageEngagementRate.toFixed(3)}`
    );
  });
}

function demonstrateAlgorithm() {
  console.log('🚀 填補缺失每日指標演算法示範');
  console.log('=====================================');
  
  // 顯示原始資料
  printMetrics(exampleData, '原始資料（有缺失）');
  
  // 使用自動選擇演算法
  console.log('\n📊 使用自動演算法選擇：');
  const autoResult = fillMissingMetrics(exampleData);
  printMetrics(autoResult, '自動填補結果');
  
  // 使用二分查找
  console.log('\n🔍 使用二分查找演算法：');
  const binaryResult = fillMissingMetricsBinary(exampleData);
  printMetrics(binaryResult, '二分查找結果');
  
  // 使用雙指針
  console.log('\n👆 使用雙指針演算法：');
  const twoPointerResult = fillMissingMetricsTwoPointers(exampleData);
  printMetrics(twoPointerResult, '雙指針結果');
  
  // 驗證結果一致性
  const isConsistent = JSON.stringify(autoResult) === JSON.stringify(binaryResult) &&
                      JSON.stringify(binaryResult) === JSON.stringify(twoPointerResult);
  
  console.log(`\n✅ 演算法結果一致性檢查：${isConsistent ? '通過' : '失敗'}`);
  
  // 展示不同天數的配置
  console.log('\n📅 不同天數配置示範：');
  
  const configs = [
    { days: 3, name: '3天' },
    { days: 14, name: '14天' },
    { days: 30, name: '30天' }
  ];
  
  configs.forEach(config => {
    const result = fillMissingMetrics(exampleData, config.days);
    console.log(`${config.name}：生成 ${result.length} 筆資料`);
    console.log(`  日期範圍：${formatDate(result[0]!.date)} 到 ${formatDate(result[result.length - 1]!.date)}`);
  });
}

function performanceDemo() {
  console.log('\n⚡ 效能測試示範');
  console.log('================');
  
  // 生成大量測試資料
  function generateTestData(count: number): Metric[] {
    const data: Metric[] = [];
    const baseDate = Date.now();
    
    for (let i = 0; i < count; i++) {
      data.push({
        date: baseDate - i * MS_PER_DAY * 2, // 每隔兩天一筆資料
        averageLikesCount: 100 + Math.floor(Math.random() * 100),
        followersCount: 1000 + Math.floor(Math.random() * 1000),
        averageEngagementRate: 0.01 + Math.random() * 0.05
      });
    }
    
    return data.sort((a, b) => a.date - b.date);
  }
  
  const testCases = [
    { dataSize: 10, targetDays: 30, name: '小資料集' },
    { dataSize: 100, targetDays: 365, name: '中等資料集' },
    { dataSize: 1000, targetDays: 365, name: '大資料集' }
  ];
  
  testCases.forEach(testCase => {
    const testData = generateTestData(testCase.dataSize);
    
    console.log(`\n${testCase.name}（${testCase.dataSize} 筆資料，目標 ${testCase.targetDays} 天）：`);
    
    // 測試二分查找
    const binaryStart = performance.now();
    const binaryResult = fillMissingMetricsBinary(testData, testCase.targetDays);
    const binaryTime = performance.now() - binaryStart;
    
    // 測試雙指針
    const twoPointerStart = performance.now();
    const twoPointerResult = fillMissingMetricsTwoPointers(testData, testCase.targetDays);
    const twoPointerTime = performance.now() - twoPointerStart;
    
    // 測試自動選擇
    const autoStart = performance.now();
    const autoResult = fillMissingMetrics(testData, testCase.targetDays);
    const autoTime = performance.now() - autoStart;
    
    console.log(`  二分查找：${binaryTime.toFixed(2)}ms`);
    console.log(`  雙指針：${twoPointerTime.toFixed(2)}ms`);
    console.log(`  自動選擇：${autoTime.toFixed(2)}ms`);
    console.log(`  結果長度：${autoResult.length}`);
    
    // 驗證結果一致性
    const consistent = JSON.stringify(binaryResult) === JSON.stringify(twoPointerResult) &&
                      JSON.stringify(twoPointerResult) === JSON.stringify(autoResult);
    console.log(`  結果一致：${consistent ? '✅' : '❌'}`);
  });
}

// 執行示範
if (require.main === module) {
  demonstrateAlgorithm();
  performanceDemo();
} 