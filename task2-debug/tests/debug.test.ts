/**
 * Task 2 Debug Tests
 * Tests parallelization and error handling of the fixed version
 */

import { getYoutubeData } from '../src/fixed';

// Mock fetch to avoid actual network requests
global.fetch = jest.fn();

describe('Task 2 - Debug Fix Tests (Parallelization + Error Handling)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Fixed version should correctly handle YouTube IDs', async () => {
    // Mock fetch responses - large valid pages
    const validPageContent = '<html>' + 'x'.repeat(50000) + '</html>'; 
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      text: async () => validPageContent,
    } as Response);

    const youtubeIds = ['@test1', '@test2'];
    const results = await getYoutubeData(youtubeIds);

    // Verify results
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      id: '@test1',
      channelPage: validPageContent,
      videosPage: validPageContent,
    });
    expect(results[1]).toEqual({
      id: '@test2',
      channelPage: validPageContent,
      videosPage: validPageContent,
    });

    // Verify fetch was called correctly (parallelization)
    expect(fetch).toHaveBeenCalledTimes(4); // 2 IDs × 2 pages
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test1');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test1/videos');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test2');
    expect(fetch).toHaveBeenCalledWith('https://www.youtube.com/@test2/videos');
  });

  test('Should handle empty arrays', async () => {
    const results = await getYoutubeData([]);
    expect(results).toEqual([]);
  });

  test('Should correctly handle partial failures (error handling)', async () => {
    const validPageContent = '<html>' + 'x'.repeat(50000) + '</html>';
    
    // Mock partial request failures
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockImplementation((url) => {
        const urlString = url.toString();
        if (urlString.includes('@success')) {
          return Promise.resolve({ text: () => Promise.resolve(validPageContent) } as Response);
        } else {
          return Promise.reject(new Error('Network error'));
        }
      });

    const youtubeIds = ['@success', '@fail'];
    const results = await getYoutubeData(youtubeIds);

    // Verify results
    expect(results).toHaveLength(2);
    
    // First should be successful
    expect(results[0]).toEqual({
      id: '@success',
      channelPage: validPageContent,
      videosPage: validPageContent,
    });
    
    // Second should be failed but not affect overall
    expect(results[1]).toEqual({
      id: '@fail',
      error: 'Network error',
      channelPage: undefined,
      videosPage: undefined,
    });
  });

  test('Should correctly identify 404 error pages', async () => {
    // Mock 404 error page
    const error404Page = '<html><title>404 Not Found</title><body>Page not found</body></html>';
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      text: () => Promise.resolve(error404Page)
    } as Response);

    const youtubeIds = ['invalid_channel'];
    const results = await getYoutubeData(youtubeIds);

    // Verify results
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: 'invalid_channel',
      error: 'Invalid YouTube channel (404 Not Found)',
      channelPage: undefined,
      videosPage: undefined,
    });
  });

  test('Should handle all requests failing', async () => {
    // Mock all requests failing
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const youtubeIds = ['@fail1', '@fail2'];
    const results = await getYoutubeData(youtubeIds);

    // Verify results
    expect(results).toHaveLength(2);
    results.forEach((result, index) => {
      expect(result.id).toBe(youtubeIds[index]);
      expect(result.error).toBe('Network error');
      expect(result.channelPage).toBeUndefined();
      expect(result.videosPage).toBeUndefined();
    });
  });

});