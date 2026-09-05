import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

// Deliberately a completely separate shell from MainLayout (own sidebar,
// own color accent) so it never gets confused with the member app visually
// or accidentally shares layout state with it.
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#0b0605] text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
