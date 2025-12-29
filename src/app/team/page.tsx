"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { MOCK_USERS } from "@/services/mockData"; // Need to export MOCK_USERS from mockData first
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Need to create Avatar component or use simple div
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";

export default function TeamPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin': return 'bg-purple-100 text-purple-700';
        case 'intelligence': return 'bg-blue-100 text-blue-700';
        case 'investigator': return 'bg-green-100 text-green-700';
        case 'planning': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gov-blue">Equipe Operacional</h1>
            <p className="text-gray-500">Membros ativos do CPO Digital e suas atribuições.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_USERS.map((member) => (
                <Card key={member.id} className="text-center hover:shadow-lg transition-shadow border-t-4 border-t-transparent hover:border-t-gov-blue">
                    <CardContent className="pt-8 pb-6">
                        <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500 mb-4 border-2 border-white shadow-sm">
                            {member.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 capitalize ${getRoleBadge(member.role)}`}>
                            {member.role}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2 text-sm text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                                <Mail className="h-4 w-4" />
                                {member.email}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="h-4 w-4" />
                                ID: {member.id}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </PageContainer>
    </div>
  );
}
