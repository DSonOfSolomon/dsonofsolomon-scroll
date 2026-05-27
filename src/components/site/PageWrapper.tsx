import { ReactNode } from "react";

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({
  children,
  className = "pt-16 md:pt-24",
}: PageWrapperProps) {
  return (
    <main className={`min-h-screen ${className}`}>
      {children}
    </main>
  );
}
