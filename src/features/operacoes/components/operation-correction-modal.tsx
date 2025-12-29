"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checklist: string[]) => void;
}

const CHECKLIST_ITEMS = [
  "Confirmar endereço do Alvo Principal",
  "Anexar fotos recentes dos alvos",
  "Atualizar CPF de comparsas",
  "Incluir relatório de vínculos",
  "Detalhamento de logística de acesso"
];

export function CorrectionModal({ isOpen, onClose, onConfirm }: CorrectionModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSend = () => {
    if (selectedItems.length === 0) {
      toast.error("Selecione ao menos um item da pendência.");
      return;
    }
    onConfirm(selectedItems);
    setSelectedItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-red-600">Solicitar Correções</DialogTitle>
          <DialogDescription>
            A operação voltará para status de Análise. Selecione os dados faltantes:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item} className="flex items-center gap-3 p-3 rounded border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-gov-blue focus:ring-gov-blue" 
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleSend}>Enviar para Inteligência</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
