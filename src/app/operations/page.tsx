"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin, Calendar, Shield, Search, FilterX } from "lucide-react";
import { OperationStatus, Operation } from "@/types";

export default function OperationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [allOperations, setAllOperations] = useState<Operation[]>([]);

  useEffect(() => {
    if (user) {
        setAllOperations(operationsService.getAll(user.id, user.role));
    }
  }, [user]);

  const filteredOperations = useMemo(() => {
    return allOperations.filter(op => {
      const matchesSearch = op.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           op.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || op.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || op.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allOperations, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gov-blue uppercase tracking-tight">Painel de Operações</h1>
                    <p className="text-gray-500">Gestão centralizada de investigações em curso.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border shadow-sm">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Buscar por título ou ID..." 
                        className="pl-10 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Todos os Status</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="AGUARDANDO_VALIDACAO">Aguardando Validação</option>
                    <option value="PLANEJAMENTO">Em Planejamento</option>
                    <option value="PRONTA_EXECUCAO">Pronta p/ Execução</option>
                </select>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option value="ALL">Todas as Prioridades</option>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                </select>
            </div>
        </div>

        <div className="grid gap-4">
            {filteredOperations.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
                    <FilterX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhuma operação atende aos filtros.</p>
                    <Button variant="link" onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); }}>Limpar filtros</Button>
                </div>
            ) : (
                filteredOperations.map((op) => (
                    <Card key={op.id} className="hover:shadow-md transition-shadow group border-l-4 border-l-gov-blue">
                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <h3 className="font-bold text-base md:text-lg text-gov-blue group-hover:underline">{op.title}</h3>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">{op.status.replace('_', ' ')}</Badge>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                            {op.maturity}%
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {op.location}</span>
                                    <span className="flex items-center gap-1 font-medium"><Shield className="h-3 w-3" /> {op.priority}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(op.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild className="w-full md:w-auto border-gov-blue text-gov-blue hover:bg-blue-50">
                                <Link href={`/operations/${op.id}`} className="w-full flex justify-center items-center">
                                    Gerenciar <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </PageContainer>
    </div>
  );
}
