import { blogPosts } from './data';
import queuedSeoArticles from './data/seoQueue.json';
import seoRelease from './data/seoRelease.json';
import evergreenRelease from './data/evergreenRelease.json';
import { evergreenArticles } from './evergreenArticles';

const annotate = (post, publishedAt) => {
  const actual = publishedAt?.[post.slug] || post.date;
  return { ...post, date: actual, updated: actual };
};
const publishedOriginalSet = new Set<string>(seoRelease.published);
const publishedEvergreenSet = new Set<string>(evergreenRelease.published);

/** Only released articles receive static routes, RSS entries or sitemap links. */
export const publishedSeoArticles = [
  ...queuedSeoArticles.filter(post => publishedOriginalSet.has(post.slug)).map(post => annotate(post, seoRelease.publishedAt)),
  ...evergreenArticles.filter(post => publishedEvergreenSet.has(post.slug)).map(post => annotate(post, evergreenRelease.publishedAt))
];
export const seoArticlesBySlug = new Map(publishedSeoArticles.map(post => [post.slug, post]));
export const allPublishedBlogPosts = [...blogPosts, ...publishedSeoArticles]
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
