import { blogPosts } from './data';
import queuedSeoArticles from './data/seoQueue.json';
import releaseState from './data/seoRelease.json';

/**
 * Only articles explicitly marked released are visible to the static build.
 * Unpublished drafts never receive a route, sitemap entry, RSS item or blog card.
 */
const publishedSlugs = new Set<string>(releaseState.published);
export const publishedSeoArticles = queuedSeoArticles.filter(post => publishedSlugs.has(post.slug));
export const seoArticlesBySlug = new Map(publishedSeoArticles.map(post => [post.slug, post]));

export const allPublishedBlogPosts = [...blogPosts, ...publishedSeoArticles]
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
