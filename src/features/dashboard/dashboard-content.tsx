"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { operationsService } from "@/services/operationsService";
import { Operation } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Clock, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlanningKanban } from "./planning-kanban";
import { OperationsFilter, FilterState } from "@/features/operacoes/components/operations-filter";

export function DashboardContent() {
  const { user } = useAuthStore();
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    department: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (user) {
        setAllOperations(operationsService.getAll(user.id, user.role));
    }
  }, [user]);

  const myOperations = useMemo(() => {
    return allOperations.filter(op => {
        // Priority Filter
        if (filters.priority && op.priority !== filters.priority) return false;
        
        // Department Filter
        if (filters.department && (!op.department || !op.department.toLowerCase().includes(filters.department.toLowerCase()))) return false;

        // Date Range Filter
        if (filters.startDate) {
            const opDate = new Date(op.createdAt);
            const start = new Date(filters.startDate);
            if (opDate < start) return false;
        }
        if (filters.endDate) {
            const opDate = new Date(op.createdAt);
            const end = new Date(filters.endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            if (opDate > end) return false;
        }

        return true;
    });
  }, [allOperations, filters]);

  if (!user) return null;

  const pendingValidations = myOperations.filter(op => op.status === 'AGUARDANDO_VALIDACAO');
  const activeInvestigations = myOperations.filter(op => op.status === 'EM_ANALISE');

  const stats = [
    {
      title: "Total de Operações",
      value: myOperations.length,
      icon: ShieldAlert,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Em Análise",
      value: myOperations.filter(op => op.status === 'EM_ANALISE').length,
      icon: FileText,
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
    {
      title: "Em Planejamento",
      value: myOperations.filter(op => op.status === 'PLANEJAMENTO').length,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100"
    },
    {
      title: "Prontas p/ Execução",
      value: myOperations.filter(op => op.status === 'PRONTA_EXECUCAO').length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100"
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'EM_ANALISE': return 'secondary';
      case 'AGUARDANDO_VALIDACAO': return 'warning';
      case 'PLANEJAMENTO': return 'outline';
      case 'PRONTA_EXECUCAO': return 'success';
      case 'FINALIZADA': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EM_ANALISE': return 'Em Análise';
      case 'AGUARDANDO_VALIDACAO': return 'Aguardando Validação';
      case 'PLANEJAMENTO': return 'Em Planejamento';
      case 'PRONTA_EXECUCAO': return 'Pronta p/ Execução';
      case 'FINALIZADA': return 'Finalizada';
      default: return status;
    }
  };

  if (user.role === 'planning') {
      return (
          <div className="space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gov-blue">Painel de Planejamento</h1>
                    <p className="text-gray-500">Gestão de fluxo e validação de operações.</p>
                </div>
                <div className="flex gap-2">
                    <OperationsFilter onFilterChange={setFilters} />
                </div>
              </div>
              <div className="flex-1 min-h-[500px]">
                  {myOperations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-lg border-2 border-dashed">
                          <ShieldAlert className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">Nenhuma operação encontrada</h3>
                          <p className="text-gray-500">Tente ajustar os filtros ou aguarde novas demandas.</p>
                      </div>
                  ) : (
                    <PlanningKanban operations={myOperations} />
                  )}
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gov-blue">Dashboard</h1>
            <p className="text-gray-500">Bem-vindo de volta, {user.name}.</p>
        </div>
        <div className="flex gap-2">
            <OperationsFilter onFilterChange={setFilters} />
            {(user.role === 'intelligence_manager' || user.role === 'admin_master') && (
                <Button asChild>
                    <Link href="/operations/new">Nova Operação</Link>
                </Button>
            )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Operações Recentes</CardTitle>
            <CardDescription>
              Você tem {myOperations.length} operações vinculadas ao seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOperations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhuma operação encontrada.</p>
              ) : (
                  myOperations.slice(0, 5).map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="font-semibold text-sm">{op.title}</span>
                        <span className="text-xs text-gray-500">{op.location}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusBadgeVariant(op.status)}>
                            {getStatusLabel(op.status)}
                        </Badge>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/operations/${op.id}`}>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Ações Prioritárias</CardTitle>
            <CardDescription>
              Atividades que requerem sua atenção imediata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(user.role === 'admin_master' || user.role === 'management') && pendingValidations.length > 0 && (
                 <div className="space-y-4">
                    {pendingValidations.map(op => (
                        <div key={op.id} className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            <p className="text-sm font-semibold text-yellow-800">Validação Pendente</p>
                            <p className="text-xs text-yellow-700 mt-1">{op.title} aguarda validação do planejamento.</p>
                             <Button size="sm" variant="outline" className="mt-2 w-full border-yellow-600 text-yellow-700 hover:bg-yellow-100" asChild>
                                <Link href={`/operations/${op.id}`}>Revisar</Link>
                            </Button>
                        </div>
                    ))}
                 </div>
            )}
            
            {(user.role === 'investigator' || user.role === 'analyst') && activeInvestigations.length > 0 && (
                <div className="space-y-4">
                     {activeInvestigations.map(op => (
                        <div key={op.id} className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <p className="text-sm font-semibold text-blue-800">Operação em Análise</p>
                            <p className="text-xs text-blue-700 mt-1">Continue preenchendo os dados de {op.title}.</p>
                             <Button size="sm" variant="outline" className="mt-2 w-full border-blue-600 text-blue-700 hover:bg-blue-100" asChild>
                                <Link href={`/operations/${op.id}`}>Ver Detalhes</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {(user.role === 'intelligence_manager' || user.role === 'analyst') && (
                 <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">Nenhuma ação crítica pendente.</p>
                    <Button variant="link" className="mt-2 text-gov-blue">Ver todos os relatórios</Button>
                 </div>
            )}

             {user.role === 'admin_master' && (
                 <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">Visão Geral do Administrador Master</p>
                 </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}