import { db } from "../server/db";
import { blogPosts } from "../shared/schema";
import { generateBackdatedPosts } from "../server/blogGenerator";

async function seedBlogs() {
  console.log("Starting blog seeding: 20 posts over 30 days...");
  
  try {
    const posts = await generateBackdatedPosts(20, 1, 30);
    
    console.log(`Generated ${posts.length} validated posts. Inserting into database...`);
    
    let insertedCount = 0;
    for (const post of posts) {
      try {
        await db.insert(blogPosts).values({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          metaKeywords: post.metaKeywords,
          readingTime: post.readingTime,
          author: post.author,
          authorBio: post.authorBio,
          publishedAt: post.publishedAt,
          isFeatured: post.isFeatured,
          isPublished: true,
        });
        insertedCount++;
        console.log(`Inserted: ${post.title} (${post.publishedAt.toDateString()})`);
      } catch (insertError) {
        console.error(`Failed to insert "${post.title}":`, insertError);
      }
    }
    
    console.log(`\nComplete! ${insertedCount} posts inserted successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Blog seeding failed:", error);
    process.exit(1);
  }
}

seedBlogs();
