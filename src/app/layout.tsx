// app/layout.tsx
import "./globals.css";
import { Hanken_Grotesk } from "next/font/google";
import ClientSmoothScroll from "../../components/clientSmoothScroll";

const hanken = Hanken_Grotesk({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={hanken.className}>
        <ClientSmoothScroll>{children}</ClientSmoothScroll>
      </body>
    </html>
  );
}
