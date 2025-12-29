"use client"

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
  priority: string | null;
  department: string;
  startDate: string;
  endDate: string;
}

interface OperationsFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export function OperationsFilter({ onFilterChange }: OperationsFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    department: "",
    startDate: "",
    endDate: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.priority, 
    filters.department, 
    filters.startDate, 
    filters.endDate
  ].filter(Boolean).length;

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const reset = { priority: null, department: "", startDate: "", endDate: "" };
    setFilters(reset);
    onFilterChange(reset);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-[10px] bg-gov-blue text-white hover:bg-gov-blue/90">
                {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filtros Avançados</h4>
            {activeFiltersCount > 0 && (
                <button onClick={handleClear} className="text-xs text-red-500 hover:underline">
                    Limpar tudo
                </button>
            )}
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Prioridade</label>
            <div className="flex flex-wrap gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                    <div 
                        key={p}
                        onClick={() => setFilters({...filters, priority: filters.priority === p ? null : p})}
                        className={`text-xs px-2 py-1 rounded cursor-pointer border transition-colors ${
                            filters.priority === p 
                            ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {p}
                    </div>
                ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Delegacia / Dept.</label>
            <Input 
                placeholder="Ex: DENARC" 
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="h-8"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Período de Criação</label>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <span className="text-[10px] text-gray-500">De</span>
                    <Input 
                        type="date" 
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="h-8 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-gray-500">Até</span>
                    <Input 
                        type="date" 
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="h-8 text-xs"
                    />
                </div>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full mt-2">Aplicar Filtros</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
