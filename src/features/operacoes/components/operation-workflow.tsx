"use client";

import { useState } from "react";
import { Operation, OperationStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, AlertTriangle, Archive, Send, PackageSearch, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CorrectionModal } from "./operation-correction-modal";

interface OperationWorkflowProps {
  operation: Operation;
  onUpdate: () => void;
}

const STEPS = [
  { id: 'EM_ANALISE', label: 'Análise' },
  { id: 'AGUARDANDO_VALIDACAO', label: 'Validação' },
  { id: 'PLANEJAMENTO', label: 'Planejamento' },
  { id: 'PRONTA_EXECUCAO', label: 'Execução' },
  { id: 'FINALIZADA', label: 'Arquivada' },
];

export function OperationWorkflow({ operation, onUpdate }: OperationWorkflowProps) {
  const { user } = useAuthStore();
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isForceApprovalOpen, setIsForceApprovalOpen] = useState(false);
  const [justification, setJustification] = useState("");

  if (!user) return null;

  const currentStepIndex = STEPS.findIndex(s => s.id === operation.status);
  const isMaturityLow = operation.maturity < 70;

  const handleStatusChange = (newStatus: OperationStatus) => {
    operationsService.updateStatus(operation.id, newStatus);
    onUpdate();
    toast.success(`Status atualizado: ${newStatus.replace(/_/g, " ")}`);
  };

  const handleCorrection = (checklist: string[]) => {
    operationsService.updateStatus(operation.id, 'EM_ANALISE');
    onUpdate();
    toast.warning("Informações solicitadas. Inteligência notificada.");
    setIsCorrectionOpen(false);
  };

  const handleForceApproval = () => {
    if (!justification.trim()) {
        toast.error("A justificativa é obrigatória.");
        return;
    }

    // Update with forced approval
    const updatedHistory = [
        ...(operation.validationHistory || []),
        {
            id: `val-${Date.now()}`,
            status: 'APPROVED' as const,
            reason: `APROVAÇÃO FORÇADA: ${justification}`,
            userId: user.id,
            date: new Date().toISOString()
        }
    ];

    operationsService.updateOperation(operation.id, {
        status: 'PLANEJAMENTO',
        validationHistory: updatedHistory
    });

    toast.success("Operação aprovada com ressalvas (Forçada).");
    setIsForceApprovalOpen(false);
    setJustification("");
    onUpdate();
  };

  const renderActions = () => {
    const { role } = user;
    const { status } = operation;

    // Ações para Inteligência
    if ((role === 'intelligence_manager' || role === 'analyst' || role === 'admin_master') && status === 'EM_ANALISE') {
        const canForce = role === 'admin_master' || role === 'intelligence_manager';

        return (
            <div className="flex flex-col gap-3">
                <div className={cn(
                    "p-3 rounded-md border flex items-start gap-2",
                    isMaturityLow ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
                )}>
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <p className="text-xs">
                        {isMaturityLow 
                            ? `Maturidade insuficiente (${operation.maturity}%). Mínimo de 70% para validar.` 
                            : "Maturidade ideal. A operação pode ser enviada para validação estratégica."}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        onClick={() => handleStatusChange('AGUARDANDO_VALIDACAO')} 
                        disabled={isMaturityLow}
                        className="flex-1"
                    >
                        <Send className="h-4 w-4 mr-2" /> Solicitar Validação
                    </Button>
                    
                    {isMaturityLow && canForce && (
                        <Button 
                            variant="destructive" 
                            className="flex-none bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                            onClick={() => setIsForceApprovalOpen(true)}
                        >
                            <ShieldAlert className="h-4 w-4 mr-2" /> Forçar Aprovação
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Ações para Planejamento
    if ((role === 'planning' || role === 'admin_master') && status === 'AGUARDANDO_VALIDACAO') {
        return (
            <div className="flex gap-3">
                <Button variant="outline" className="flex-1 text-red-600 border-red-200" onClick={() => setIsCorrectionOpen(true)}>
                    <PackageSearch className="h-4 w-4 mr-2" /> Solicitar Informações
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('PLANEJAMENTO')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar Operação
                </Button>
            </div>
        );
    }

    if ((role === 'planning' || role === 'admin_master') && status === 'PLANEJAMENTO') {
        return (
            <Button onClick={() => handleStatusChange('PRONTA_EXECUCAO')} className="w-full sm:w-auto bg-gov-blue">
                <ArrowRight className="h-4 w-4 mr-2" /> Liberar para Execução
            </Button>
        );
    }

    // Finalizar (Apenas Gerente e Master)
    if ((role === 'intelligence_manager' || role === 'admin_master') && status === 'PRONTA_EXECUCAO') {
        return (
            <Button onClick={() => handleStatusChange('FINALIZADA')} variant="secondary" className="w-full sm:w-auto">
                <Archive className="h-4 w-4 mr-2" /> Finalizar e Arquivar
            </Button>
        );
    }

    return (
        <div className="text-sm text-gray-500 italic p-4 border rounded-md bg-gray-50 text-center">
            Aguardando ações de outros departamentos.
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Controle de Fluxo Operacional</CardTitle>
          <CardDescription>Gerencie o estado da operação através da máquina de estados oficial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
             <div className="absolute left-4 top-0 bottom-0 md:top-1/2 md:bottom-auto md:left-0 md:right-0 md:h-0.5 bg-gray-100 -z-10 w-0.5 md:w-full" />
             
             {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                    <div key={step.id} className="flex md:flex-col items-center gap-3 bg-[#f8fafc] md:bg-transparent pr-4 md:pr-0">
                        <div className={cn(
                            "h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all bg-white z-10",
                            isCompleted ? "border-green-500 text-green-500" :
                            isCurrent ? "border-gov-blue text-gov-blue ring-4 ring-blue-50" :
                            "border-gray-200 text-gray-300"
                        )}>
                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                        </div>
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isCurrent ? "text-gov-blue" : "text-gray-400"
                        )}>{step.label}</span>
                    </div>
                )
             })}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-6 mt-4">
            <div className="w-full">
                {renderActions()}
            </div>
        </CardFooter>
      </Card>

      <CorrectionModal 
        isOpen={isCorrectionOpen} 
        onClose={() => setIsCorrectionOpen(false)} 
        onConfirm={handleCorrection} 
      />

      <Dialog open={isForceApprovalOpen} onOpenChange={setIsForceApprovalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Forçar Aprovação
                </DialogTitle>
                <DialogDescription>
                    Você está prestes a aprovar uma operação com <strong>maturidade insuficiente</strong>. 
                    Esta ação será registrada e requer uma justificativa formal.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Justificativa da Decisão</label>
                <Textarea 
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Descreva o motivo da aprovação forçada..."
                    rows={4}
                    className="bg-red-50 focus:bg-white transition-colors"
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsForceApprovalOpen(false)}>Cancelar</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleForceApproval}>
                    Confirmar Aprovação Forçada
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
