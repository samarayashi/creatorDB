// Test original code behavior
function mockGetPage(url) {
  console.log(`📡 Requesting: ${url}`);
  // Simulate network request delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Page content from: ${url}`);
    }, 200); // Add delay to clearly see timing
  });
}

async function getYoutubeData(youtubeIds) {
  console.log('🚀 Starting getYoutubeData execution');
  
  const promises = [];
  
  for (var i = 0; i < youtubeIds.length; i++) {
    console.log(`🔄 Loop start: i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
    
    promises.push(new Promise(async (resolve) => {
      console.log(`⚡ Promise starts immediately: i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
      
      const channelURL = `https://www.youtube.com/${youtubeIds[i]}`;
      console.log(`🎯 Preparing channel request: ${channelURL}`);
      const channelPage = await mockGetPage(channelURL);
      
      console.log(`⏰ Channel request complete, now i = ${i}, youtubeIds[${i}] = ${youtubeIds[i]}`);
      const videosURL = `https://www.youtube.com/${youtubeIds[i]}/videos`;
      console.log(`🎯 Preparing videos request: ${videosURL}`);
      const videosPage = await mockGetPage(videosURL);
      
      resolve({
        id: youtubeIds[i],
        channelPage,
        videosPage,
      });
    }));
    
    console.log(`✅ Promise added to array, continuing to next iteration`);
  }
  
  console.log(`🏁 Loop ended, final i = ${i}`);
  console.log(`⏳ Waiting for all Promises to complete...`);
  
  const results = await Promise.all(promises);
  return results;
}

// Test
console.log('🧪 Starting original code behavior test');
getYoutubeData(['@test1', '@test2', '@test3'])
  .then(results => {
    console.log('\n📊 Final results:');
    results.forEach((result, index) => {
      console.log(`Result ${index}:`, {
        id: result.id,
        channelURL: result.channelPage?.split(': ')[1] || 'undefined',
        videosURL: result.videosPage?.split(': ')[1] || 'undefined'
      });
    });
  })
  .catch(console.error); 