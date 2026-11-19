import { blogPosts } from './data';
import queuedSeoArticles from './data/seoQueue.json';
import seoRelease from './data/seoRelease.json';
import evergreenRelease from './data/evergreenRelease.json';
import { evergreenArticles } from './evergreenArticles';
import year3Release from './data/year3Release.json';
import { year3Articles } from './year3Articles';

const annotate = (post, publishedAt) => {
  const actual = publishedAt?.[post.slug] || post.date;
  return { ...post, date: actual, updated: actual };
};
const publishedOriginalSet = new Set<string>(seoRelease.published);
const publishedEvergreenSet = new Set<string>(evergreenRelease.published);
const publishedYear3Set = new Set<string>(year3Release.published);

/** Only released articles receive static routes, RSS entries or sitemap links. */
export const publishedSeoArticles = [
  ...queuedSeoArticles.filter(post => publishedOriginalSet.has(post.slug)).map(post => annotate(post, seoRelease.publishedAt)),
  ...evergreenArticles.filter(post => publishedEvergreenSet.has(post.slug)).map(post => annotate(post, evergreenRelease.publishedAt)),
  ...year3Articles.filter(post => publishedYear3Set.has(post.slug)).map(post => annotate(post, year3Release.publishedAt))
];
export const seoArticlesBySlug = new Map(publishedSeoArticles.map(post => [post.slug, post]));
export const allPublishedBlogPosts = [...blogPosts, ...publishedSeoArticles]
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
