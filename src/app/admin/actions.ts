"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { recordSubscriberAnalyticsEvent } from "@/lib/analytics";
import { saveUploadedImage } from "@/lib/media";
import {
  notifyFollowersOfPublishedPost,
  sendFollowerTestNotification,
} from "@/lib/notifications";
import { createInAppNotificationsForPublishedPost } from "@/lib/inAppNotifications";
import { prisma } from "@/lib/prisma";
import { siteFeatures } from "@/lib/features";
import { enforceRateLimitForIdentifier } from "@/lib/rateLimit";
import {
  getPrimaryCreator,
  getUniquePostSlug,
} from "@/lib/admin";
import { fallbackSlug } from "@/lib/slugs";

function normalizeOptional(value: FormDataEntryValue | null) {
  const normalized = value?.toString().trim();
  return normalized ? normalized : null;
}

function normalizeRequired(value: FormDataEntryValue | null) {
  return value?.toString().trim() ?? "";
}

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = normalizeOptional(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Episode number must be a whole number greater than zero.");
  }

  return parsed;
}

function normalizeUniverse(value: FormDataEntryValue | null) {
  const requestedUniverse = normalizeRequired(value) || "public";

  if (requestedUniverse === "series") {
    return "series";
  }

  if (requestedUniverse === "unfiltered" && siteFeatures.unfilteredEnabled) {
    return "unfiltered";
  }

  return "public";
}

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";
const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD_HASH ??
    process.env.ADMIN_PASSWORD
  );
}

function getAdminSessionToken() {
  const secret = getAdminSessionSecret();
  return secret ? encodeURIComponent(secret) : null;
}

function adminSessionMatches(cookieValue: string | undefined) {
  const sessionSecret = getAdminSessionSecret();
  const sessionToken = getAdminSessionToken();

  if (!cookieValue || !sessionSecret || !sessionToken) {
    return false;
  }

  const decodedCookieValue = decodeURIComponent(cookieValue);

  return (
    cookieValue === sessionToken ||
    cookieValue === sessionSecret ||
    decodedCookieValue === sessionToken ||
    decodedCookieValue === sessionSecret
  );
}

async function refreshAdminSessionCookie() {
  const sessionToken = getAdminSessionToken();

  if (!sessionToken) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, adminCookieOptions);
}

async function isValidAdminPassword(password: string) {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (adminPasswordHash) {
    return bcrypt.compare(password, adminPasswordHash);
  }

  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

export async function loginAdmin(formData: FormData) {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identifier =
    forwardedFor ||
    headerStore.get("x-real-ip") ||
    headerStore.get("cf-connecting-ip") ||
    "admin-login";
  const limited = await enforceRateLimitForIdentifier(
    identifier,
    {
      prefix: "admin-login",
      limit: 5,
      window: "10 m",
    },
  );

  if (limited) {
    redirect("/admin/login?error=rate-limit");
  }

  const username = normalizeRequired(formData.get("username"));
  const password = normalizeRequired(formData.get("password"));
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const sessionToken = getAdminSessionToken();
  const validPassword = await isValidAdminPassword(password);

  if (
    !sessionToken ||
    username !== adminUsername ||
    !validPassword
  ) {
    redirect("/admin/login?error=1");
  }

  await refreshAdminSessionCookie();

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!adminSessionMatches(sessionCookie)) {
    redirect("/admin/login");
  }
}

async function refreshAdminViews() {
  revalidatePath("/admin", "page");
  revalidatePath("/admin/posts", "page");
  revalidatePath("/admin/followers");
  revalidatePath("/admin/letter-requests");
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/subscribe");
  revalidatePath("/writings", "page");
  revalidatePath("/series", "page");
  revalidatePath("/unfiltered");
  revalidatePath("/request-a-letter");
}

async function refreshAdminViewsSafely(context: string) {
  try {
    await refreshAdminViews();
    return true;
  } catch (error) {
    console.error(`${context} revalidation failed`, error);
    return false;
  }
}

async function revalidateSeriesPostPaths(
  postSlug: string,
  seriesId?: string | null,
) {
  revalidatePath("/series", "page");

  if (!seriesId) {
    return;
  }

  const series = await prisma.series.findUnique({
    where: {
      id: seriesId,
    },
    select: {
      slug: true,
    },
  });

  if (!series) {
    return;
  }

  revalidatePath(`/series/${series.slug}`);
  revalidatePath(`/series/${series.slug}/${postSlug}`);
}

