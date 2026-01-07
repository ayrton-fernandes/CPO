import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AuditLog } from "@/services/database";
import { isObject } from "lodash";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DICTIONARY: Record<string, string> = {
    // User fields
    name: "Nome",
    email: "Email",
    phone: "Telefone",
    role: "Função",
    roles: "Funções",
    permissions: "Permissões",
    accessMenus: "Acesso aos Menus",
    linkedOperations: "Operações Vinculadas",
    expirationDate: "Data de Expiração",
    // Target fields
    nickname: "Vulgo",
    cpf: "CPF",
    riskLevel: "Nível de Risco",
    hasPhoto: "Identificação Fotográfica",
    hasCpf: "Confirmação de CPF",
    // Address fields
    street: "Rua",
    number: "Número",
    neighborhood: "Bairro",
    city: "Cidade",
    isConfirmed: "Endereço Confirmado",
    // Operation fields
    title: "Título",
    description: "Descrição",
    status: "Status",
    priority: "Prioridade",
    location: "Localização",
    maturity: "Maturidade",
    linkedOperationIds: "Operações Vinculadas",
};

const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
        return value ? "SIM" : "NÃO";
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "Vazio";
    }
    if (value === null || value === undefined || value === "") {
        return "NULO";
    }
    return String(value);
};

export function formatAuditLog(log: AuditLog): string[] {
    const changes: string[] = [];
    
    // Fallback if no structured data
    if (!log.oldData && !log.newData) {
        return [log.details];
    }

    const oldData = (log.oldData || {}) as Record<string, any>;
    const newData = (log.newData || {}) as Record<string, any>;

    // Special case for deletion
    if (log.action === "TARGET_DELETED" || (log.oldData && !log.newData)) {
        return [`Exclusão de registro: ${log.details}`];
    }

    const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

    allKeys.forEach(key => {
        if (key === 'id' || key === 'updatedAt' || key === 'createdAt' || key === 'password' || key === 'avatar') return;

        const oldValue = oldData[key];
        const newValue = newData[key];
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            const keyName = DICTIONARY[key] || key;
            changes.push(`Alterou ${keyName}: de "${formatValue(oldValue)}" para "${formatValue(newValue)}"`);
        }
    });

    if (changes.length === 0) {
        return [log.details || "Ação realizada sem alteração de campos específicos."];
    }

    return changes;
}
