"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Link as LinkIcon, AlertCircle } from "lucide-react";
import { operationsService } from "@/services/operationsService";
import { Target } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TargetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTarget: (target: Target) => void;
  onCreateNew: () => void;
  operationId: string;
}

export function TargetSearchModal({ isOpen, onClose, onSelectTarget, onCreateNew, operationId }: TargetSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Target[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setSearchTerm("");
        setResults([]);
        setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = () => {
    if (searchTerm.length < 2) return;
    
    const allTargets = operationsService.getAllTargets();
    const filtered = allTargets.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cpf?.includes(searchTerm)
    );
    
    setResults(filtered);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>Buscar no Banco de Alvos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
            <div className="flex gap-2">
                <Input 
                    placeholder="Digite Nome, Vulgo ou CPF..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <Button onClick={handleSearch} disabled={searchTerm.length < 2}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            <div className="min-h-[200px] border rounded-md bg-gray-50 p-2">
                {!hasSearched && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 mt-12 mr-5">
                        <Search className="h-8 w-8 opacity-20" />
                        <span className="text-xs">Digite para buscar alvos existentes</span>
                    </div>
                )}

                {hasSearched && results.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                        <AlertCircle className="h-8 w-8 text-yellow-500 opacity-50" />
                        <div className="text-center">
                            <p className="text-sm font-medium">Nenhum alvo encontrado.</p>
                            <p className="text-xs text-gray-400">Verifique a grafia ou cadastre um novo.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onCreateNew} className="mt-2 border-dashed border-gov-blue text-gov-blue hover:bg-blue-50">
                            <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Novo Alvo
                        </Button>
                    </div>
                )}

                {hasSearched && results.length > 0 && (
                    <div className="space-y-2">
                        {results.map(target => {
                            const isAlreadyLinked = target.linkedOperationIds.includes(operationId);
                            return (
                                <div key={target.id} className="bg-white p-3 rounded border shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{target.name}</h4>
                                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                            {target.nickname && <span>Vulgo: <strong>{target.nickname}</strong></span>}
                                            {target.cpf && <span>CPF: {target.cpf}</span>}
                                        </div>
                                        <div className="mt-1">
                                            {isAlreadyLinked ? (
                                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                    Já vinculado nesta Operação
                                                </Badge>
                                            ) : target.linkedOperationIds.length > 0 ? (
                                                <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Em Investigação (Outra Op.)
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                    Disponível (Banco Geral)
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-gov-blue hover:bg-blue-50" onClick={() => onSelectTarget(target)} disabled={isAlreadyLinked}>
                                        <LinkIcon className="h-4 w-4 mr-2" /> Vincular
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>

        <DialogFooter className="justify-between sm:justify-between">
            <Button variant="ghost" onClick={onCreateNew} className="text-gray-500 hover:text-gov-blue">
                <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Novo (Pular Busca)
            </Button>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
