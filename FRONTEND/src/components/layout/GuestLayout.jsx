import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans selection:bg-violet-500/30">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default GuestLayout;
