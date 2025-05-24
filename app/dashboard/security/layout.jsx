import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { navigationConfig } from "@/config/navigation";
import { UsersIcon, ShieldAlert, HistoryIcon, LockIcon } from "lucide-react";

export default function SecurityLayout({ children }) {
  const securityNavItems = [
    {
      title: "Vue d'ensemble",
      href: "/dashboard/security",
      icon: ShieldAlert,
    },
    {
      title: "Comptes verrouillés",
      href: "/dashboard/security/locked-accounts",
      icon: LockIcon,
    },
    {
      title: "Journaux d'accès",
      href: "/dashboard/security/logs",
      icon: HistoryIcon,
    },
    {
      title: "Utilisateurs",
      href: "/dashboard/security/users",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav items={securityNavItems} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 