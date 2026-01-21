import fetch from 'node-fetch';

async function generateDailyBlogs() {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';
  
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    process.exit(1);
  }
  
  console.log(`[Blog Generator] Starting daily blog generation...`);
  console.log(`[Blog Generator] Target URL: ${baseUrl}/api/cron/generate-blogs`);
  
  try {
    const response = await fetch(`${baseUrl}/api/cron/generate-blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret
      },
      body: JSON.stringify({ count: 5 })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`[Blog Generator] Failed: ${response.status} - ${error}`);
      process.exit(1);
    }
    
    const result = await response.json();
    console.log(`[Blog Generator] Success! Generated ${result.count} new blog posts`);
    console.log(`[Blog Generator] Posts:`, result.posts?.map((p: any) => p.title).join(', '));
    
  } catch (error) {
    console.error('[Blog Generator] Error:', error);
    process.exit(1);
  }
}

generateDailyBlogs();
