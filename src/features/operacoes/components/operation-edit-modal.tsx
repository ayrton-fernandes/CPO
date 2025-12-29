"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/types";
import { operationsService } from "@/services/operationsService";
import { toast } from "sonner";

interface EditOperationModalProps {
  operation: Operation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditOperationModal({ operation, isOpen, onClose, onUpdate }: EditOperationModalProps) {
  const [formData, setFormData] = useState({
    title: operation.title,
    description: operation.description,
    priority: operation.priority,
    department: operation.department,
  });

  const handleSave = () => {
    operationsService.updateOperation(operation.id, formData);
    toast.success("Dados da operação atualizados com sucesso.");
    onUpdate();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Editar Dados da Operação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
            <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
            <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Prioridade</label>
                <select 
                    className="w-full h-10 border rounded px-3 text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Unidade</label>
                <Input 
                    value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} 
                />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
