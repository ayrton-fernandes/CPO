"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeMap: Record<string, string> = {
  dashboard: "Home",
  operations: "Operações",
  new: "Nova",
  indicators: "Indicadores",
  reports: "Relatórios",
  validations: "Validações",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/dashboard" || pathname === "/login") return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link href="/dashboard" className="hover:text-gov-blue flex items-center">
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = routeMap[segment] || (segment.startsWith("op-") ? "Detalhes" : segment);

        return (
          <div key={href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-300" />
            {isLast ? (
              <span className="font-medium text-gov-blue">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gov-blue">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
