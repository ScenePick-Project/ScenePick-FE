import Navbar from "./Navbar.tsx";
import { Outlet } from "react-router-dom";
import Footer from "./Footer.tsx";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 w-full max-w-screen-xl mx-auto p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
