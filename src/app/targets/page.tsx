"use client";

import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { MOCK_OPERATIONS } from "@/services/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldAlert, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function TargetsPage() {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");

  const allTargets = useMemo(() => {
    return MOCK_OPERATIONS.flatMap(op => op.targets.map(t => ({ ...t, opTitle: op.title })));
  }, []);

  const filteredTargets = allTargets.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.nickname.toLowerCase().includes(search.toLowerCase()) ||
    t.cpf.includes(search)
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-8 space-y-4">
            <div>
                <h1 className="text-3xl font-bold text-gov-blue">Banco de Alvos</h1>
                <p className="text-gray-500">Repositório central de indivíduos sob investigação.</p>
            </div>
            
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar por nome, vulgo ou CPF..." 
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTargets.map((target) => (
                <Card key={target.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gov-blue">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{target.name}</CardTitle>
                                    <p className="text-sm text-gov-blue font-bold italic">Vulgo: {target.nickname}</p>
                                </div>
                            </div>
                            <Badge variant={target.riskLevel === 'EXTREME' ? 'destructive' : 'default'}>
                                {target.riskLevel}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                            <p className="flex justify-between"><span className="text-gray-500">CPF:</span> <span>{target.cpf}</span></p>
                            <p className="flex items-center gap-1 text-gray-500">
                                <MapPin className="h-3 w-3" /> {target.addresses[0]?.neighborhood}, {target.addresses[0]?.city}
                            </p>
                        </div>
                        <div className="pt-2 border-t text-[10px] text-gray-400 flex justify-between">
                            <span>VINCULADO À:</span>
                            <span className="font-bold text-gray-600">{target.opTitle}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </PageContainer>
    </div>
  );
}
