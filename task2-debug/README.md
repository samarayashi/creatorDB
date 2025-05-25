# Task 2 - Debug

## 任務描述

幫助除錯以下程式碼，並解釋為什麼會有問題：

```javascript
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

var youtubeIds = ['@darbbq', '@oojimateru', '@homemeat_clip'];
getYoutubeData(youtubeIds);
```

## 待實作

- [ ] 分析程式碼問題
- [ ] 提供修正版本
- [ ] 解釋問題原因和解決方案 