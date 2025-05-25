// 測試原始程式碼的實際行為
async function getPage(url) {
  console.log(`📡 正在請求: ${url}`);
  // 模擬網路請求延遲
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`頁面內容來自: ${url}`);
    }, 200); // 增加延遲以更清楚看到時序
  });
}

async function getYoutubeData(youtubeIds) {
  console.log('🚀 開始執行 getYoutubeData');
  console.log(`📋 youtubeIds.length = ${youtubeIds.length}`);
  
  var promises = [];
  
  for (var i = 0; i < youtubeIds.length; i++) {
    console.log(`🔄 迴圈開始: i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
    
    var promise = new Promise(async (resolve, reject) => {
      console.log(`⚡ Promise 立即開始執行: i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
      
      try {
        var channelURL = `https://www.youtube.com/${youtubeIds[i]}`;
        console.log(`🎯 準備請求 channel: ${channelURL}`);
        var channelPage = await getPage(channelURL);
        
        console.log(`⏰ channel 請求完成，現在 i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
        var videosURL = `https://www.youtube.com/${youtubeIds[i]}/videos`;
        console.log(`🎯 準備請求 videos: ${videosURL}`);
        var videosPage = await getPage(videosURL);

        resolve({ channelPage, videosPage });
      } catch (e) {
        reject(e);
      }
    });
    promises.push(promise);
    console.log(`✅ Promise 已加入陣列，繼續下一輪迴圈`);
  }
  
  console.log(`🏁 迴圈結束，最終 i = ${i}`);
  console.log(`⏳ 等待所有 Promise 完成...`);
  
  var results = await Promise.all(promises);
  return results;
}

// 測試
console.log('🧪 開始測試原始程式碼行為');
var youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];
getYoutubeData(youtubeIds).then(results => {
  console.log('🎉 最終結果:', results.map(r => ({
    channel: r.channelPage.substring(0, 50) + '...',
    videos: r.videosPage.substring(0, 50) + '...'
  })));
}).catch(error => {
  console.error('❌ 錯誤:', error);
}); 