async function revalidatePostPublicPath(
  universe: string,
  slug: string,
  seriesId?: string | null,
) {
  if (universe === "series") {
    await revalidateSeriesPostPaths(slug, seriesId);
    return;
  }

  revalidatePath(
    universe === "public" ? `/writings/${slug}` : `/unfiltered/${slug}`,
  );
}

async function getUniqueSeriesSlug(
  creatorId: string,
  value: string,
  currentSeriesId?: string,
) {
  const baseSlug = fallbackSlug(value);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.series.findUnique({
      where: {
        creatorId_slug: {
          creatorId,
          slug: candidate,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existing || existing.id === currentSeriesId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function resolveSeriesPlacement(
  formData: FormData,
  creatorId: string,
  universe: string,
) {
  if (universe !== "series") {
    return {
      seriesId: null,
      episodeNumber: null,
    };
  }

  const selectedSeriesId = normalizeOptional(formData.get("seriesId"));
  const newSeriesTitle = normalizeOptional(formData.get("newSeriesTitle"));
  const newSeriesSlug = normalizeOptional(formData.get("newSeriesSlug"));
  const newSeriesDescription = normalizeOptional(formData.get("newSeriesDescription"));
  const episodeNumber = normalizeOptionalNumber(formData.get("episodeNumber"));

  if (selectedSeriesId) {
    const selectedSeries = await prisma.series.findFirst({
      where: {
        id: selectedSeriesId,
        creatorId,
      },
      select: {
        id: true,
      },
    });

    if (!selectedSeries) {
      throw new Error("Selected series was not found.");
    }

    return {
      seriesId: selectedSeriesId,
      episodeNumber,
    };
  }

  if (!newSeriesTitle) {
    throw new Error("Choose an existing series or add a new series title.");
  }

  const slug = await getUniqueSeriesSlug(
    creatorId,
    newSeriesSlug ?? newSeriesTitle,
  );
  const series = await prisma.series.create({
    data: {
      title: newSeriesTitle,
      slug,
      description: newSeriesDescription,
      creatorId,
    },
    select: {
      id: true,
    },
  });

  return {
    seriesId: series.id,
    episodeNumber,
  };
}

async function safeNotifyFollowersOfPublishedPost(
  post: Parameters<typeof notifyFollowersOfPublishedPost>[0],
) {
  if (!siteFeatures.pushNotificationsEnabled) {
    return;
  }

  try {
    const summary = await notifyFollowersOfPublishedPost(post);
    console.info(
      "Follower notification summary",
      JSON.stringify({
        postId: post.id,
        title: post.title,
        attempted: summary.attempted,
        sent: summary.sent,
        failed: summary.failed,
        skipped: summary.skipped,
        reason: summary.reason,
      }),
    );
  } catch (error) {
    console.error("Follower notification failed", error);
  }
}

async function safeCreateInAppNotificationsForPublishedPost(
  post: Parameters<typeof createInAppNotificationsForPublishedPost>[0],
) {
  try {
    const summary = await createInAppNotificationsForPublishedPost(post);
    console.info(
      "In-app notification summary",
      JSON.stringify({
        postId: post.id,
        title: post.title,
        created: summary.created,
        skipped: summary.skipped,
      }),
    );
  } catch (error) {
    console.error("In-app notification creation failed", error);
  }
}

export async function createPost(formData: FormData) {
  const creator = await getPrimaryCreator();
  const title = normalizeRequired(formData.get("title"));
  const manualSlug = normalizeOptional(formData.get("slug"));
  const excerpt = normalizeRequired(formData.get("excerpt"));
  const content = normalizeRequired(formData.get("content"));
  const status = normalizeRequired(formData.get("status")) || "draft";
  const universe = normalizeUniverse(formData.get("universe"));
  const chapterLabel = normalizeOptional(formData.get("chapterLabel"));
  const categoryId = normalizeOptional(formData.get("categoryId"));
  const coverImageInput =
    normalizeOptional(formData.get("coverImageOverride")) ??
    normalizeOptional(formData.get("coverImage"));
  const coverImageUpload = await saveUploadedImage(
    formData.get("coverImageFile"),
    "post-cover",
  );
  const coverImage = coverImageUpload ?? coverImageInput;

  if (!title || !excerpt || !content) {
    throw new Error("Title, excerpt, and content are required.");
  }

  const slug = await getUniquePostSlug(creator.id, manualSlug ?? title);
  const seriesPlacement = await resolveSeriesPlacement(
    formData,
    creator.id,
    universe,
  );

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      status,
      universe,
      chapterLabel,
      categoryId,
      coverImage,
      seriesId: seriesPlacement.seriesId,
      episodeNumber: seriesPlacement.episodeNumber,
      creatorId: creator.id,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  if (post.status === "published" && post.universe === "public") {
    await safeCreateInAppNotificationsForPublishedPost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      chapterLabel: post.chapterLabel,
      creatorId: post.creatorId,
      universe: post.universe,
      status: post.status,
      seriesId: post.seriesId,
      episodeNumber: post.episodeNumber,
    });
    await safeNotifyFollowersOfPublishedPost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      chapterLabel: post.chapterLabel,
      creatorId: post.creatorId,
      universe: post.universe,
      status: post.status,
      publishedAt: post.publishedAt,
    });
  }

  if (post.status === "published" && post.universe === "series") {
    await safeCreateInAppNotificationsForPublishedPost({
      id: post.id,
      title: post.title,
      slug: post.slug,
      chapterLabel: post.chapterLabel,
      creatorId: post.creatorId,
      universe: post.universe,
      status: post.status,
      seriesId: post.seriesId,
      episodeNumber: post.episodeNumber,
    });
  }

  await refreshAdminViews();
  await revalidatePostPublicPath(post.universe, post.slug, post.seriesId);
  redirect("/admin/posts");
}

export async function updatePost(formData: FormData) {
  const creator = await getPrimaryCreator();
  const id = normalizeRequired(formData.get("id"));
  const title = normalizeRequired(formData.get("title"));
  const manualSlug = normalizeOptional(formData.get("slug"));
  const excerpt = normalizeRequired(formData.get("excerpt"));
  const content = normalizeRequired(formData.get("content"));
  const status = normalizeRequired(formData.get("status")) || "draft";
  const universe = normalizeUniverse(formData.get("universe"));
  const chapterLabel = normalizeOptional(formData.get("chapterLabel"));
  const categoryId = normalizeOptional(formData.get("categoryId"));
  const coverImageInput =
    normalizeOptional(formData.get("coverImageOverride")) ??
    normalizeOptional(formData.get("coverImage"));
  const coverImageUpload = await saveUploadedImage(
    formData.get("coverImageFile"),
    "post-cover",
  );
  const coverImage = coverImageUpload ?? coverImageInput;

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      universe: true,
      seriesId: true,
      creatorId: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error("Post not found.");
  }

  const nextSlug = manualSlug
    ? await getUniquePostSlug(creator.id, manualSlug, id)
    : existing.status === "published"
      ? existing.slug
      : await getUniquePostSlug(creator.id, title, id);
  const seriesPlacement = await resolveSeriesPlacement(
    formData,
    creator.id,
    universe,
  );

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug: nextSlug,
      excerpt,
      content,
      status,
      universe,
      chapterLabel,
      categoryId,
      coverImage,
      seriesId: seriesPlacement.seriesId,
      episodeNumber: seriesPlacement.episodeNumber,
      publishedAt:
        status === "published"
          ? existing.publishedAt ?? new Date()
          : null,
    },
  });

  const shouldCreateReaderNotifications =
    updatedPost.status === "published" &&
    (updatedPost.universe === "public" || updatedPost.universe === "series") &&
    (existing.status !== "published" || existing.universe !== updatedPost.universe);

  if (shouldCreateReaderNotifications) {
    await safeCreateInAppNotificationsForPublishedPost({
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      chapterLabel: updatedPost.chapterLabel,
      creatorId: updatedPost.creatorId,
      universe: updatedPost.universe,
      status: updatedPost.status,
      seriesId: updatedPost.seriesId,
      episodeNumber: updatedPost.episodeNumber,
    });
  }

  if (shouldCreateReaderNotifications && updatedPost.universe === "public") {
    await safeNotifyFollowersOfPublishedPost({
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      chapterLabel: updatedPost.chapterLabel,
      creatorId: updatedPost.creatorId,
      universe: updatedPost.universe,
      status: updatedPost.status,
      publishedAt: updatedPost.publishedAt,
    });
  }

  await refreshAdminViews();
  await revalidatePostPublicPath(
    existing.universe,
    existing.slug,
    existing.seriesId,
  );
  await revalidatePostPublicPath(
    updatedPost.universe,
    updatedPost.slug,
    updatedPost.seriesId,
  );
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));
  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      slug: true,
      universe: true,
      seriesId: true,
    },
  });

  await prisma.post.delete({
    where: { id },
  });

  await refreshAdminViews();
  if (existing) {
    await revalidatePostPublicPath(
      existing.universe,
      existing.slug,
      existing.seriesId,
    );
  }
}

