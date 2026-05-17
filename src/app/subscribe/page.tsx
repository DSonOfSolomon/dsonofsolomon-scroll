import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import { subscribeToLetters } from "@/app/admin/actions";
import { isPremiumExperienceEnabled } from "@/lib/features";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe",
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; plan?: string; next?: string }>;
}) {
  const { success, plan, next } = await searchParams;
  const selectedPlan = "premium";
  const premiumEnabled = isPremiumExperienceEnabled();

  if (!premiumEnabled || plan !== "premium") {
    notFound();
  }

  return (
    <PageWrapper>
      <Container>
        <h1 className="text-3xl font-bold tracking-tight">
          Unlock premium
        </h1>

        <p className="mt-4 max-w-2xl leading-8 text-gray-700">
          Upgrade into the premium layer to access D•sonofSolomon Unfiltered
          and request a personal letter.
        </p>

        <form
          action={subscribeToLetters}
          className="mt-8 max-w-2xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6"
        >
          <input type="hidden" name="tier" value={selectedPlan} />
          <input type="hidden" name="nextPath" value={next ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder="Your name"
              className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
            <input
              name="email"
              type="email"
              placeholder="Your email"
              required
              className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex rounded-full bg-[#0a192f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
          >
            Subscribe to premium
          </button>

          {success === "1" && (
            <p className="text-sm text-green-700">
              Premium subscription saved.
            </p>
          )}
        </form>
      </Container>
    </PageWrapper>
  );
}
