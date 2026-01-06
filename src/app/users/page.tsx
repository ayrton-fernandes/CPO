"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { UserList } from "@/features/users/user-list";
import { toast } from "sonner";

export default function UsersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && (user.role === 'admin_master' || user.role === 'intelligence_manager')) {
      setIsAuthorized(true);
    } else {
      toast.error("Acesso não autorizado.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !isAuthorized) return null;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <UserList />
      </PageContainer>
    </div>
  );
}
