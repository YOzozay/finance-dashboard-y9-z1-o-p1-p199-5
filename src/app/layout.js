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

      <body className="bg-gray-100 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100">

        <div className="flex min-h-screen">

          <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800">
            <Sidebar />
          </div>

          <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 relative">
            <div className="absolute top-6 right-6">
              <ThemeToggle />
            </div>
            {children}
          </main>

        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0">
          <BottomNav />
        </div>

      </body>
    </html>
  );
}