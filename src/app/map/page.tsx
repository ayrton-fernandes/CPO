"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { OperationsMap } from "@/features/map/operations-map";
import { toast } from "sonner";

export default function MapPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const allowedRoles = ['admin', 'intelligence', 'planning'];
    if (user && !allowedRoles.includes(user.role)) {
        toast.error("Acesso Negado", {
            description: "Você não tem permissão para ver o mapa tático."
        });
        router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full flex flex-col h-screen">
         <div className="mb-4 shrink-0">
            <h1 className="text-2xl font-bold text-gov-blue">Mapa de Calor Operacional</h1>
            <p className="text-gray-500">Visualização tática da distribuição de operações.</p>
        </div>
        <div className="flex-1 min-h-0 relative border rounded-lg overflow-hidden shadow-sm bg-gray-100">
             <OperationsMap />
        </div>
      </PageContainer>
    </div>
  );
}