export async function togglePostStatus(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));
  const nextStatus = normalizeRequired(formData.get("nextStatus"));

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      chapterLabel: true,
      creatorId: true,
      universe: true,
      seriesId: true,
      episodeNumber: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error("Post not found.");
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === "published" ? new Date() : null,
    },
  });

  if (
    existing.status !== "published" &&
    updatedPost.status === "published" &&
    (existing.universe === "public" || existing.universe === "series")
  ) {
    await safeCreateInAppNotificationsForPublishedPost({
      id: existing.id,
      title: existing.title,
      slug: existing.slug,
      chapterLabel: existing.chapterLabel,
      creatorId: existing.creatorId,
      universe: existing.universe,
      status: updatedPost.status,
      seriesId: existing.seriesId,
      episodeNumber: existing.episodeNumber,
    });
  }

  if (
    existing.status !== "published" &&
    updatedPost.status === "published" &&
    existing.universe === "public"
  ) {
    await safeNotifyFollowersOfPublishedPost({
      id: existing.id,
      title: existing.title,
      slug: existing.slug,
      chapterLabel: existing.chapterLabel,
      creatorId: existing.creatorId,
      universe: existing.universe,
      status: updatedPost.status,
      publishedAt: updatedPost.publishedAt,
    });
  }

  await refreshAdminViews();
  await revalidatePostPublicPath(
    existing.universe,
    existing.slug,
    existing.seriesId,
  );
}

