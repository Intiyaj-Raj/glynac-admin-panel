import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "User Management", href: "/users" },
  { label: "Policy Manager", href: "/rules" },
  { label: "System Health", href: "/system" },
  { label: "Feature Flags", href: "/flags" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader navItems={navItems} />
      <main className="md:ml-64 min-h-screen bg-slate-50">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
