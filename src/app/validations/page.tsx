"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ValidationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  // Filter for AGUARDANDO_VALIDACAO status
  const [operations, setOperations] = useState(
    operationsService.getAll().filter(op => op.status === 'AGUARDANDO_VALIDACAO')
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role !== 'planning' && user.role !== 'admin_master') {
         toast.error("Acesso restrito ao setor de Planejamento.");
         router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'planning' && user?.role !== 'admin_master')) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gov-blue uppercase tracking-tight">Validações Estratégicas</h1>
            <p className="text-gray-500 font-medium">Operações aguardando análise tática e liberação de recursos.</p>
        </div>

        <div className="grid gap-4">
            {operations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
                    <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Fila limpa</h3>
                    <p className="text-gray-500">Nenhuma operação aguarda validação estratégica no momento.</p>
                </div>
            ) : (
                operations.map((op) => (
                    <Card key={op.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-bold">
                                        PENDENTE DE ANÁLISE
                                    </Badge>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {op.id}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{op.title}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{op.description}</p>
                                
                                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 bg-gray-50 p-2 rounded-md inline-flex uppercase border border-gray-100">
                                    <span className="text-gray-400">Origem:</span>
                                    <span className="text-gov-blue">{op.department}</span>
                                    <span className="w-px h-3 bg-gray-300 mx-1" />
                                    <span className="text-gray-400">Maturidade:</span>
                                    <span className="text-orange-600">{op.maturity}%</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[180px]">
                                <Button asChild className="w-full bg-gov-blue">
                                    <Link href={`/operations/${op.id}`}>
                                        Analisar Dossiê <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 font-bold text-xs uppercase">
                                    <AlertCircle className="mr-2 h-4 w-4" /> Relatar Urgência
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </PageContainer>
    </div>
  );
}