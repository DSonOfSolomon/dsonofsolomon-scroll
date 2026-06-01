import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <PageWrapper>
        <Container>
          <main className="pb-16">{children}</main>
        </Container>
      </PageWrapper>
    </div>
  );
}
