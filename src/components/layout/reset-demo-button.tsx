"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ResetDemoButton() {
  const handleReset = () => {
    // Since we are using in-memory variables in services, reloading the page 
    // effectively resets the state to the initial MOCK_DATA.
    // In a real app with local storage, we would clear it here.
    
    toast.info("Reiniciando ambiente de demonstração...");
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
        <Button 
            onClick={handleReset} 
            size="icon" 
            variant="secondary" 
            className="h-10 w-10 rounded-full shadow-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-500 hover:text-gov-blue transition-all hover:rotate-180"
            title="Resetar Demo (Recarregar)"
        >
            <RefreshCw className="h-5 w-5" />
        </Button>
    </div>
  );
}