import { ReactNode } from "react";

type PageWrapperProps = {
  children: ReactNode;
};

export default function PageWrapper({
  children,
}: PageWrapperProps) {
  return (
    <main className="min-h-screen pt-16 md:pt-24">
      {children}
    </main>
  );
}
