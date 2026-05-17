import Link from "next/link";
import { FiInstagram } from "react-icons/fi";
import { BsTwitterX } from "react-icons/bs";
import { FaTiktok } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { getPrimaryCreator } from "@/lib/admin";

export default async function SiteFooter() {
  const creator = await getPrimaryCreator();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-[#f7f5ef]">
      <div className="mx-auto w-full max-w-[96rem] px-6 py-10 lg:px-10 2xl:px-14">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr] md:items-end">
          <div className="space-y-4">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-gray-500">
              D•sonofSolomon
            </p>

            <p className="max-w-2xl text-sm leading-7 text-gray-600">
              A quieter place for considered writing on life, pattern, and
              perspective.
            </p>

            <div className="flex items-center gap-1.5 text-gray-950">
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-950 transition-colors hover:bg-black/5"
                aria-label="X"
              >
                <BsTwitterX size={16} />
              </a>

              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-950 transition-colors hover:bg-black/5"
                aria-label="Instagram"
              >
                <FiInstagram size={16} />
              </a>

              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-950 transition-colors hover:bg-black/5"
                aria-label="Facebook"
              >
                <FaFacebookF size={15} />
              </a>

              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-950 transition-colors hover:bg-black/5"
                aria-label="TikTok"
              >
                <FaTiktok size={15} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-950"
            >
              About
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-gray-200 pt-5 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white/50 px-4 py-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              Currently working on:
            </span>
            <span className="ml-2">
              {creator.currentWorkingOn ?? "The D•sonofSolomon writing system."}
            </span>
          </p>
          <p>© {currentYear} D•sonofSolomon</p>
        </div>
      </div>
    </footer>
  );
}
