import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/context/AuthContext"

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "TradeJournal | Professional Analytics",
  description: "Master your trading journey with advanced analytics and journaling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <Navbar />
              <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
