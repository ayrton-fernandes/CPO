"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  ClipboardList,
  LogOut,
  BarChart3,
  Menu,
  X,
  Map as MapIcon,
  RefreshCcw,
  UserSquare2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { Role } from "@/types";
import { Button } from "../ui/button";
import { toast } from "sonner";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin_master", "intelligence_manager", "analyst", "investigator", "planning", "management"],
  },
  {
    title: "Minhas Operações",
    href: "/operations",
    icon: ShieldAlert,
    roles: ["admin_master", "intelligence_manager", "analyst", "investigator"],
  },
  {
    title: "Banco de Alvos",
    href: "/targets",
    icon: UserSquare2,
    roles: ["admin_master", "intelligence_manager", "analyst", "planning"],
  },
  {
    title: "Validações",
    href: "/validations",
    icon: ClipboardList,
    roles: ["admin_master", "planning"],
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
    roles: ["admin_master", "analyst", "investigator"],
  },
  {
    title: "Banco de Usuários",
    href: "/users",
    icon: UserSquare2,
    roles: ["admin_master", "intelligence_manager"],
  },
  {
    title: "Indicadores",
    href: "/indicators",
    icon: BarChart3,
    roles: ["admin_master", "planning", "management"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const filteredNavItems = NAV_ITEMS.filter((item) => 
    item.roles.includes(user.role)
  );

  const handleResetDemo = () => {
    operationsService.resetData();
    toast.info("Ambiente reiniciado. Dados originais restaurados.");
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <>
      {/* Botão Hambúrguer Mobile */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-md">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn(
        "flex h-screen w-64 flex-col border-r bg-white text-gov-text shadow-sm fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6 bg-gov-blue shrink-0">
            <span className="text-lg font-bold text-white tracking-wide">CPO Digital</span>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive 
                            ? "bg-blue-50 text-gov-blue font-semibold border-l-4 border-gov-blue" 
                            : "text-gray-700 hover:bg-gray-100 hover:text-gov-blue"
                        )}
                    >
                    <Icon className={cn("h-4 w-4", isActive ? "text-gov-blue" : "text-gray-500")} />
                    {item.title}
                    </Link>
                );
                })}
            </nav>
        </div>

        <div className="border-t p-4 bg-gray-50 space-y-2 shrink-0">
            <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs text-gray-500 hover:text-gov-blue"
                onClick={handleResetDemo}
            >
                <RefreshCcw className="h-3 w-3 mr-2" /> Resetar Demonstração
            </Button>
            
            <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-8 w-8 rounded-full bg-gov-blue/10 flex items-center justify-center text-gov-blue font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <span className="text-[10px] text-gray-500 truncate capitalize">{user.role}</span>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
}