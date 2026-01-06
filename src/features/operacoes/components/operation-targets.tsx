"use client";

import { useState } from "react";
import { Operation, Target } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Plus, Edit2, Camera, ShieldCheck, AlertCircle, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TargetModal } from "./target-modal";
import { TargetSearchModal } from "./target-search-modal";
import { operationsService } from "@/services/operationsService";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { toast } from "sonner";

interface OperationTargetsProps {
  operation: Operation;
  onUpdate: () => void;
}

export function OperationTargets({ operation, onUpdate }: OperationTargetsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const { user } = useAuthStore();

  const handleAddTarget = () => {
    setSelectedTarget(null);
    setIsSearchModalOpen(true);
  };

  const handleCreateNew = () => {
    setIsSearchModalOpen(false);
    setSelectedTarget(null);
    setIsModalOpen(true);
  };

  const handleSelectFromSearch = (target: Target) => {
    // Link existing target to this operation
    const currentLinks = target.linkedOperationIds || [];
    if (!currentLinks.includes(operation.id)) {
        currentLinks.push(operation.id);
    }
    
    const linkedTarget = { ...target, linkedOperationIds: currentLinks };
    operationsService.saveTarget(linkedTarget);
    
    toast.success("Alvo Vinculado", {
        description: `"${target.nickname || target.name}" foi vinculado a esta investigação.`
    });
    
    setIsSearchModalOpen(false);
    onUpdate();
  };

  const handleEditTarget = (target: Target) => {
    setSelectedTarget(target);
    setIsModalOpen(true);
  };

  const handleSaveTarget = (targetData: Target) => {
    // Save (Create or Update) via service
    operationsService.saveTarget(targetData);

    if (selectedTarget) {
      toast.success("Alvo Atualizado", {
        description: `Os dados de "${targetData.nickname || targetData.name}" foram atualizados.`
      });
    } else {
      toast.success("Alvo Criado", {
        description: `"${targetData.nickname || targetData.name}" foi criado e vinculado.`
      });
    }

    onUpdate();
    setIsModalOpen(false);
  };

  const handleUnlinkTarget = (target: Target) => {
    if (confirm(`Tem certeza que deseja desvincular "${target.name}" desta operação? O alvo permanecerá no banco global.`)) {
        operationsService.unlinkTargetFromOperation(target.id, operation.id);
        toast.success("Alvo desvinculado com sucesso.");
        onUpdate();
    }
  };

  const canUnlink = user?.role === 'admin_master' || user?.role === 'intelligence_manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-gray-800">Investigados ({operation.targets.length})</h3>
            <p className="text-sm text-gray-500">Gestão de fichas e dactiloscopia.</p>
        </div>
        <Button size="sm" onClick={handleAddTarget}>
          <Plus className="h-4 w-4 mr-2" /> Vincular Alvo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {operation.targets.map((target) => (
          <Card key={target.id} className="overflow-hidden border-l-4 border-l-gov-blue">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center relative border border-gray-200">
                            {target.hasPhoto ? (
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                            ) : (
                                <Camera className="h-8 w-8 text-gray-300" />
                            )}
                            {!target.hasPhoto && (
                                <div className="absolute -top-1 -right-1">
                                    <AlertCircle className="h-4 w-4 text-red-500 fill-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 leading-tight">{target.name}</h4>
                            <p className="text-sm text-gov-blue font-bold italic">"{target.nickname}"</p>
                            <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                                Risco: {target.riskLevel}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTarget(target)} title="Editar Dados">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        {canUnlink && (
                             <Button variant="ghost" size="icon" onClick={() => handleUnlinkTarget(target)} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Desvincular da Operação">
                                <Unlink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-medium uppercase tracking-wider">
                    <div className={cn(
                        "p-2 rounded flex items-center justify-between",
                        target.hasCpf ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                        <span>CPF</span>
                        {target.hasCpf ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    </div>
                    <div className={cn(
                        "p-2 rounded flex items-center justify-between",
                        target.addresses.some(a => a.isConfirmed) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                        <span>Endereço</span>
                        {target.addresses.some(a => a.isConfirmed) ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    </div>
                </div>

                {target.addresses.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> ÚLTIMA LOCALIZAÇÃO CONHECIDA:
                        </p>
                        <p className="text-xs text-gray-700">
                            {target.addresses[0].street}, {target.addresses[0].number} - {target.addresses[0].neighborhood}
                        </p>
                    </div>
                )}
            </div>
          </Card>
        ))}
      </div>

      <TargetSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectTarget={handleSelectFromSearch}
        onCreateNew={handleCreateNew}
        operationId={operation.id}
      />

      <TargetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTarget}
        initialData={selectedTarget}
        operationId={operation.id}
      />
    </div>
  );
}