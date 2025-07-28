import { LayoutHeader } from "@/src/components/layout/Layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutHeader>{children}</LayoutHeader>;
}
