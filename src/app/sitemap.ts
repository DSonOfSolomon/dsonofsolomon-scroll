import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, seriesList, seriesEpisodes] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "published",
        universe: "public",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    }),
    prisma.series.findMany({
      where: {
        posts: {
          some: {
            status: "published",
            universe: "series",
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.post.findMany({
      where: {
        status: "published",
        universe: "series",
        seriesId: {
          not: null,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        series: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/writings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/series`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/writings/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = seriesList.map((series) => ({
    url: `${SITE_URL}/series/${series.slug}`,
    lastModified: series.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const seriesEpisodeRoutes: MetadataRoute.Sitemap = seriesEpisodes
    .filter((post) => post.series)
    .map((post) => ({
      url: `${SITE_URL}/series/${post.series?.slug}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...seriesRoutes,
    ...seriesEpisodeRoutes,
  ];
}
