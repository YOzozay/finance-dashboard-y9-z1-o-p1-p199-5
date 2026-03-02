import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem("theme");
                if (saved === "dark") {
                  document.documentElement.classList.add("dark");
                } else if (saved === "light") {
                  document.documentElement.classList.remove("dark");
                } else {
                  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    document.documentElement.classList.add("dark");
                  }
                }
              })();
            `,
          }}
        />
      </head>

      <body className="bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">

        <div className="flex min-h-screen">

          {/* Sidebar (Desktop) */}
          <div className="hidden md:block w-64 border-r border-[var(--color-border-nav)]">
            <Sidebar />
          </div>

          {/* Main Column */}
          <div className="flex-1 flex flex-col">

            {/* Top Bar */}
            <div className="flex justify-end px-6 md:px-10 pt-6">
              <ThemeToggle />
            </div>

            {/* Page Content */}
            <main className="flex-1 px-6 md:px-10 pb-24 md:pb-10">
              {children}
            </main>

          </div>
        </div>

        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0">
          <BottomNav />
        </div>

      </body>
    </html>
  );
}