export async function notifyFollowersForPost(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      chapterLabel: true,
      creatorId: true,
      universe: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  await safeNotifyFollowersOfPublishedPost(post);
  await refreshAdminViews();
}

export async function testFollowerNotification(formData: FormData) {
  const creator = await getPrimaryCreator();
  const id = normalizeRequired(formData.get("id"));

  const follower = await prisma.follower.findFirst({
    where: {
      id,
      creatorId: creator.id,
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      creatorId: true,
    },
  });

  if (!follower) {
    throw new Error("Follower endpoint not found.");
  }

  const summary = await sendFollowerTestNotification(follower);
  console.info(
    "Follower endpoint test summary",
    JSON.stringify({
      followerId: follower.id,
      attempted: summary.attempted,
      sent: summary.sent,
      failed: summary.failed,
      skipped: summary.skipped,
      reason: summary.reason,
    }),
  );
  await refreshAdminViews();
}

export async function deactivateFollower(formData: FormData) {
  const creator = await getPrimaryCreator();
  const id = normalizeRequired(formData.get("id"));

  await prisma.follower.updateMany({
    where: {
      id,
      creatorId: creator.id,
    },
    data: {
      status: "inactive",
    },
  });

  await refreshAdminViews();
}

export async function createSubscriber(formData: FormData) {
  const creator = await getPrimaryCreator();
  const email = normalizeRequired(formData.get("email")).toLowerCase();
  const name = normalizeOptional(formData.get("name"));
  const tier = normalizeRequired(formData.get("tier")) || "free";

  if (!email) {
    throw new Error("Email is required.");
  }

  const existingSubscriber = await prisma.subscriber.findUnique({
    where: {
      creatorId_email: {
        creatorId: creator.id,
        email,
      },
    },
    select: {
      id: true,
    },
  });

  const subscriber = await prisma.subscriber.upsert({
    where: {
      creatorId_email: {
        creatorId: creator.id,
        email,
      },
    },
    update: {
      name,
      tier,
    },
    create: {
      email,
      name,
      tier,
      creatorId: creator.id,
    },
  });

  await recordSubscriberAnalyticsEvent({
    creatorId: creator.id,
    subscriberId: subscriber.id,
    email: subscriber.email,
    tier: subscriber.tier,
    type: existingSubscriber ? "subscriber_updated" : "subscriber_created",
  });

  await refreshAdminViews();
}

export async function deleteSubscriber(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));
  const subscriber = await prisma.subscriber.findUnique({
    where: { id },
    select: {
      creatorId: true,
      email: true,
      tier: true,
    },
  });

  await prisma.subscriber.delete({
    where: { id },
  });

  if (subscriber) {
    await recordSubscriberAnalyticsEvent({
      creatorId: subscriber.creatorId,
      email: subscriber.email,
      tier: subscriber.tier,
      type: "subscriber_deleted",
    });
  }

  await refreshAdminViews();
}

