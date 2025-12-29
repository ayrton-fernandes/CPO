import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { Header } from "./header";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div className={cn("pl-0 lg:pl-64 min-h-screen bg-[#f8fafc] flex flex-col transition-all duration-300 w-full", className)} {...props}>
      <Header />
      <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden pb-24 lg:pb-8">
        <div className="hidden lg:block">
            <Breadcrumbs />
        </div>
        {children}
      </main>
    </div>
  );
}