"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { siteFeatures } from "@/lib/features";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "Writings", href: "/writings" },
  { label: "About", href: "/about" },
];

const adminNavLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Posts", href: "/admin/posts" },
  ...(siteFeatures.letterRequestsEnabled
    ? [{ label: "Letter Requests", href: "/admin/letter-requests" }]
    : []),
  { label: "Followers", href: "/admin/followers" },
  { label: "Logout", href: "/admin/logout" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const navLinks = isAdminRoute ? adminNavLinks : publicNavLinks;
  const brandHref = isAdminRoute ? "/admin" : "/";

  return (
    <header className="border-b border-white/10 bg-[#081421] text-white">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between px-6 lg:px-10 2xl:px-14">
        <Link
          href={brandHref}
          className="text-base font-semibold tracking-tight !text-[#8a6a2f] transition-colors hover:!text-[#b28a45]"
        >
          D•sonofSolomon
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition-colors duration-200 ${
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white md:hidden"
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white/85"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
