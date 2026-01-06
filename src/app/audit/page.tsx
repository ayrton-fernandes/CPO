"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { database, AuditLog } from "@/services/database";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

export default function AuditPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin_master') {
      router.push("/dashboard");
    } else {
      setLogs(database.get<AuditLog>('cpo_audit_logs'));
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin_master') return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer>
        <h1 className="text-2xl font-bold text-gov-blue mb-6">Trilha de Auditoria</h1>
        <div className="space-y-4">
          {logs.map(log => (
            <Card key={log.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <History className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500">Actor: {log.actorId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
