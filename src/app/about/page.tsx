import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import SiteFooter from "@/components/site/SiteFooter";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <PageWrapper>
        <Container>
          <h1 className="text-3xl font-bold tracking-tight">
            About
          </h1>

          <p className="mt-4 leading-8 text-gray-700">
            Welcome to my writing system.
          </p>
        </Container>
      </PageWrapper>
      <SiteFooter />
    </>
  );
}
