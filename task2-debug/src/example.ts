/**
 * Execution Examples - Demonstrates usage of the fixed version
 * Includes real network requests and error simulation examples
 */

import { getYoutubeData } from './fixed';

console.log('🎯 Task 2 - JavaScript Async Code Debug Examples');
console.log('=' .repeat(60));

// Example 1: Normal execution (real network requests)
async function runRealExample(): Promise<void> {
  console.log('\n📡 Example 1: Real Network Requests');
  console.log('-' .repeat(40));
  
  const youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];
  
  try {
    console.log('🔧 Running fixed version (parallelized + error handling)...');
    console.log('📋 Processing YouTube IDs:', youtubeIds);
    
    const startTime = Date.now();
    const results = await getYoutubeData(youtubeIds);
    const endTime = Date.now();
    
    console.log('✅ Processing complete, results:');
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.id}: Failed - ${result.error}`);
      } else {
        console.log(`✅ ${result.id}: Success`);
        console.log(`   - Channel page length: ${result.channelPage!.length.toLocaleString()} chars`);
        console.log(`   - Videos page length: ${result.videosPage!.length.toLocaleString()} chars`);
      }
    });

    // Statistics
    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;
    const totalTime = endTime - startTime;
    
    console.log(`\n📊 Statistics:`);
    console.log(`   - Success: ${successCount} IDs`);
    console.log(`   - Failed: ${failCount} IDs`);
    console.log(`   - Total time: ${totalTime}ms`);
    console.log(`   - Average per ID: ${Math.round(totalTime / youtubeIds.length)}ms`);
    
  } catch (error) {
    console.error('❌ Execution failed:', error);
  }
}

// Example 2: Error handling test (includes invalid YouTube IDs)
async function runErrorExample(): Promise<void> {
  console.log('\n🚨 Example 2: Error Handling Test');
  console.log('-' .repeat(40));
  
  // Mix of valid and invalid YouTube IDs
  const mixedIds = ['@darbbq', 'invalid_channel_12345', '@oojimateru'];
  
  try {
    console.log('🔧 Testing error handling...');
    console.log('📋 Processing YouTube IDs (including invalid):', mixedIds);
    
    const results = await getYoutubeData(mixedIds);
    
    console.log('✅ Processing complete, error handling working:');
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.id}: Failed - ${result.error}`);
      } else {
        console.log(`✅ ${result.id}: Success`);
        console.log(`   - Channel page length: ${result.channelPage!.length.toLocaleString()} chars`);
        console.log(`   - Videos page length: ${result.videosPage!.length.toLocaleString()} chars`);
      }
    });

    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;
    
    console.log(`\n📊 Error handling test results:`);
    console.log(`   - Success: ${successCount} IDs (partial failures don't affect others)`);
    console.log(`   - Failed: ${failCount} IDs (errors properly caught and handled)`);
    
  } catch (error) {
    console.error('❌ Execution failed:', error);
  }
}

// Example 3: Empty array test
async function runEmptyArrayExample(): Promise<void> {
  console.log('\n📝 Example 3: Edge Case Test');
  console.log('-' .repeat(40));
  
  try {
    console.log('🔧 Testing empty array handling...');
    const results = await getYoutubeData([]);
    console.log('✅ Empty array handled correctly, result:', results);
    console.log(`📊 Result length: ${results.length}`);
    
  } catch (error) {
    console.error('❌ Empty array test failed:', error);
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    // Run all examples
    await runRealExample();
    await runErrorExample();
    await runEmptyArrayExample();
    
    console.log('\n🎉 All examples completed!');
    console.log('\n💡 Key improvements demonstrated:');
    console.log('   ✅ Fixed var scope issue');
    console.log('   ✅ Implemented parallelization');
    console.log('   ✅ Added error handling');
    console.log('   ✅ Added 404 error detection');
    console.log('   ✅ Provided clear error tracking');
    
  } catch (error) {
    console.error('❌ Main execution failed:', error);
  }
}

// Execute main function
if (require.main === module) {
  main().catch(console.error);
}

export { runRealExample, runErrorExample, runEmptyArrayExample }; 