/**
 * 修正版本 - JavaScript 非同步程式碼 Debug
 * 解決原始程式碼中的 var 作用域問題和不必要的 Promise 包裝
 * 加入並行化處理和容錯機制
 */

// 輔助函式：取得網頁內容
async function getPage(url: string): Promise<string> {
  const response = await fetch(url);
  const data = await response.text();
  return data;
}

// 輔助函式：檢查是否為有效的 YouTube 頁面
function isValidYoutubePage(content: string): boolean {
  // 檢查是否為 404 錯誤頁面
  if (content.includes('404 Not Found') || content.includes('/error?src=404')) {
    return false;
  }
  
  return true;
}

// 定義回傳結果的型別
interface YoutubeDataResult {
  id: string;
  channelPage?: string;
  videosPage?: string;
  error?: string;
}

// 修正後的主函式 - 加入並行化和容錯處理
async function getYoutubeData(youtubeIds: string[]): Promise<YoutubeDataResult[]> {
  // ✅ 使用 map() 替代 for 迴圈，避免 var 作用域問題
  const promises = youtubeIds.map(async (id): Promise<YoutubeDataResult> => {
    try {
      const channelURL = `https://www.youtube.com/${id}`;
      const videosURL = `https://www.youtube.com/${id}/videos`;

      // ✅ 並行執行兩個請求，提高效率
      const [channelPage, videosPage] = await Promise.all([
        getPage(channelURL),
        getPage(videosURL),
      ]);

      // ✅ 檢查回傳內容是否為有效的 YouTube 頁面
      if (!isValidYoutubePage(channelPage)) {
        return { id, error: 'Invalid YouTube channel (404 Not Found)' };
      }
      
      if (!isValidYoutubePage(videosPage)) {
        return { id, error: 'Invalid YouTube videos page (404 Not Found)' };
      }

      return { id, channelPage, videosPage };
    } catch (error) {
      // ✅ 個別錯誤處理，避免單點失敗影響整體
      return { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // ✅ 直接使用 Promise.all()，因為每個 Promise 都有內部錯誤處理
  return await Promise.all(promises);
}

export { getPage, getYoutubeData, YoutubeDataResult, isValidYoutubePage }; 