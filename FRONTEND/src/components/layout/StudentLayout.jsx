import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function StudentLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text font-sans">
      {/* Sidebar Component Frame */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-grow min-w-0 overflow-hidden">
        {/* Header Component Frame */}
        <Header setIsMobileOpen={setIsMobileOpen} />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto bg-surface p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
