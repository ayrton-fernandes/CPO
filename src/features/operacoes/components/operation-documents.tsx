"use client";

import { useState, useRef } from "react";
import { Operation, OperationDocument } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, File, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { toast } from "sonner";
import { operationsService } from "@/services/operationsService";
import { Badge } from "@/components/ui/badge";

interface OperationDocumentsProps {
  operation: Operation;
  onUpdate: () => void;
}

export function OperationDocuments({ operation, onUpdate }: OperationDocumentsProps) {
  const { user } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const canEdit = user.role === 'admin_master' || user.permissions?.includes('EDIT_OPERATIONS');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulação de delay de rede
    setTimeout(() => {
        const newDoc: OperationDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: file.type,
            url: "#",
            category: "OUTROS",
            uploadedBy: user.name,
            uploadedAt: new Date().toISOString(),
        };

        const currentDocs = operation.documents || [];
        operationsService.updateOperation(operation.id, {
            documents: [newDoc, ...currentDocs]
        });

        onUpdate();
        toast.success("Documento anexado ao dossiê.");
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1000);
  };

  const deleteDoc = (docId: string) => {
    const filteredDocs = operation.documents.filter(d => d.id !== docId);
    operationsService.updateOperation(operation.id, { documents: filteredDocs });
    onUpdate();
    toast.error("Documento removido.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Repositório de Evidências</CardTitle>
            <CardDescription>Documentos custodiados e provas digitais.</CardDescription>
          </div>
          <div>
            {canEdit && (
                <>
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload de Doc
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        accept=".pdf,.jpg,.png,.doc,.docx"
                    />
                </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {operation.documents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Nenhum documento anexado a este dossiê.</p>
                </div>
            ) : (
                operation.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:border-gov-blue transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center text-gov-blue">
                                <File className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[10px] py-0">{doc.category}</Badge>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        Submetido por {doc.uploadedBy} em {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gov-blue" title="Download"><Download className="h-4 w-4" /></Button>
                            {canEdit && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteDoc(doc.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                            )}
                        </div>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
        <ShieldCheck className="h-5 w-5 text-gov-blue shrink-0" />
        <p className="text-xs text-blue-800">
            <strong>Nota de Auditoria:</strong> Todas as submissões são registradas com carimbo de tempo e ID funcional do agente. A remoção de documentos deixa rastro no log de segurança da Corregedoria.
        </p>
      </div>
    </div>
  );
}
