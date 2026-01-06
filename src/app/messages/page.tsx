"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { database, Message } from "@/services/database";
import { usersService } from "@/services/usersService";
import { operationsService } from "@/services/operationsService";
import { Mail, Send, Plus, Search, User as UserIcon, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientType: "user" as "user" | "operation",
    recipientId: "",
    subject: "",
    content: ""
  });

  const loadMessages = () => {
    if (user) {
      setMessages(database.getMessages(user.id).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      loadMessages();
    }
  }, [isAuthenticated, user, router]);

  const handleSendMessage = () => {
    if (!user) return;
    if (!composeData.recipientId || !composeData.subject || !composeData.content) {
        toast.error("Preencha todos os campos.");
        return;
    }

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        recipientId: composeData.recipientType === 'user' ? composeData.recipientId : undefined,
        recipientOperationId: composeData.recipientType === 'operation' ? composeData.recipientId : undefined,
        subject: composeData.subject,
        content: composeData.content,
        createdAt: new Date().toISOString(),
        isRead: false
    };

    database.sendMessage(newMessage);
    toast.success("Mensagem enviada com sucesso!");
    setIsComposeOpen(false);
    setComposeData({ recipientType: "user", recipientId: "", subject: "", content: "" });
    loadMessages();
  };

  const getSenderName = (id: string) => {
    return usersService.getById(id)?.name || "Usuário Desconhecido";
  };

  if (!isAuthenticated || !user) return null;

  const availableUsers = usersService.getAll().filter(u => u.id !== user.id);
  const availableOperations = operationsService.getAll().filter(op => 
    user.role === 'admin_master' || user.linkedOperations?.includes(op.id)
  );

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gov-blue">Mensageria Interna</h1>
                <p className="text-gray-500">Comunicações seguras entre agentes e departamentos.</p>
            </div>
            <Button onClick={() => setIsComposeOpen(true)} className="bg-gov-blue">
                <Plus className="mr-2 h-4 w-4" /> Compor Mensagem
            </Button>
        </div>

        <div className="grid gap-4">
            {messages.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Mail className="h-12 w-12 mb-4 opacity-20" />
                        <p>Sua caixa de entrada está vazia.</p>
                    </CardContent>
                </Card>
            ) : (
                messages.map((msg) => (
                    <Card key={msg.id} className={`hover:shadow-md transition-shadow cursor-pointer ${!msg.isRead ? 'border-l-4 border-l-gov-blue' : ''}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-gov-blue">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-sm text-gray-900 truncate">{msg.subject}</h3>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {format(new Date(msg.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-semibold">{getSenderName(msg.senderId)}</span>
                                    {msg.recipientOperationId && (
                                        <Badge variant="outline" className="text-[9px] h-4 bg-orange-50 text-orange-700 border-orange-200">
                                            Operação: {operationsService.getById(msg.recipientOperationId)?.title}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-1">{msg.content}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>

        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle>Nova Mensagem Interna</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Destinatário</label>
                            <select 
                                className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none"
                                value={composeData.recipientType}
                                onChange={(e) => setComposeData({...composeData, recipientType: e.target.value as any, recipientId: ""})}
                            >
                                <option value="user">Usuário Específico</option>
                                <option value="operation">Toda a Equipe da Operação</option>
                            </select>
                        </div>
                        <div className="flex-[2] space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Destinatário</label>
                            <select 
                                className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none"
                                value={composeData.recipientId}
                                onChange={(e) => setComposeData({...composeData, recipientId: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                {composeData.recipientType === 'user' ? (
                                    availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                                ) : (
                                    availableOperations.map(op => <option key={op.id} value={op.id}>{op.title}</option>)
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Assunto</label>
                        <Input 
                            placeholder="Assunto da mensagem..." 
                            value={composeData.subject}
                            onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Conteúdo</label>
                        <Textarea 
                            rows={6} 
                            placeholder="Escreva sua mensagem aqui..." 
                            value={composeData.content}
                            onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsComposeOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSendMessage} className="bg-gov-blue">
                        <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </PageContainer>
    </div>
  );
}
