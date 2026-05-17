import { prisma } from "@/lib/prisma";
import { fallbackSlug } from "@/lib/slugs";

export const DEFAULT_CATEGORIES = [
  "Love",
  "Life",
  "Laughter",
  "Systems",
  "Software Engineering",
  "Business",
  "Family",
  "Culture",
];

export async function getPrimaryCreator() {
  const existing = await prisma.creator.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.creator.create({
    data: {
      name: "D•sonofSolomon",
      slug: fallbackSlug("dsonofsolomon"),
      bio: "Love, life, laughter and systems.",
      heroImage: "/admin-hero-sample.svg",
      heroImageAlt: "D•sonofSolomon hero cover",
      heroEyebrow: "Personal Writing System",
      heroTitle: "D•sonofSolomon",
      heroSubtitle: "Love, life, laughter and systems.",
      currentWorkingOn: "The D•sonofSolomon writing system.",
    },
  });
}

export async function ensureDefaultCategories() {
  const creator = await getPrimaryCreator();

  for (const name of DEFAULT_CATEGORIES) {
    const slug = fallbackSlug(name, "category");

    await prisma.category.upsert({
      where: {
        creatorId_slug: {
          creatorId: creator.id,
          slug,
        },
      },
      update: {
        name,
      },
      create: {
        name,
        slug,
        creatorId: creator.id,
      },
    });
  }

  return prisma.category.findMany({
    where: {
      creatorId: creator.id,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getUniquePostSlug(
  creatorId: string,
  source: string,
  excludePostId?: string
) {
  const base = fallbackSlug(source);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        creatorId,
        slug: candidate,
        ...(excludePostId ? { id: { not: excludePostId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
