"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title,
      text,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a192f]/20"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
