"use client";

import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { operationsService } from "@/services/operationsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldAlert, MapPin, Search, Plus, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { TargetModal } from "@/features/operacoes/components/target-modal";
import { Target } from "@/types";
import { toast } from "sonner";

export default function TargetsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);

  const operations = operationsService.getAll();

  const loadTargets = () => {
    setTargets(operationsService.getAllTargets());
  };

  useEffect(() => {
    if (isAuthenticated) {
        loadTargets();
    }
  }, [isAuthenticated]);

  const filteredTargets = targets.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.nickname.toLowerCase().includes(search.toLowerCase()) ||
    t.cpf.includes(search)
  );

  const handleAddTarget = () => {
    setSelectedTarget(null);
    setIsModalOpen(true);
  };

  const handleEditTarget = (target: Target) => {
    setSelectedTarget(target);
    setIsModalOpen(true);
  };

  const handleSaveTarget = (targetData: Target) => {
    try {
        operationsService.saveTarget(targetData);
        toast.success(selectedTarget ? "Alvo atualizado com sucesso" : "Alvo cadastrado com sucesso");
        loadTargets();
        setIsModalOpen(false);
    } catch (error) {
        toast.error("Erro ao salvar alvo");
    }
  };

  const getTargetOpTitle = (target: Target) => {
    if (!target.linkedOperationIds || target.linkedOperationIds.length === 0) return "SEM VÍNCULO";
    const op = operationsService.getById(target.linkedOperationIds[0]);
    return op ? op.title : "OPERAÇÃO DESCONHECIDA";
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gov-blue">Banco de Alvos</h1>
                <p className="text-gray-500">Repositório central de indivíduos sob investigação.</p>
            </div>
            
            <Button onClick={handleAddTarget}>
                <Plus className="h-4 w-4 mr-2" /> Cadastrar Novo Alvo
            </Button>
        </div>

        <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Buscar por nome, vulgo ou CPF..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTargets.map((target) => (
                <Card key={target.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gov-blue">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                    {target.hasPhoto ? (
                                        <Badge className="bg-green-600 p-1 rounded-full h-5 w-5 flex items-center justify-center">
                                            <ShieldAlert className="h-3 w-3 text-white" />
                                        </Badge>
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-lg leading-tight">{target.name}</CardTitle>
                                    <p className="text-sm text-gov-blue font-bold italic">Vulgo: {target.nickname}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTarget(target)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Badge variant={target.riskLevel === 'EXTREME' || target.riskLevel === 'HIGH' ? 'destructive' : 'default'} className="text-[10px]">
                                    {target.riskLevel}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                            <p className="flex justify-between"><span className="text-gray-500">CPF:</span> <span className="font-mono">{target.cpf || "NÃO CONSTA"}</span></p>
                            <p className="flex items-center gap-1 text-gray-500 text-xs">
                                <MapPin className="h-3 w-3" /> {target.addresses[0]?.neighborhood || "S/N"}, {target.addresses[0]?.city || "RECIFE"}
                            </p>
                        </div>
                        <div className="pt-2 border-t text-[10px] text-gray-400 flex justify-between items-center">
                            <span>VINCULADO À:</span>
                            <Badge variant="outline" className="text-[9px] font-bold text-gray-600 bg-gray-50">
                                {getTargetOpTitle(target)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <TargetModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTarget}
            initialData={selectedTarget}
        />
      </PageContainer>
    </div>
  );
}