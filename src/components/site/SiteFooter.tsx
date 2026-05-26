import { FiInstagram } from "react-icons/fi";
import { BsTwitterX } from "react-icons/bs";
import { FaTiktok } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import Link from "next/link";
import { getPrimaryCreator } from "@/lib/admin";
import WorkingOnMarquee from "@/components/site/WorkingOnMarquee";

export default async function SiteFooter() {
  const creator = await getPrimaryCreator();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#071220]">
      <div className="mx-auto w-full max-w-[96rem] px-6 py-10 lg:px-10 2xl:px-14">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr] md:items-end">
          <div className="space-y-4">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-white/58">
              D•sonofSolomon
            </p>

            <p className="max-w-2xl text-sm leading-7 text-white/72">
              A quieter place for considered writing on life, pattern, and
              perspective.
            </p>

            <div className="flex items-center gap-1.5 text-white">
              <a
                href="https://x.com/dsonofsolomon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8"
                aria-label="X"
              >
                <BsTwitterX size={16} />
              </a>

              <a
                href="https://instagram.com/dsonofsolomon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8"
                aria-label="Instagram"
              >
                <FiInstagram size={16} />
              </a>

              <a
                href="https://facebook.com/iamdsonofsolomon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8"
                aria-label="Facebook"
              >
                <FaFacebookF size={15} />
              </a>

              <a
                href="https://tiktok.com/@dsonofsolomon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/8"
                aria-label="TikTok"
              >
                <FaTiktok size={15} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <Link
              href="/about"
              className="block text-sm font-medium !text-white transition-colors hover:!text-white/80"
            >
              About
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-full items-center rounded-full border border-white/12 bg-white px-4 py-2 text-sm text-black sm:max-w-[min(45rem,70vw)]">
            <span className="shrink-0 font-semibold text-black">
              Currently working on:
            </span>
            <WorkingOnMarquee
              text={creator.currentWorkingOn ?? "The D•sonofSolomon writing system."}
            />
          </p>
          <p>© {currentYear} D•sonofSolomon</p>
        </div>
      </div>
    </footer>
  );
}
