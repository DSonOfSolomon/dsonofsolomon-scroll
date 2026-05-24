"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { siteFeatures } from "@/lib/features";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

const soloverseLinks = [
  {
    label: "Series",
    href: "/series",
    description: "Continuations and episodic worlds",
  },
  {
    label: "Writings",
    href: "/writings",
    description: "Single pieces arranged as chapters",
  },
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
  const [soloverseOpen, setSoloverseOpen] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const navLinks = isAdminRoute ? adminNavLinks : publicNavLinks;
  const brandHref = isAdminRoute ? "/admin" : "/";
  const soloverseActive =
    !isAdminRoute &&
    soloverseLinks.some(
      (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
    );

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

            if (!isAdminRoute && link.href === "/about") {
              return null;
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSoloverseOpen(false)}
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

          {!isAdminRoute && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSoloverseOpen((value) => !value)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 transition-colors duration-200 ${
                  soloverseActive || soloverseOpen
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white/85"
                }`}
                aria-expanded={soloverseOpen}
                aria-haspopup="menu"
              >
                Soloverse
                <FiChevronDown
                  size={15}
                  className={`transition-transform ${
                    soloverseOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {soloverseOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b1725] py-2 shadow-2xl"
                  role="menu"
                >
                  {soloverseLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSoloverseOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-white/[0.07]"
                      role="menuitem"
                    >
                      <span className="block text-sm font-medium text-white">
                        {link.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/50">
                        {link.description}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            if (!isAdminRoute && link.href !== "/about") {
              return null;
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSoloverseOpen(false)}
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

              if (!isAdminRoute && link.href === "/about") {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setSoloverseOpen(false);
                  }}
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

            {!isAdminRoute && (
              <div className="rounded-xl border border-white/10 p-2">
                <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                  Soloverse
                </p>
                <div className="flex flex-col gap-1">
                  {soloverseLinks.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setMenuOpen(false);
                          setSoloverseOpen(false);
                        }}
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
              </div>
            )}

            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              if (!isAdminRoute && link.href !== "/about") {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setSoloverseOpen(false);
                  }}
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
