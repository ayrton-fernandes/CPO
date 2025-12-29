"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Operation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, AlertTriangle, PenLine, Save, X } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { operationsService } from "@/services/operationsService";
import { toast } from "sonner";

interface OperationGeneralProps {
  operation: Operation;
  onUpdate?: () => void;
}

export function OperationGeneral({ operation, onUpdate }: OperationGeneralProps) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      resources: operation.resources || "",
      assignedAgents: operation.assignedAgents?.join(", ") || ""
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const canEdit = user?.role === 'planning' || user?.role === 'admin_master';

  const handleSave = () => {
    operationsService.updateOperation(operation.id, {
        resources: editForm.resources,
        assignedAgents: editForm.assignedAgents.split(",").map(s => s.trim()).filter(Boolean)
    });
    toast.success("Dados estratégicos atualizados");
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle className="text-lg uppercase tracking-tight">Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase">Descrição da Demanda</h4>
                <p className="mt-1 text-sm text-gray-900 leading-relaxed">{operation.description}</p>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
                <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Prioridade</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityColor(operation.priority)}`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {operation.priority}
                </span>
                </div>
                <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Localização</h4>
                <div className="flex items-center text-sm text-gray-900 font-medium">
                    <MapPin className="w-4 h-4 mr-1 text-gov-blue" />
                    {operation.location || "Não informada"}
                </div>
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase">Unidade Responsável</h4>
                <p className="mt-1 text-sm text-gray-900 font-bold">{operation.department || "Não informado"}</p>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle className="text-lg uppercase tracking-tight">Metadados de Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Criado em</h4>
                    <div className="flex items-center text-sm text-gray-900 font-medium">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(operation.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Última Atualização</h4>
                    <div className="flex items-center text-sm text-gray-900 font-medium">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(operation.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Autor do Registro</h4>
                    <div className="flex items-center text-sm text-gray-900 font-medium">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        ID: {operation.createdBy}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Efetivo Alocado</h4>
                    <div className="flex items-center text-sm text-gray-900 font-medium truncate">
                        <User className="w-4 h-4 mr-1 text-gov-blue" />
                        {operation.assignedAgents?.length > 0 ? operation.assignedAgents.join(", ") : "Nenhum agente"}
                    </div>
                </div>
            </div>
            </CardContent>
        </Card>
        </div>

        <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-50/50">
                <CardTitle className="text-base text-gov-blue uppercase tracking-wider font-black">Planejamento Estratégico & Recursos</CardTitle>
                {canEdit && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-white text-[10px] font-bold uppercase">
                        <PenLine className="h-3 w-3 mr-2" /> Editar Recursos
                    </Button>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Recursos Alocados (Viaturas, Armamento, Tecnologia)</label>
                            <Textarea 
                                value={editForm.resources} 
                                onChange={(e) => setEditForm({...editForm, resources: e.target.value})}
                                placeholder="Descreva os recursos logísticos..."
                                className="bg-white min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Equipe Designada (IDs separados por vírgula)</label>
                            <Input 
                                value={editForm.assignedAgents} 
                                onChange={(e) => setEditForm({...editForm, assignedAgents: e.target.value})}
                                placeholder="Ex: u-analista, u-investigador"
                                className="bg-white"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Logística e Equipamentos</h4>
                            <p className="text-sm text-gray-900 leading-relaxed bg-white p-3 rounded border border-blue-50 shadow-sm min-h-[60px] whitespace-pre-wrap">
                                {operation.resources || "Nenhum recurso logístico especificado pelo planejamento."}
                            </p>
                        </div>
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">IDs de Agentes Atribuídos</h4>
                            <div className="flex flex-wrap gap-2">
                                {operation.assignedAgents?.length > 0 ? (
                                    operation.assignedAgents.map(agentId => (
                                        <Badge key={agentId} variant="secondary" className="bg-white text-gov-blue border-blue-100 font-bold uppercase text-[10px]">
                                            {agentId}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic font-medium">Pendente de atribuição de equipe.</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            {isEditing && (
                <CardFooter className="flex justify-end gap-2 border-t border-blue-100 pt-4 bg-white/50">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-xs font-bold uppercase">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} className="text-xs font-bold uppercase bg-gov-blue">
                        <Save className="h-3 w-3 mr-2" /> Salvar Alterações
                    </Button>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}