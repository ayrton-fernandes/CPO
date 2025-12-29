"use client";

import { useState } from "react";
import { Operation, OperationReport } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Send, ShieldAlert, User, Clock, Search, BookOpen } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { toast } from "sonner";
import { operationsService } from "@/services/operationsService";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface OperationReportsProps {
  operation: Operation;
  onUpdate: () => void;
}

export function OperationReports({ operation, onUpdate }: OperationReportsProps) {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!user) return null;

  const handleSave = () => {
    if (!title || !content) {
        toast.error("Preencha todos os campos do relatório.");
        return;
    }

    const newReport: OperationReport = {
        id: `rep-${Date.now()}`,
        title,
        content,
        type: user.role === 'investigator' ? 'CAMPO' : 'INTELIGENCIA',
        author: user.name,
        createdAt: new Date().toISOString(),
        version: 1,
    };

    const currentReports = operation.reports || [];
    operationsService.updateOperation(operation.id, {
        reports: [newReport, ...currentReports]
    });

    onUpdate();
    toast.success("Relatório registrado na linha do tempo.");
    setIsCreating(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Linha do Tempo de Relatórios</h3>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancelar" : <><Plus className="h-4 w-4 mr-2" /> Novo Registro</>}
        </Button>
      </div>

      {isCreating && (
          <Card className="border-gov-blue shadow-md bg-white">
            <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-sm">Redigir Novo Reporte</CardTitle>
                <CardDescription>O tipo de relatório será definido automaticamente como {user.role === 'investigator' ? 'CAMPO' : 'INTELIGÊNCIA'}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <Input 
                    placeholder="Título do Relatório (ex: Diligência no Setor Norte)" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea 
                    placeholder="Descreva detalhadamente os fatos e observações..." 
                    className="min-h-[150px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Descartar</Button>
                <Button size="sm" className="bg-gov-blue" onClick={handleSave}>
                    <Send className="h-4 w-4 mr-2" /> Registrar Reporte
                </Button>
            </CardFooter>
          </Card>
      )}

      <div className="space-y-4">
        {operation.reports.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Sem registros cronológicos até o momento.</p>
            </div>
        ) : (
            operation.reports.map((report) => (
                <div key={report.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-100">
                    <div className={cn(
                        "absolute left-[-4px] top-4 h-2 w-2 rounded-full ring-4 ring-white",
                        report.type === 'INTELIGENCIA' ? "bg-purple-600" : "bg-gov-blue"
                    )} />
                    <Card className={cn(
                        "border-l-4",
                        report.type === 'INTELIGENCIA' ? "border-l-purple-600" : "border-l-gov-blue"
                    )}>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="secondary" className={cn(
                                        "text-[10px] uppercase font-black px-1.5 py-0 mb-1",
                                        report.type === 'INTELIGENCIA' ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-gov-blue border-blue-100"
                                    )}>
                                        {report.type === 'INTELIGENCIA' ? 'Análise de Inteligência' : 'Relato de Campo'}
                                    </Badge>
                                    <CardTitle className="text-base font-bold text-gray-900">{report.title}</CardTitle>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.content}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-gray-50 mt-2">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase mt-2">
                                <User className="h-3 w-3" /> {report.author}
                            </div>
                            <Button variant="ghost" size="sm" className="text-[10px] h-7">Ver Anexos (0)</Button>
                        </CardFooter>
                    </Card>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
