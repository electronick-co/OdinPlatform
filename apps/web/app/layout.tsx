import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ODIN Platform",
  description: "DeepSea Developments PM Platform — Project ODIN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
