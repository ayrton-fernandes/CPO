"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { database, AuditLog } from "@/services/database";
import { Card, CardContent } from "@/components/ui/card";
import { History, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatAuditLog } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function AuditPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin_master') {
      router.push("/dashboard");
    } else {
      setLogs(database.get<AuditLog>('cpo_audit_logs'));
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin_master') return null;

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.actorId.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gov-blue">Trilha de Auditoria</h1>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Filtrar logs..." 
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="space-y-4">
          {filteredLogs.map(log => (
            <Card key={log.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedLog(log)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                        <History className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="sm:hidden">
                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gov-blue">{log.action}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{log.details}</p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                    <p className="hidden sm:block text-[10px] text-gray-400 font-bold uppercase">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    <p className="text-xs font-medium text-gray-500">Agente: {log.actorId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
            <DialogContent className="max-w-xl bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gov-blue">
                        <History className="h-5 w-5" />
                        Detalhes da Auditoria
                    </DialogTitle>
                </DialogHeader>
                {selectedLog && (
                    <div className="space-y-4 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border">
                            <div>
                                <p className="font-bold text-gray-400 uppercase mb-1">Ação</p>
                                <p className="font-bold text-gov-blue">{selectedLog.action}</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-400 uppercase mb-1">Data</p>
                                <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-400 uppercase mb-1">Ator</p>
                                <p className="font-medium">{selectedLog.actorId}</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-400 uppercase mb-1">Entidade</p>
                                <p className="font-medium">{selectedLog.targetEntity} ({selectedLog.targetId})</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Resumo</p>
                            <p className="border-l-4 border-gov-blue pl-3 italic text-gray-600 bg-blue-50/30 py-2">
                                {selectedLog.details}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Alterações Detectadas</p>
                            <div className="border rounded-md p-3 bg-gray-50/50 space-y-2 text-xs">
                                {formatAuditLog(selectedLog).map((change, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <p className="text-gray-700">{change}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </PageContainer>
    </div>
  );
}
