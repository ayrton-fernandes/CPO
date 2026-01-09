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
import { Filter, TrendingUp, AlertCircle, Search } from "lucide-react";

const COLORS = ['#003399', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function IndicatorsDashboard() {
  const allOperations = operationsService.getAll();
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const departments = useMemo(() => {
    return ["ALL", ...Array.from(new Set(allOperations.map(op => op.department).filter(Boolean)))];
  }, [allOperations]);

  const filteredData = useMemo(() => {
    return allOperations.filter(op => {
        const matchesDept = deptFilter === "ALL" || op.department === deptFilter;
        const matchesSearch = op.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesSearch;
    });
  }, [allOperations, deptFilter, searchTerm]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
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

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Gerencial */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Search className="h-3 w-3" /> Buscar Operação
            </label>
            <Input 
                placeholder="Filtrar base de dados..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-full md:w-64 space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
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
        <div className="bg-blue-50 p-2 rounded px-4 h-10 flex items-center border border-blue-100">
            <TrendingUp className="h-4 w-4 text-gov-blue mr-2" />
            <span className="text-xs font-bold text-gov-blue">Base: {filteredData.length} Operações</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Status</CardTitle>
            <CardDescription>Pipeline atual da unidade selecionada.</CardDescription>
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
                <CardTitle className="text-base">Gargalos de Maturidade</CardTitle>
                <CardDescription>Investigações com baixa maturidade requerem atenção.</CardDescription>
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

      <Card>
        <CardHeader>
            <CardTitle className="text-base">Eficiência de Investigação vs Volume de Alvos</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maturityEfficiency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="maturidade" stroke="#003399" strokeWidth={3} name="Maturidade %" />
                    <Line type="monotone" dataKey="alvos" stroke="#FF8042" name="Nº de Alvos" />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}