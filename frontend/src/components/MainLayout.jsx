import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";
// bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Page Content */}
        <main className="  flex-1 p-6 bg-slate-950 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
