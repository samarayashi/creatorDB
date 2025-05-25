/**
 * 執行示例 - 展示修正版本的使用
 * 包含真實網路請求和模擬錯誤情況的示例
 */

import { getYoutubeData } from './fixed';

console.log('🎯 Task 2 - JavaScript 非同步程式碼 Debug 示例');
console.log('=' .repeat(60));

// 示例 1：正常執行（真實網路請求）
async function runRealExample(): Promise<void> {
  console.log('\n📡 示例 1: 真實網路請求');
  console.log('-' .repeat(40));
  
  const youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];
  
  try {
    console.log('🔧 執行修正版本（並行化 + 容錯）...');
    console.log('📋 處理的 YouTube IDs:', youtubeIds);
    
    const startTime = Date.now();
    const results = await getYoutubeData(youtubeIds);
    const endTime = Date.now();
    
    console.log('✅ 處理完成，結果如下:');
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.id}: 失敗 - ${result.error}`);
      } else {
        console.log(`✅ ${result.id}: 成功`);
        console.log(`   - 頻道頁面長度: ${result.channelPage!.length.toLocaleString()} 字元`);
        console.log(`   - 影片頁面長度: ${result.videosPage!.length.toLocaleString()} 字元`);
      }
    });

    // 統計結果
    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;
    const totalTime = endTime - startTime;
    
    console.log(`\n📊 統計:`);
    console.log(`   - 成功: ${successCount} 個`);
    console.log(`   - 失敗: ${failCount} 個`);
    console.log(`   - 總耗時: ${totalTime}ms`);
    console.log(`   - 平均每個 ID: ${Math.round(totalTime / youtubeIds.length)}ms`);
    
  } catch (error) {
    console.error('❌ 執行失敗:', error);
  }
}

// 示例 2：模擬錯誤情況（包含無效的 YouTube ID）
async function runErrorExample(): Promise<void> {
  console.log('\n🚨 示例 2: 容錯機制測試');
  console.log('-' .repeat(40));
  
  // 混合有效和無效的 YouTube ID
  const mixedIds = ['@darbbq', 'invalid_channel_12345', '@oojimateru'];
  
  try {
    console.log('🔧 測試容錯機制...');
    console.log('📋 處理的 YouTube IDs（包含無效 ID）:', mixedIds);
    
    const results = await getYoutubeData(mixedIds);
    
    console.log('✅ 處理完成，容錯機制運作正常:');
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.id}: 失敗 - ${result.error}`);
      } else {
        console.log(`✅ ${result.id}: 成功`);
        console.log(`   - 頻道頁面長度: ${result.channelPage!.length.toLocaleString()} 字元`);
        console.log(`   - 影片頁面長度: ${result.videosPage!.length.toLocaleString()} 字元`);
      }
    });

    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;
    
    console.log(`\n📊 容錯測試結果:`);
    console.log(`   - 成功: ${successCount} 個（部分失敗不影響其他請求）`);
    console.log(`   - 失敗: ${failCount} 個（錯誤被正確捕獲和處理）`);
    
  } catch (error) {
    console.error('❌ 執行失敗:', error);
  }
}

// 示例 3：空陣列測試
async function runEmptyArrayExample(): Promise<void> {
  console.log('\n📝 示例 3: 邊界條件測試');
  console.log('-' .repeat(40));
  
  try {
    console.log('🔧 測試空陣列處理...');
    const results = await getYoutubeData([]);
    console.log('✅ 空陣列處理正常，結果:', results);
    console.log(`📊 結果長度: ${results.length}`);
    
  } catch (error) {
    console.error('❌ 空陣列測試失敗:', error);
  }
}

// 主執行函式
async function main(): Promise<void> {
  try {
    // 執行所有示例
    await runRealExample();
    await runErrorExample();
    await runEmptyArrayExample();
    
    console.log('\n🎉 所有示例執行完成！');
    console.log('\n💡 重點展示:');
    console.log('   ✅ 修正了 var 作用域問題');
    console.log('   ✅ 實現了並行化處理');
    console.log('   ✅ 加入了容錯機制');
    console.log('   ✅ 加入了 404 錯誤檢測');
    console.log('   ✅ 提供了清晰的錯誤追蹤');
    
  } catch (error) {
    console.error('❌ 主程式執行失敗:', error);
  }
}

// 執行主函式
if (require.main === module) {
  main().catch(console.error);
}

export { runRealExample, runErrorExample, runEmptyArrayExample }; 