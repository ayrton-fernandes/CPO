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
    linkedOperationIds: "Operações Vinculadas",
};

const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
        return value ? "Sim" : "Não";
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? `[${value.join(", ")}]` : "Vazio";
    }
    if (value === null || value === undefined || value === "") {
        return "Não preenchido";
    }
    return String(value);
};

export function formatAuditLog(log: AuditLog): string[] {
    const changes: string[] = [];
    if (!log.oldData || !log.newData || !isObject(log.oldData) || !isObject(log.newData)) {
        return [log.details];
    }

    const oldData = log.oldData as Record<string, any>;
    const newData = log.newData as Record<string, any>;

    for (const key in newData) {
        if (key === 'id' || key === 'updatedAt' || key === 'createdAt') continue;

        const oldValue = oldData[key];
        const newValue = newData[key];
        
        const keyName = DICTIONARY[key] || key;

        // Simple value comparison
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            if (isObject(oldValue) || isObject(newValue)) {
                 // For complex objects/arrays, just note that it was changed.
                 // A more complex diff could be implemented here.
                 changes.push(`Alterou o campo "${keyName}".`);
            } else {
                changes.push(`Alterou "${keyName}" de "${formatValue(oldValue)}" para "${formatValue(newValue)}".`);
            }
        }
    }

    if (changes.length === 0) {
        return ["Nenhuma alteração de dados registrada."];
    }

    return changes;
}
