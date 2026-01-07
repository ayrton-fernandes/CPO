"use client";

import { useEffect, useState } from "react";
import { Operation, Target } from "@/types";
import { operationsService } from "@/services/operationsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileDown, Edit3, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { OperationGeneral } from "./components/operation-general";
import { OperationDocuments } from "./components/operation-documents";
import { OperationWorkflow } from "./components/operation-workflow";
import { OperationReports } from "./components/operation-reports";
import { OperationTargets } from "./components/operation-targets";
import { EditOperationModal } from "./components/operation-edit-modal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/hooks/useAuthStore";

interface OperationDetailsProps {
  id: string;
}

export function OperationDetails({ id }: OperationDetailsProps) {
  const [operation, setOperation] = useState<Operation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchOperation = () => {
    setLoading(true);
    setTimeout(() => {
        const op = operationsService.getById(id);
        setOperation(op);
        setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchOperation();
  }, [id]);

  if (loading) {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gov-blue" />
        </div>
    );
  }

  if (!operation) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Operação não encontrada</h2>
            <Button asChild variant="outline">
                <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
        </div>
    );
  }

  const isMaturityLow = operation.maturity < 70;

  return (
    <div className="space-y-6">
      {/* Header com Edição */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gov-blue">{operation.title}</h1>
                    <Badge className="uppercase">{operation.status.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-sm text-gray-500">ID: {operation.id} • Unidade: {operation.department}</p>
            </div>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white">
                <FileDown className="h-4 w-4 mr-2" /> Dossiê PDF
            </Button>
            {(user?.role === 'admin_master' || user?.permissions?.includes('EDIT_OPERATIONS')) && (
                <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Editar Operação
                </Button>
            )}
        </div>
      </div>

      {/* Barra de Maturidade Crítica */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">MATURIDADE DA INVESTIGAÇÃO</span>
                    {isMaturityLow ? (
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <ShieldAlert className="h-3 w-3 mr-1" /> Requer mais dados de alvos
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Pronta para Validação
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-500 italic">Baseada no preenchimento de CPF, Foto e Endereços dos Alvos.</p>
            </div>
            <span className="text-xl font-black text-gov-blue">{operation.maturity}%</span>
        </div>
        <Progress value={operation.maturity} className="h-2 rounded-none" />
      </Card>

      <Tabs defaultValue="targets" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            <TabsList className="flex w-max lg:grid lg:w-full lg:grid-cols-5 lg:max-w-3xl">
                <TabsTrigger value="targets">Alvos & Vínculos</TabsTrigger>
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="targets" className="mt-6">
          <OperationTargets operation={operation} onUpdate={fetchOperation} />
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <OperationGeneral operation={operation} onUpdate={fetchOperation} onEditClick={() => setIsEditModalOpen(true)} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <OperationDocuments operation={operation} onUpdate={fetchOperation} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <OperationReports operation={operation} onUpdate={fetchOperation} />
        </TabsContent>
        
        <TabsContent value="workflow" className="mt-6">
          <OperationWorkflow operation={operation} onUpdate={fetchOperation} />
        </TabsContent>
      </Tabs>

      {/* Sticky Mobile Footer for Critical Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="flex-1 text-xs h-11" onClick={() => window.print()}>
              <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          {(user?.role === 'admin_master' || user?.permissions?.includes('EDIT_OPERATIONS')) && (
            <Button className="flex-1 text-xs h-11 bg-gov-blue" onClick={() => setIsEditModalOpen(true)}>
                <Edit3 className="h-4 w-4 mr-2" /> Editar
            </Button>
          )}
      </div>

      <EditOperationModal 
        operation={operation} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onUpdate={fetchOperation}
      />
    </div>
  );
}

function Card({ children, className, ...props }: any) {
    return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>{children}</div>
}
