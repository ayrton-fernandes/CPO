"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { CreateOperationWizard } from "@/features/operacoes/create-operation-wizard";
import { toast } from "sonner";

export default function CreateOperationPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Gerente de Inteligência e Admin Master podem criar operações
    if (user?.role !== 'intelligence_manager' && user?.role !== 'admin_master') {
        toast.error("Acesso Negado", {
            description: "Apenas Coordenadores ou Admin podem criar operações."
        });
        router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'intelligence_manager' && user?.role !== 'admin_master')) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gov-blue">Nova Operação</h1>
            <p className="text-gray-500">Inicie o ciclo de vida de uma operação policial.</p>
        </div>
        <CreateOperationWizard />
      </PageContainer>
    </div>
  );
}