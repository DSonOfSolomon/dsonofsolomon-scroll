"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import NotificationBell from "@/components/notifications/NotificationBell";
import SeriesAccessLink from "@/components/series/SeriesAccessLink";
import { siteFeatures } from "@/lib/features";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

const souloverseLinks = [
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

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [souloverseOpen, setSouloverseOpen] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const navLinks = isAdminRoute ? adminNavLinks : publicNavLinks;
  const brandHref = isAdminRoute ? "/admin" : "/";
  const souloverseActive =
    !isAdminRoute &&
    souloverseLinks.some(
      (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
    );

  return (
    <header className="border-b border-white/10 bg-[#081421] text-white">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[96rem] items-center justify-between px-6 lg:px-10 2xl:px-14">
        <Link
          href={brandHref}
          className="text-base font-semibold tracking-tight !text-[#f4ead7] transition-colors hover:!text-white"
        >
          D•sonofSolomon
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 text-[0.95rem] lg:flex">
          {navLinks.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);

            if (!isAdminRoute && link.href === "/about") {
              return null;
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSouloverseOpen(false)}
                className={`rounded-full px-4 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/35 ${
                  isActive
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/82 hover:bg-white/[0.06] hover:text-white"
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
                onClick={() => setSouloverseOpen((value) => !value)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/35 ${
                  souloverseActive || souloverseOpen
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/82 hover:bg-white/[0.06] hover:text-white"
                }`}
                aria-expanded={souloverseOpen}
                aria-haspopup="menu"
              >
                Souloverse
                <FiChevronDown
                  size={15}
                  className={`transition-transform ${
                    souloverseOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {souloverseOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close Souloverse menu"
                    onClick={() => setSouloverseOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0b1725] py-2 shadow-2xl"
                    role="menu"
                  >
                    {souloverseLinks.map((link) => {
                      const content = (
                        <>
                          <span className="block text-sm font-medium text-white">
                            {link.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-white/50">
                            {link.description}
                          </span>
                        </>
                      );

                      return link.href === "/series" ? (
                        <SeriesAccessLink
                          key={link.href}
                          href={link.href}
                          onNavigate={() => setSouloverseOpen(false)}
                          className="block px-4 py-3 transition-colors hover:bg-white/[0.07]"
                          role="menuitem"
                        >
                          {content}
                        </SeriesAccessLink>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setSouloverseOpen(false)}
                          className="block px-4 py-3 transition-colors hover:bg-white/[0.07]"
                          role="menuitem"
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {navLinks.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);

            if (isAdminRoute || link.href !== "/about") {
              return null;
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSouloverseOpen(false)}
                className={`rounded-full px-4 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/35 ${
                  isActive
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/82 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!isAdminRoute && <NotificationBell />}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isAdminRoute && <NotificationBell />}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-white/10 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {navLinks.map((link) => {
              const isActive = isNavLinkActive(pathname, link.href);

              if (!isAdminRoute && link.href === "/about") {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setSouloverseOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/82 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {!isAdminRoute && (
              <div className="rounded-xl border border-white/10 p-2">
                <button
                  type="button"
                  onClick={() => setSouloverseOpen((value) => !value)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-200 ${
                    souloverseActive || souloverseOpen
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/82 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-expanded={souloverseOpen}
                >
                  <span>Souloverse</span>
                  <FiChevronDown
                    size={16}
                    className={`transition-transform ${
                      souloverseOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {souloverseOpen && (
                  <div className="mt-2 flex flex-col gap-1">
                    {souloverseLinks.map((link) => {
                      const isActive =
                        pathname === link.href ||
                        pathname.startsWith(`${link.href}/`);
                      const className = `rounded-lg px-3 py-2 transition-colors duration-200 ${
                        isActive
                          ? "bg-white/10 font-medium text-white"
                          : "text-white/82 hover:bg-white/5 hover:text-white"
                      }`;

                      return link.href === "/series" ? (
                        <SeriesAccessLink
                          key={link.href}
                          href={link.href}
                          onNavigate={() => {
                            setMenuOpen(false);
                            setSouloverseOpen(false);
                          }}
                          className={className}
                        >
                          {link.label}
                        </SeriesAccessLink>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => {
                            setMenuOpen(false);
                            setSouloverseOpen(false);
                          }}
                          className={className}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {navLinks.map((link) => {
              const isActive = isNavLinkActive(pathname, link.href);

              if (isAdminRoute || link.href !== "/about") {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMenuOpen(false);
                    setSouloverseOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 transition-colors duration-200 ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/82 hover:bg-white/5 hover:text-white"
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
