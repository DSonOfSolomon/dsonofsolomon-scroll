"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { recordSubscriberAnalyticsEvent } from "@/lib/analytics";
import { saveUploadedImage } from "@/lib/media";
import {
  notifyFollowersOfPublishedPost,
  sendFollowerTestNotification,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { siteFeatures } from "@/lib/features";
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

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
}

export async function loginAdmin(formData: FormData) {
  const username = normalizeRequired(formData.get("username"));
  const password = normalizeRequired(formData.get("password"));
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = getAdminSessionSecret();

  if (
    !adminPassword ||
    !sessionSecret ||
    username !== adminUsername ||
    password !== adminPassword
  ) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

async function refreshAdminViews() {
  revalidatePath("/admin", "page");
  revalidatePath("/admin/posts", "page");
  revalidatePath("/admin/followers");
  revalidatePath("/admin/letter-requests");
  revalidatePath("/", "page");
  revalidatePath("/subscribe");
  revalidatePath("/writings", "page");
  revalidatePath("/unfiltered");
  revalidatePath("/request-a-letter");
}

async function safeNotifyFollowersOfPublishedPost(
  post: Parameters<typeof notifyFollowersOfPublishedPost>[0],
) {
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

export async function createPost(formData: FormData) {
  const creator = await getPrimaryCreator();
  const title = normalizeRequired(formData.get("title"));
  const manualSlug = normalizeOptional(formData.get("slug"));
  const excerpt = normalizeRequired(formData.get("excerpt"));
  const content = normalizeRequired(formData.get("content"));
  const status = normalizeRequired(formData.get("status")) || "draft";
  const requestedUniverse = normalizeRequired(formData.get("universe")) || "public";
  const universe =
    requestedUniverse === "unfiltered" && siteFeatures.unfilteredEnabled
      ? "unfiltered"
      : "public";
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
      creatorId: creator.id,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  if (post.status === "published" && post.universe === "public") {
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

  await refreshAdminViews();
  revalidatePath(
    post.universe === "public" ? `/writings/${post.slug}` : `/unfiltered/${post.slug}`,
  );
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
  const requestedUniverse = normalizeRequired(formData.get("universe")) || "public";
  const universe =
    requestedUniverse === "unfiltered" && siteFeatures.unfilteredEnabled
      ? "unfiltered"
      : "public";
  const chapterLabel = normalizeOptional(formData.get("chapterLabel"));
  const categoryId = normalizeOptional(formData.get("categoryId"));
  const coverImageInput = normalizeOptional(formData.get("coverImage"));
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
      publishedAt:
        status === "published"
          ? existing.publishedAt ?? new Date()
          : null,
    },
  });

  const shouldNotifyFollowers =
    updatedPost.status === "published" &&
    updatedPost.universe === "public" &&
    (existing.status !== "published" || existing.universe !== "public");

  if (shouldNotifyFollowers) {
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
  revalidatePath(
    existing.universe === "public"
      ? `/writings/${existing.slug}`
      : `/unfiltered/${existing.slug}`,
  );
  revalidatePath(
    updatedPost.universe === "public"
      ? `/writings/${updatedPost.slug}`
      : `/unfiltered/${updatedPost.slug}`,
  );
  redirect("/admin/posts");
}

export async function deletePost(formData: FormData) {
  const id = normalizeRequired(formData.get("id"));

  await prisma.post.delete({
    where: { id },
  });

  await refreshAdminViews();
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
  revalidatePath(
    existing.universe === "public"
      ? `/writings/${existing.slug}`
      : `/unfiltered/${existing.slug}`,
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
  const creator = await getPrimaryCreator();
  const heroImageInput =
    normalizeOptional(formData.get("heroImageOverride")) ??
    normalizeOptional(formData.get("heroImage"));
  const heroImageUpload = await saveUploadedImage(
    formData.get("heroImageFile"),
    "hero",
  );
  const heroImage = heroImageUpload ?? heroImageInput;
  const heroImageAlt = normalizeOptional(formData.get("heroImageAlt"));
  const heroEyebrow = normalizeOptional(formData.get("heroEyebrow"));
  const heroTitle = normalizeOptional(formData.get("heroTitle"));
  const heroSubtitle = normalizeOptional(formData.get("heroSubtitle"));
  const currentWorkingOn = normalizeOptional(formData.get("currentWorkingOn"));

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      heroImage,
      heroImageAlt,
      heroEyebrow,
      heroTitle,
      heroSubtitle,
      currentWorkingOn,
    },
  });

  await refreshAdminViews();
  redirect("/admin");
}

export async function suggestSlug(formData: FormData) {
  return fallbackSlug(normalizeRequired(formData.get("title")));
}
