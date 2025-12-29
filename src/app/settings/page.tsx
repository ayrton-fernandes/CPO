"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, Moon, Shield, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gov-blue">Configurações do Sistema</h1>
            <p className="text-gray-500">Gerencie suas preferências e ajustes da conta.</p>
        </div>

        <Tabs defaultValue="account" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
                <TabsTrigger value="account">Minha Conta</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                        <CardDescription>Informações do seu perfil de usuário.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome Completo</label>
                                <Input defaultValue={user.name} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-mail Institucional</label>
                                <Input defaultValue={user.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Função / Cargo</label>
                                <Input defaultValue={user.role.toUpperCase()} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ID Funcional</label>
                                <Input defaultValue={user.id} disabled />
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                Solicitar Alteração de Dados
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notifications">
                 <Card>
                    <CardHeader>
                        <CardTitle>Preferências de Alerta</CardTitle>
                        <CardDescription>Escolha como deseja receber atualizações operacionais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-sm">Notificações no Sistema</p>
                                    <p className="text-xs text-gray-500">Alertas pop-up dentro da plataforma.</p>
                                </div>
                            </div>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-sm">Alertas Críticos</p>
                                    <p className="text-xs text-gray-500">Notificar imediatamente mudanças de prioridade alta.</p>
                                </div>
                            </div>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <Button onClick={handleSave} className="mt-4">
                            <Save className="mr-2 h-4 w-4" /> Salvar Preferências
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="system">
                <Card>
                    <CardHeader>
                        <CardTitle>Aparência e Acessibilidade</CardTitle>
                        <CardDescription>Personalize a interface do CPO Digital.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <Moon className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-sm">Modo Escuro</p>
                                    <p className="text-xs text-gray-500">Tema de alto contraste para ambientes noturnos.</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" disabled>Em breve</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  );
}
