"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/types";
import { operationsService } from "@/services/operationsService";
import { useNotificationStore } from "@/hooks/useNotificationStore";

interface EditOperationModalProps {
  operation: Operation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditOperationModal({ operation, isOpen, onClose, onUpdate }: EditOperationModalProps) {
  const { addNotification } = useNotificationStore();
  const [formData, setFormData] = useState({
    title: operation.title,
    description: operation.description,
    priority: operation.priority,
    department: operation.department,
    location: operation.location,
    resources: operation.resources || "",
  });

  // Update form data when operation changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: operation.title,
        description: operation.description,
        priority: operation.priority,
        department: operation.department,
        location: operation.location,
        resources: operation.resources || "",
      });
    }
  }, [isOpen, operation]);

  const handleSave = () => {
    operationsService.updateOperation(operation.id, formData);
    addNotification({
      title: "Operação Atualizada",
      description: `Os dados da operação "${formData.title}" foram salvos com sucesso.`,
      type: 'success'
    });
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Dados da Operação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Título da Investigação</label>
            <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="Ex: Operação Alvorada"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Unidade Responsável</label>
                <Input 
                    value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} 
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Localidade Principal</label>
                <Input 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Descrição / Objetivo</label>
            <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={3}
                placeholder="Descreva o objetivo principal da operação..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Recursos Alocados</label>
            <Textarea 
                value={formData.resources} 
                onChange={(e) => setFormData({...formData, resources: e.target.value})} 
                rows={2}
                placeholder="Ex: Viaturas, Armamento, Drones..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nível de Prioridade</label>
            <select 
                className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
            >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica (Urgente)</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-gov-blue hover:bg-blue-800 text-white" onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