export async function createLetterRequest(formData: FormData) {
  const creator = await getPrimaryCreator();
  const name = normalizeRequired(formData.get("name"));
  const email = normalizeRequired(formData.get("email")).toLowerCase();
  const tier = normalizeRequired(formData.get("tier"));
  const message = normalizeRequired(formData.get("message"));

  if (!name || !email || !message || !tier) {
    throw new Error("Name, email, tier, and message are required.");
  }

  await prisma.letterRequest.create({
    data: {
      name,
      email,
      tier,
      message,
      creatorId: creator.id,
    },
  });

  revalidatePath("/request-a-letter");
  revalidatePath("/admin/letter-requests");
  redirect("/request-a-letter?success=1");
}

export async function updateLetterRequestStatus(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));
  const status = normalizeRequired(formData.get("status"));

  await prisma.letterRequest.update({
    where: { id },
    data: { status },
  });

  await refreshAdminViews();
}

export async function deleteLetterRequest(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));

  await prisma.letterRequest.delete({
    where: { id },
  });

  await refreshAdminViews();
}

export async function subscribeToLetters(formData: FormData) {
  const creator = await getPrimaryCreator();
  const email = normalizeRequired(formData.get("email")).toLowerCase();
  const name = normalizeOptional(formData.get("name"));
  const tier = normalizeRequired(formData.get("tier")) || "free";
  const nextPath = normalizeOptional(formData.get("nextPath"));

  if (!email) {
    throw new Error("Email is required.");
  }

  const existingSubscriber = await prisma.subscriber.findUnique({
    where: {
      creatorId_email: {
        creatorId: creator.id,
        email,
      },
    },
    select: {
      id: true,
      tier: true,
    },
  });

  const subscriber = await prisma.subscriber.upsert({
    where: {
      creatorId_email: {
        creatorId: creator.id,
        email,
      },
    },
    update: {
      name,
      tier,
    },
    create: {
      email,
      name,
      tier,
      creatorId: creator.id,
    },
  });

  await recordSubscriberAnalyticsEvent({
    creatorId: creator.id,
    subscriberId: subscriber.id,
    email: subscriber.email,
    tier: subscriber.tier,
    type:
      tier === "premium" && existingSubscriber?.tier !== "premium"
        ? "premium_signup"
        : existingSubscriber
          ? "subscriber_updated"
          : "subscriber_created",
  });

  const cookieStore = await cookies();
  cookieStore.set("subscriber_email", email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/subscribe");
  revalidatePath("/");
  if (tier === "premium" && nextPath) {
    redirect(nextPath);
  }

  redirect(`/subscribe?success=1${tier === "premium" ? "&plan=premium" : ""}`);
}

export async function updateCreatorBranding(formData: FormData) {
  await requireAdminSession();
  const creator = await getPrimaryCreator();
  const heroImageInput =
    normalizeOptional(formData.get("heroImageOverride")) ??
    normalizeOptional(formData.get("heroImage"));
  let heroImageUpload: string | null;

  try {
    heroImageUpload = await saveUploadedImage(formData.get("heroImageFile"), "hero");
  } catch (error) {
    console.error("Homepage image upload failed", error);
    await refreshAdminSessionCookie();
    redirect("/admin?homepage=upload-error");
  }

  const heroImage = heroImageUpload ?? heroImageInput;
  const heroImageAlt = normalizeOptional(formData.get("heroImageAlt"));
  const heroEyebrow = normalizeOptional(formData.get("heroEyebrow"));
  const heroTitle = normalizeOptional(formData.get("heroTitle"));
  const heroSubtitle = normalizeOptional(formData.get("heroSubtitle"));

  try {
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        heroImage,
        heroImageAlt,
        heroEyebrow,
        heroTitle,
        heroSubtitle,
      },
    });
  } catch (error) {
    console.error("Homepage save failed", error);
    await refreshAdminSessionCookie();
    redirect("/admin?homepage=save-error");
  }

  const revalidated = await refreshAdminViewsSafely("Homepage save");
  await refreshAdminSessionCookie();
  redirect(revalidated ? "/admin?homepage=saved" : "/admin?homepage=refresh-error");
}

export async function updateCreatorFooter(formData: FormData) {
  await requireAdminSession();
  const creator = await getPrimaryCreator();
  const currentWorkingOn = normalizeOptional(formData.get("currentWorkingOn"));

  try {
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        currentWorkingOn,
      },
    });
  } catch (error) {
    console.error("Footer save failed", error);
    await refreshAdminSessionCookie();
    redirect("/admin?footer=save-error");
  }

  const revalidated = await refreshAdminViewsSafely("Footer save");
  await refreshAdminSessionCookie();
  redirect(revalidated ? "/admin?footer=saved" : "/admin?footer=refresh-error");
}

export async function suggestSlug(formData: FormData) {
  return fallbackSlug(normalizeRequired(formData.get("title")));
}
