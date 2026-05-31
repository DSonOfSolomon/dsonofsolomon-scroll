"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SeriesAccessLink from "@/components/series/SeriesAccessLink";

export default function SouloverseMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-30 inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="inline-flex h-[2.5rem] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#0a192f] px-5 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
      >
        Enter Souloverse
        <span aria-hidden="true" className="text-xs text-white/70">
          {isOpen ? "⌃" : "⌵"}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close Souloverse menu"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-950/10">
            <Link
              href="/writings"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-900 no-underline transition-colors hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Writings
            </Link>
            <SeriesAccessLink
              href="/series"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-900 no-underline transition-colors hover:bg-gray-100"
              onNavigate={() => setIsOpen(false)}
            >
              Series
            </SeriesAccessLink>
          </div>
        </>
      ) : null}
    </div>
  );
}
