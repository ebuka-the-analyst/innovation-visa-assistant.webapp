// Daily blog generation cron script
// Calls the production API to generate new blog posts

async function generateDailyBlogs() {
  const apiUrl = process.env.PRODUCTION_API_URL || 'https://innovatorfoundervisaassistant.co.uk';
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('[CRON] ERROR: CRON_SECRET environment variable not set');
    process.exit(1);
  }
  
  const endpoint = `${apiUrl}/api/cron/generate-blogs`;
  
  console.log('[CRON] Starting daily blog generation...');
  console.log(`[CRON] Target: ${endpoint}`);
  console.log(`[CRON] Time: ${new Date().toISOString()}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret
      },
      body: JSON.stringify({ count: 5 })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CRON] FAILED: HTTP ${response.status}`);
      console.error(`[CRON] Response: ${errorText}`);
      process.exit(1);
    }
    
    const result = await response.json() as { success: boolean; count: number; posts?: Array<{ title: string }> };
    
    console.log('[CRON] SUCCESS!');
    console.log(`[CRON] Generated ${result.count} new blog posts`);
    
    if (result.posts && Array.isArray(result.posts)) {
      result.posts.forEach((post, i) => {
        console.log(`[CRON]   ${i + 1}. ${post.title}`);
      });
    }
    
    console.log('[CRON] Completed at:', new Date().toISOString());
    
  } catch (error) {
    console.error('[CRON] ERROR:', error);
    process.exit(1);
  }
}

generateDailyBlogs();
