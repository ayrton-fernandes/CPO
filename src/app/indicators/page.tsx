"use client"

import { useMemo, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsService } from "@/services/operationsService";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, TrendingUp, AlertCircle, Search, Calendar } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";

const COLORS = ['#003399', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function IndicatorsPage() {
  const { isAuthenticated } = useAuthStore();
  const allOperations = operationsService.getAll();
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const departments = useMemo(() => {
    return ["ALL", ...Array.from(new Set(allOperations.map(op => op.department).filter(Boolean)))];
  }, [allOperations]);

  const filteredData = useMemo(() => {
    return allOperations.filter(op => {
        const matchesDept = deptFilter === "ALL" || op.department === deptFilter;
        const matchesStatus = statusFilter === "ALL" || op.status === statusFilter;
        return matchesDept && matchesStatus;
    });
  }, [allOperations, deptFilter, statusFilter]);

  const statusData = useMemo(() => {
    const counts: any = {};
    filteredData.forEach(op => {
      counts[op.status] = (counts[op.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const maturityEfficiency = useMemo(() => {
    return filteredData.map(op => ({
        name: op.title.substring(0, 15) + "...",
        maturidade: op.maturity,
        alvos: op.targets.length
    })).sort((a, b) => a.maturidade - b.maturidade);
  }, [filteredData]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gov-blue uppercase tracking-tight">Painel Gerencial</h1>
            <p className="text-gray-500 font-medium">Indicadores táticos e operacionais do CPO.</p>
        </div>

        <div className="space-y-6">
            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-64 space-y-2">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">
                        <Filter className="h-3 w-3" /> Unidade Policial
                    </label>
                    <select 
                        className="w-full h-10 border rounded-md px-3 text-sm"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        {departments.map(d => <option key={d} value={d}>{d === 'ALL' ? 'Todas as Unidades' : d}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-64 space-y-2">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">
                        <Calendar className="h-3 w-3" /> Status Atual
                    </label>
                    <select 
                        className="w-full h-10 border rounded-md px-3 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="EM_ANALISE">Análise</option>
                        <option value="PRONTA_EXECUCAO">Pronta para Execução</option>
                        <option value="FINALIZADA">Finalizada</option>
                    </select>
                </div>
                <div className="bg-blue-50 p-2 rounded px-4 h-10 flex items-center border border-blue-100 ml-auto">
                    <TrendingUp className="h-4 w-4 text-gov-blue mr-2" />
                    <span className="text-xs font-bold text-gov-blue uppercase">Base: {filteredData.length} Operações</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base uppercase tracking-tight">Distribuição de Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base uppercase tracking-tight">Eficiência de Maturidade</CardTitle>
                            <CardDescription>Operações travadas requerem atenção do Diretor.</CardDescription>
                        </div>
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={maturityEfficiency} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                            <Tooltip />
                            <Bar dataKey="maturidade" name="% Maturidade" fill="#003399" radius={[0, 4, 4, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
      </PageContainer>
    </div>
  );
}