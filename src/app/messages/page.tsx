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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const [composeData, setComposeData] = useState({
    recipientIds: [] as string[],
    operationIds: [] as string[],
    subject: "",
    content: ""
  });

  const loadMessages = () => {
    if (user) {
      setMessages(database.getMessages(user.id));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      loadMessages();
    }
  }, [isAuthenticated, user, router]);

  const handleOpenMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
        database.markMessageAsRead(msg.id);
        loadMessages();
    }
  };

  const handleSendMessage = () => {
    if (!user) return;
    if ((composeData.recipientIds.length === 0 && composeData.operationIds.length === 0) || !composeData.subject || !composeData.content) {
        toast.error("Selecione pelo menos um destinatário e preencha o assunto/conteúdo.");
        return;
    }

    database.sendMessage({
        senderId: user.id,
        recipientIds: composeData.recipientIds,
        operationIds: composeData.operationIds,
        subject: composeData.subject,
        content: composeData.content
    });

    toast.success("Mensagem enviada com sucesso!");
    setIsComposeOpen(false);
    setComposeData({ recipientIds: [], operationIds: [], subject: "", content: "" });
    loadMessages();
  };

  const getSenderName = (id: string) => {
    return usersService.getById(id)?.name || "Usuário Desconhecido";
  };

  const toggleRecipientId = (id: string) => {
    setComposeData(prev => ({
        ...prev,
        recipientIds: prev.recipientIds.includes(id) 
            ? prev.recipientIds.filter(i => i !== id) 
            : [...prev.recipientIds, id]
    }));
  };

  const toggleOperationId = (id: string) => {
    setComposeData(prev => ({
        ...prev,
        operationIds: prev.operationIds.includes(id) 
            ? prev.operationIds.filter(i => i !== id) 
            : [...prev.operationIds, id]
    }));
  };

  if (!isAuthenticated || !user) return null;

  const availableUsers = usersService.getAll().filter(u => u.id !== user.id);
  const availableOperations = operationsService.getAll(user.id, user.role);

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

        <div className="grid gap-3">
            {messages.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Mail className="h-12 w-12 mb-4 opacity-20" />
                        <p>Sua caixa de entrada está vazia.</p>
                    </CardContent>
                </Card>
            ) : (
                messages.map((msg) => (
                    <Card 
                        key={msg.id} 
                        onClick={() => handleOpenMessage(msg)}
                        className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${!msg.isRead ? 'border-l-blue-600 bg-blue-50/30' : 'border-l-gray-200'}`}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${!msg.isRead ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {!msg.isRead && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                        <h3 className={`text-sm truncate ${!msg.isRead ? 'font-bold text-blue-900' : 'text-gray-900'}`}>{msg.subject}</h3>
                                    </div>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {format(new Date(msg.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-semibold">{getSenderName(msg.senderId)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{msg.content}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>

        {/* Modal de Leitura */}
        <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
            <DialogContent className="max-w-2xl bg-white">
                {selectedMessage && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gov-blue">{selectedMessage.subject}</DialogTitle>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2 border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-gov-blue font-bold">
                                        {getSenderName(selectedMessage.senderId).charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{getSenderName(selectedMessage.senderId)}</span>
                                        <span>Remetente</span>
                                    </div>
                                </div>
                                <span>{format(new Date(selectedMessage.createdAt), "PPPP 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                        </DialogHeader>
                        <div className="py-6 text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.content}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSelectedMessage(null)} className="bg-gov-blue">Fechar</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>

        {/* Modal de Composição */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Mensagem Interna</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Destinatários (Usuários)</label>
                            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 space-y-1">
                                {availableUsers.map(u => (
                                    <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer text-xs">
                                        <input 
                                            type="checkbox" 
                                            checked={composeData.recipientIds.includes(u.id)}
                                            onChange={() => toggleRecipientId(u.id)}
                                            className="rounded text-gov-blue"
                                        />
                                        <span>{u.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Grupos (Operações)</label>
                            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 space-y-1">
                                {availableOperations.map(op => (
                                    <label key={op.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer text-xs">
                                        <input 
                                            type="checkbox" 
                                            checked={composeData.operationIds.includes(op.id)}
                                            onChange={() => toggleOperationId(op.id)}
                                            className="rounded text-gov-blue"
                                        />
                                        <span className="truncate">{op.title}</span>
                                    </label>
                                ))}
                            </div>
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
