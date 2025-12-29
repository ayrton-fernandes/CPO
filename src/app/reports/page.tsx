"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, User, ArrowUpRight } from "lucide-react";
import { OperationReport } from "@/types";

interface ExtendedReport extends OperationReport {
    operationTitle: string;
    operationId: string;
}

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [allReports, setAllReports] = useState<ExtendedReport[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Aggregate reports from all operations
    const ops = operationsService.getAll();
    const reports: ExtendedReport[] = [];
    
    ops.forEach(op => {
        if (op.reports) {
            op.reports.forEach(rep => {
                reports.push({
                    ...rep,
                    operationTitle: op.title,
                    operationId: op.id
                });
            });
        }
    });

    // Sort by newest
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAllReports(reports);

  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gov-blue uppercase tracking-tight">Relatórios de Campo & Inteligência</h1>
            <p className="text-gray-500 font-medium">Histórico unificado de diligências e análises.</p>
        </div>

        <div className="space-y-4">
            {allReports.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Sem registros cronológicos</h3>
                    <p className="text-gray-500">Nenhum relatório foi submetido ao sistema até o momento.</p>
                </div>
            ) : (
                allReports.map((rep) => (
                    <Card key={rep.id} className="hover:shadow-md transition-shadow group border-l-4 border-l-gov-blue">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg text-gov-blue">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-gov-blue transition-colors">{rep.title}</h3>
                                        <Link href={`/operations/${rep.operationId}`} className="text-[10px] font-bold text-gov-blue hover:underline flex items-center gap-1 uppercase tracking-wider">
                                            Ref: {rep.operationTitle} <ArrowUpRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap uppercase">
                                    {new Date(rep.createdAt).toLocaleDateString('pt-BR')} às {new Date(rep.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 pl-[52px]">
                                {rep.content}
                            </p>
                            <div className="flex items-center gap-4 pl-[52px] text-[10px] font-bold text-gray-400 uppercase">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" /> Autor: {rep.author}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                    V{rep.version}
                                </span>
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