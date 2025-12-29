"use client";

import { useMemo, useState } from "react";
import { operationsService } from "@/services/operationsService";
import { Target, Operation } from "@/types";
import { MapPin, X, User, Target as TargetIcon, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function OperationsMap() {
  const operations = operationsService.getAll().filter(op => op.status !== 'FINALIZADA');
  const [selectedTarget, setSelectedTarget] = useState<(Target & { opTitle: string }) | null>(null);
  const [activeOpId, setActiveOpId] = useState<string>("ALL");

  const targetsOnMap = useMemo(() => {
    const list: (Target & { opTitle: string, opId: string, top: string, left: string })[] = [];
    
    operations.forEach((op, opIdx) => {
        if (activeOpId !== "ALL" && op.id !== activeOpId) return;

        op.targets.forEach((t, tIdx) => {
            // Gerar coordenadas fixas baseadas no ID para não mudar no re-render
            const seed = (parseInt(t.id.replace(/\D/g, '')) || 1) + opIdx;
            const top = (20 + (seed % 60)) + "%";
            const left = (15 + ((seed * 7) % 70)) + "%";

            list.push({ ...t, opTitle: op.title, opId: op.id, top, left });
        });
    });
    return list;
  }, [operations, activeOpId]);

  return (
    <div className="w-full h-full relative bg-[#e2e8f0] overflow-hidden rounded-lg shadow-inner">
        {/* Controle Superior */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-md border flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase px-2 border-r">Operação:</span>
                <select 
                    className="text-xs font-bold bg-transparent focus:outline-none"
                    value={activeOpId}
                    onChange={(e) => setActiveOpId(e.target.value)}
                >
                    <option value="ALL">Visualização Global (Todos os Alvos)</option>
                    {operations.map(op => <option key={op.id} value={op.id}>{op.title}</option>)}
                </select>
            </div>
        </div>

        {/* Mock do Mapa (PE Shape ou Div com Design) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <TargetIcon className="h-96 w-96 text-gov-blue opacity-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-white select-none">PERNAMBUCO</div>
        </div>

        {/* Pinos Dinâmicos */}
        {targetsOnMap.map((t) => (
            <button
                key={t.id}
                className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10",
                    selectedTarget?.id === t.id && "z-30 scale-150"
                )}
                style={{ top: t.top, left: t.left }}
                onClick={() => setSelectedTarget(t)}
            >
                <div className="relative">
                    <MapPin className={cn(
                        "h-8 w-8 drop-shadow-md",
                        t.riskLevel === 'EXTREME' ? "text-red-600 fill-red-600" : 
                        t.riskLevel === 'HIGH' ? "text-orange-500 fill-orange-500" : "text-gov-blue fill-gov-blue"
                    )} />
                    {selectedTarget?.id === t.id && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-20" />
                    )}
                </div>
            </button>
        ))}

        {/* Card do Alvo Selecionado */}
        {selectedTarget && (
            <div className="absolute bottom-6 right-6 z-40 w-72 animate-in slide-in-from-right-5 fade-in duration-300">
                <Card className="shadow-2xl border-t-4 border-t-gov-blue bg-white">
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-gov-blue font-bold">
                                {selectedTarget.name.charAt(0)}
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">{selectedTarget.name}</CardTitle>
                                <p className="text-[10px] text-gov-blue font-bold">Vulgo: {selectedTarget.nickname}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedTarget(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                            <Badge variant="outline" className="uppercase px-1.5 py-0">Risco: {selectedTarget.riskLevel}</Badge>
                            <span className="text-gray-400 font-medium italic">{selectedTarget.opTitle}</span>
                        </div>
                        
                        <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border">
                            <strong>Localização Provável:</strong><br/>
                            {selectedTarget.addresses[0]?.neighborhood || "Não mapeado"}
                        </div>

                        <Button size="sm" className="w-full text-xs h-8 bg-gov-blue" asChild>
                            <Link href={`/operations/${selectedTarget.operationId}`}>Ver Dossiê Completo</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100">
            SISTEMA CPO • COORDENADAS TÁTICAS EM TEMPO REAL
        </div>
    </div>
  );
}
