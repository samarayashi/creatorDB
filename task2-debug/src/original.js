/**
 * 原始問題程式碼
 * 此檔案包含需要 debug 的原始程式碼
 */

async function getPage(url) {
  var response = await fetch(url);
  var data = await response.text();
  return data;
}

async function getYoutubeData(youtubeIds) {
  var promises = [];
  for (var i = 0; i < youtubeIds.length; i++) {
    var promise = new Promise(async (resolve, reject) => {
      try {
        var channelURL = `https://www.youtube.com/${youtubeIds[i]}`;
        var channelPage = await getPage(channelURL);

        var videosURL = `https://www.youtube.com/${youtubeIds[i]}/videos`;
        var videosPage = await getPage(videosURL);

        resolve({ channelPage, videosPage });
      } catch (e) {
        reject(e);
      }
    });
    promises.push(promise);
  }
  var results = await Promise.all(promises);
  return results;
}

// 測試用的 YouTube ID
var youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];

// 執行函式（但會有問題）
getYoutubeData(youtubeIds)
  .then(results => {
    console.log('Results:', results);
  })
  .catch(error => {
    console.error('Error:', error);
  }); 