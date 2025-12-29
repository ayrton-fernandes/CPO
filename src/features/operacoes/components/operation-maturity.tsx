"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface OperationMaturityProps {
  value: number;
}

export function OperationMaturity({ value }: OperationMaturityProps) {
  const isReady = value >= 70;

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Maturidade da Investigação</span>
            {isReady ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">Pronta para Validação</Badge>
            ) : (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Em Maturação</Badge>
            )}
        </div>
        <span className="text-lg font-black text-gov-blue">{value}%</span>
      </div>
      
      <Progress value={value} className="h-2" />
      
      <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
        {isReady ? (
            <>
                <ShieldCheck className="h-3 w-3 text-green-600" />
                Dossiê robusto. Evidências suficientes para prosseguir.
            </>
        ) : (
            <>
                <AlertCircle className="h-3 w-3 text-yellow-600" />
                Necessário atingir 70% de maturidade (CPF e Endereços Confirmados) para enviar ao Planejamento.
            </>
        )}
      </div>
    </div>
  );
}
