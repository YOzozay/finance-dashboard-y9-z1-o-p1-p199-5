import "./globals.css";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export const metadata = {
  title: "Finance Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <div className="flex">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block w-64">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>

        {/* Bottom Nav - Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}