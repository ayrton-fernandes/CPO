"use client";

import { Operation, OperationStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlanningKanbanProps {
  operations: Operation[];
}

const COLUMNS: { id: OperationStatus; label: string; bg: string }[] = [
  { id: 'AGUARDANDO_VALIDACAO', label: 'Aguardando Validação', bg: 'bg-gray-100' },
  { id: 'PLANEJAMENTO', label: 'Em Planejamento', bg: 'bg-blue-50' },
  { id: 'PRONTA_EXECUCAO', label: 'Pronta p/ Execução', bg: 'bg-green-50' },
];

export function PlanningKanban({ operations }: PlanningKanbanProps) {
  
  const getColumnOperations = (status: OperationStatus) => {
    return operations.filter(op => op.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colOps = getColumnOperations(col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[300px] flex flex-col h-full rounded-lg bg-gray-50/50 border border-gray-200">
             <div className={cn("p-4 border-b rounded-t-lg font-semibold flex justify-between items-center", col.bg)}>
                <span>{col.label}</span>
                <span className="bg-white/50 text-xs px-2 py-1 rounded-full text-gray-700">{colOps.length}</span>
             </div>
             
             <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
                {colOps.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md">
                        Sem itens nesta etapa
                    </div>
                ) : (
                    colOps.map(op => (
                        <div key={op.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase", getPriorityColor(op.priority))}>
                                    {op.priority}
                                </span>
                                {op.department && (
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {op.department}
                                    </span>
                                )}
                            </div>
                            <h4 className="font-semibold text-sm mb-1 text-gray-900 line-clamp-2">{op.title}</h4>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{op.description}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                <span className="text-xs text-gray-400">{new Date(op.updatedAt).toLocaleDateString('pt-BR')}</span>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                                    <Link href={`/operations/${op.id}`}>
                                        <ArrowRight className="h-4 w-4 text-gov-blue" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
}