/**
 * Task 2 Debug 測試
 * 測試修正版本的並行化和容錯機制
 */

import { getYoutubeData, isValidYoutubePage } from '../src/fixed';

// Mock fetch 來避免實際網路請求
global.fetch = jest.fn();

describe('Task 2 - Debug 修正測試（並行化 + 容錯）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('修正版本應該正確處理 YouTube IDs', async () => {
    // 模擬 fetch 回應 - 大型有效頁面
    const validPageContent = '<html>' + 'x'.repeat(50000) + '</html>'; // 大於 10000 字元
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      text: () => Promise.resolve(validPageContent)
    } as Response);

    const youtubeIds = ['@test1', '@test2'];
    const results = await getYoutubeData(youtubeIds);

    // 驗證結果
    expect(results).toHaveLength(2);
    expect(results[0]!.id).toBe('@test1');
    expect(results[0]!.error).toBeUndefined();
    expect(results[0]!.channelPage).toBeDefined();
    expect(results[0]!.videosPage).toBeDefined();
    
    expect(results[1]!.id).toBe('@test2');
    expect(results[1]!.error).toBeUndefined();
    expect(results[1]!.channelPage).toBeDefined();
    expect(results[1]!.videosPage).toBeDefined();

    // 驗證 fetch 被正確呼叫（並行化）
    expect(fetch).toHaveBeenCalledTimes(4); // 2 個 ID × 2 個頁面
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test1');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test1/videos');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test2');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test2/videos');
  });

  test('應該處理空陣列', async () => {
    const results = await getYoutubeData([]);
    expect(results).toHaveLength(0);
  });

  test('應該正確處理部分失敗的情況（容錯機制）', async () => {
    const validPageContent = '<html>' + 'x'.repeat(50000) + '</html>';
    
    // 模擬部分請求失敗
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        text: () => Promise.resolve(validPageContent)
      } as Response)
      .mockResolvedValueOnce({
        text: () => Promise.resolve(validPageContent)
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const youtubeIds = ['@success', '@fail'];
    const results = await getYoutubeData(youtubeIds);

    // 驗證結果
    expect(results).toHaveLength(2);
    
    // 第一個應該成功
    expect(results[0]!.id).toBe('@success');
    expect(results[0]!.error).toBeUndefined();
    expect(results[0]!.channelPage).toBeDefined();
    expect(results[0]!.videosPage).toBeDefined();
    
    // 第二個應該失敗但不影響整體
    expect(results[1]!.id).toBe('@fail');
    expect(results[1]!.error).toBeDefined();
    expect(results[1]!.channelPage).toBeUndefined();
    expect(results[1]!.videosPage).toBeUndefined();
  });

  test('應該正確識別 404 錯誤頁面', async () => {
    // 模擬 404 錯誤頁面
    const error404Page = '<html><title>404 Not Found</title><body>Page not found</body></html>';
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      text: () => Promise.resolve(error404Page)
    } as Response);

    const youtubeIds = ['invalid_channel'];
    const results = await getYoutubeData(youtubeIds);

    // 驗證結果
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('invalid_channel');
    expect(results[0]!.error).toBe('Invalid YouTube channel (404 Not Found)');
    expect(results[0]!.channelPage).toBeUndefined();
    expect(results[0]!.videosPage).toBeUndefined();
  });

  test('應該處理所有請求都失敗的情況', async () => {
    // 模擬所有請求都失敗
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const youtubeIds = ['@fail1', '@fail2'];
    const results = await getYoutubeData(youtubeIds);

    // 驗證結果
    expect(results).toHaveLength(2);
    results.forEach((result, index) => {
      expect(result.id).toBe(youtubeIds[index]);
      expect(result.error).toBe('Network error');
      expect(result.channelPage).toBeUndefined();
      expect(result.videosPage).toBeUndefined();
    });
  });

  test('驗證並行化：每個 ID 的兩個請求應該並行執行', async () => {
    // 模擬 fetch 回應
    const validPageContent = '<html>' + 'x'.repeat(50000) + '</html>';
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      text: () => Promise.resolve(validPageContent)
    } as Response);

    const youtubeIds = ['@test'];
    await getYoutubeData(youtubeIds);

    // 驗證 fetch 呼叫順序（並行化的證據）
    const calls = (fetch as jest.MockedFunction<typeof fetch>).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0]![0]).toBe('https://www.youtube.com/@test');
    expect(calls[1]![0]).toBe('https://www.youtube.com/@test/videos');
  });

  // 新增：測試內容驗證函式
  describe('isValidYoutubePage', () => {
    test('應該識別有效的 YouTube 頁面', () => {
      const validPage = '<html>' + 'x'.repeat(50000) + '</html>';
      expect(isValidYoutubePage(validPage)).toBe(true);
    });

    test('應該識別 404 錯誤頁面', () => {
      const error404Page = '<html><title>404 Not Found</title></html>';
      expect(isValidYoutubePage(error404Page)).toBe(false);
    });

    test('應該識別包含錯誤 URL 的頁面', () => {
      const errorPage = '<html><iframe src="/error?src=404"></iframe></html>';
      expect(isValidYoutubePage(errorPage)).toBe(false);
    });

    test('應該識別過小的頁面', () => {
      const smallPage = '<html>small page</html>';
      expect(isValidYoutubePage(smallPage)).toBe(false);
    });
  });
});