"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Target, Address } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin, ShieldAlert } from "lucide-react";
import { operationsService } from "@/services/operationsService";
import { useNotificationStore } from "@/hooks/useNotificationStore";

const targetSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  nickname: z.string().optional(),
  cpf: z.string().optional(),
  periculosidade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'EXTREMA']),
  addresses: z.array(z.object({
    label: z.string().min(1, "Tipo é obrigatório"),
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    isConfirmed: z.boolean()
  }))
});

type TargetFormValues = z.infer<typeof targetSchema>;

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Target) => void;
  initialData?: Target | null;
  operationId: string;
}

export function TargetModal({ isOpen, onClose, onSave, initialData, operationId }: TargetModalProps) {
  const [conflictOp, setConflictOp] = useState<any>(null);
  const { addNotification } = useNotificationStore();
  
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<TargetFormValues>({
    resolver: zodResolver(targetSchema),
    defaultValues: initialData ? {
        name: initialData.name,
        nickname: initialData.nickname || "",
        cpf: initialData.cpf || "",
        periculosidade: initialData.riskLevel as any, // mapping riskLevel to periculosidade
        addresses: initialData.addresses.map(a => ({
            label: "", // assuming label is street for simple mapping or adding label to Address type later
            street: a.street,
            number: a.number,
            neighborhood: a.neighborhood,
            city: a.city,
            isConfirmed: a.isConfirmed
        }))
    } : {
      name: "",
      nickname: "",
      periculosidade: "MEDIA",
      addresses: [{ label: "Residência", street: "", number: "", neighborhood: "", city: "Recife", isConfirmed: false }]
    }
  });

  const nicknameValue = watch("nickname");
  const cpfValue = watch("cpf");

  function cpfCpfClean(cpf?: string) {
    return cpf?.replace(/\D/g, "");
  }

  // Check conflict on value change
  useEffect(() => {
    if (!nicknameValue && !cpfValue) {
      setConflictOp(null);
      return;
    }

    const timer = setTimeout(() => {
      const conflict = operationsService.checkTargetConflict(cpfCpfClean(cpfValue) || "", nicknameValue || "", operationId);
      setConflictOp(conflict);
      
      if (conflict) {
        addNotification({
          title: "CONFLITO DE INVESTIGAÇÃO",
          description: `Alvo "${nicknameValue || cpfValue}" está sendo investigado simultaneamente na ${conflict.title}.`,
          type: 'warning'
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [nicknameValue, cpfValue, operationId, addNotification]);

  const { fields, append, remove } = useFieldArray({ control, name: "addresses" });

  const onSubmit = (values: TargetFormValues) => {
    const formattedTargets: Target = {
      id: initialData?.id || `target-${Date.now()}`,
      name: values.name,
      nickname: values.nickname || "",
      cpf: values.cpf || "",
      hasCpf: !!values.cpf,
      hasPhoto: initialData?.hasPhoto || false,
      riskLevel: values.periculosidade as any,
      operationId: operationId,
      addresses: values.addresses.map((a, idx) => ({
          id: initialData?.addresses[idx]?.id || `addr-${Date.now()}-${idx}`,
          street: a.street,
          number: a.number,
          neighborhood: a.neighborhood,
          city: a.city,
          isConfirmed: a.isConfirmed
      }))
    };
    onSave(formattedTargets);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Alvo" : "Cadastrar Novo Alvo"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {conflictOp && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg flex gap-3 animate-pulse">
              <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800">ALERTA DE DUPLICIDADE (CONFLITO)</p>
                <p className="text-xs text-red-700">
                  Este alvo já é objeto de investigação ativa na operação: 
                  <strong className="block mt-1 underline">"{conflictOp.title}" ({conflictOp.department})</strong>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input {...register("name")} placeholder="Nome do investigado" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vulgo / Apelido</label>
              <Input {...register("nickname")} placeholder="Ex: Galo Cego" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CPF</label>
              <Input {...register("cpf")} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Periculosidade</label>
              <select 
                {...register("periculosidade")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="EXTREMA">Extrema</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Endereços Vinculados
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", street: "", number: "", neighborhood: "", city: "", isConfirmed: false })}>
                <Plus className="h-4 w-4 mr-1" /> Add Endereço
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-3 gap-3">
                  <Input {...register(`addresses.${index}.label`)} placeholder="Tipo (ex: Casa)" />
                  <Input {...register(`addresses.${index}.street`)} placeholder="Rua" className="col-span-2" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input {...register(`addresses.${index}.number`)} placeholder="Nº" />
                  <Input {...register(`addresses.${index}.neighborhood`)} placeholder="Bairro" />
                  <Input {...register(`addresses.${index}.city`)} placeholder="Cidade" />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" {...register(`addresses.${index}.isConfirmed`)} className="h-4 w-4" />
                    Confirmado
                  </label>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Alvo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}