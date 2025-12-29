import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { OperationDetails } from "@/features/operacoes/operation-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OperationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex">
      <Sidebar />
      <PageContainer className="w-full">
        <OperationDetails id={id} />
      </PageContainer>
    </div>
  );
}
