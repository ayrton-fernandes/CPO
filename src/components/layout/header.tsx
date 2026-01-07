"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, X, Check, Clock, ShieldAlert, FileText, LogOut, History, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { operationsService } from "@/services/operationsService";
import { database, AuditLog } from "@/services/database";
import { Operation } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatAuditLog } from "@/lib/utils";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Operation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } = useNotificationStore();
  
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
        refresh(user.id, user.role);
    }
  }, [user, refresh]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const allOps = operationsService.getAll();
      const filtered = allOps.filter(op => 
        op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.targets.some(t => t.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (user) refresh(user.id, user.role);

    if (notif.metadata?.auditLogId && user?.role === 'admin_master') {
        const log = database.getAuditLogById(notif.metadata.auditLogId);
        if (log) {
            setSelectedAuditLog(log);
            setIsAuditModalOpen(true);
        }
    }
  };

  const handleMarkAllRead = () => {
    if (user) {
        markAllAsRead(user.id, user.role);
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 z-30 relative shadow-sm shrink-0 sticky top-0">
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por operação, ID ou alvo..." 
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowResults(true)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showResults && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-md border shadow-lg py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">Nenhum resultado encontrado.</div>
            ) : (
              results.map(op => (
                <Link 
                  key={op.id} 
                  href={`/operations/${op.id}`}
                  onClick={() => setShowResults(false)}
                  className="flex flex-col px-4 py-2 hover:bg-blue-50 transition-colors border-l-2 border-transparent hover:border-gov-blue"
                >
                  <span className="text-sm font-bold text-gray-900">{op.title}</span>
                  <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-gray-500 uppercase">{op.department}</span>
                      <span className="text-[10px] bg-blue-100 px-1.5 rounded text-gov-blue font-bold uppercase">{op.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gov-blue">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-bold ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gov-blue uppercase tracking-tight">Notificações</h3>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-gray-400 hover:text-gov-blue transition-colors">
                            LIMPAR TUDO
                        </button>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-xs text-gray-400 italic">Sem novos alertas.</div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={cn(
                                    "px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors relative cursor-pointer",
                                    !notif.isRead && "bg-blue-50/20"
                                )}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="flex items-start gap-3">
                                    {notif.type === 'WARNING' || notif.type === 'CREDENTIAL_CHANGE_REQUEST' ? (
                                        <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                    ) : notif.metadata?.auditLogId ? (
                                        <History className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-gov-blue mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center gap-2">
                                            <h4 className={cn("text-[11px] font-bold uppercase", (notif.type === 'WARNING' || notif.type === 'CREDENTIAL_CHANGE_REQUEST') ? "text-red-700" : "text-gray-700")}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[9px] text-gray-400 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight line-clamp-2">
                                            {notif.description}
                                        </p>
                                    </div>
                                </div>
                                {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gov-blue" />}
                            </div>
                        ))
                    )}
                </div>
                <div className="px-4 py-2 border-t text-center bg-gray-50/50">
                    <button className="text-[10px] font-bold text-gov-blue hover:underline uppercase">
                        Ver histórico completo
                    </button>
                </div>
            </PopoverContent>
        </Popover>

        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sair do Sistema"
        >
            <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="max-w-xl bg-white">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gov-blue">
                    <History className="h-5 w-5" />
                    Detalhes do Log de Auditoria
                </DialogTitle>
            </DialogHeader>
            {selectedAuditLog && (
                <div className="space-y-4 py-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-lg border">
                        <div>
                            <p className="font-bold text-gray-400 uppercase mb-1">Ação</p>
                            <p className="font-bold text-gov-blue">{selectedAuditLog.action}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-400 uppercase mb-1">Data</p>
                            <p className="font-medium">{new Date(selectedAuditLog.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-400 uppercase mb-1">Responsável</p>
                            <p className="font-medium">{selectedAuditLog.actorId}</p>
                        </div>
                         <div>
                            <p className="font-bold text-gray-400 uppercase mb-1">Entidade Alvo</p>
                            <p className="font-medium">{selectedAuditLog.targetEntity} ({selectedAuditLog.targetId})</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase">Resumo da Ação</p>
                        <p className="border-l-4 border-gov-blue pl-3 italic text-gray-600 bg-blue-50/30 py-2">
                            {selectedAuditLog.details}
                        </p>
                    </div>

                    <div className="space-y-2">
                         <p className="text-xs font-bold text-gray-400 uppercase">Alterações Detectadas</p>
                         <div className="border rounded-md p-3 bg-gray-50/50 space-y-2 text-xs">
                            {formatAuditLog(selectedAuditLog).map((change, index) => (
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
    </header>
  );
}
