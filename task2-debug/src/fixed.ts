/**
 * Fixed version - JavaScript Async Code Debug
 * Solves var scope issues and unnecessary Promise wrapping in original code
 * Adds parallelization and error handling
 */


async function getPage(url: string): Promise<string> {
  const response = await fetch(url);
  const data = await response.text();
  return data;
}


function isValidYoutubePage(content: string): boolean {

  if (content.includes('404 Not Found') || content.includes('/error?src=404')) {
    return false;
  }
  
  return true;
}


interface YoutubeDataResult {
  id: string;
  channelPage?: string;
  videosPage?: string;
  error?: string;
}

async function getYoutubeData(youtubeIds: string[]): Promise<YoutubeDataResult[]> {
  const promises = youtubeIds.map(async (id): Promise<YoutubeDataResult> => {
    try {
      const channelURL = `https://www.youtube.com/${id}`;
      const videosURL = `https://www.youtube.com/${id}/videos`;

      const [channelPage, videosPage] = await Promise.all([
        getPage(channelURL),
        getPage(videosURL),
      ]);

      if (!isValidYoutubePage(channelPage)) {
        return { id, error: 'Invalid YouTube channel (404 Not Found)' };
      }
      
      if (!isValidYoutubePage(videosPage)) {
        return { id, error: 'Invalid YouTube videos page (404 Not Found)' };
      }

      return { id, channelPage, videosPage };
    } catch (error) {
      return { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  return await Promise.all(promises);
}

export { getPage, getYoutubeData, YoutubeDataResult, isValidYoutubePage }; 