import { Operation, OperationStatus, Target, OperationReport, OperationDocument } from "@/types";
import { MOCK_OPERATIONS, calculateMaturity } from "./mockData";

let currentOperations = [...MOCK_OPERATIONS];

export const operationsService = {
  getById: (id: string): Operation | undefined => {
    return currentOperations.find(op => op.id === id);
  },

  getAll: () => currentOperations,

  updateStatus: (id: string, newStatus: OperationStatus): Operation | undefined => {
    const opIndex = currentOperations.findIndex(op => op.id === id);
    if (opIndex === -1) return undefined;

    const updatedOp = {
      ...currentOperations[opIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    currentOperations[opIndex] = updatedOp;
    return updatedOp;
  },

  updateOperation: (id: string, data: Partial<Operation>): Operation | undefined => {
    const opIndex = currentOperations.findIndex(op => op.id === id);
    if (opIndex === -1) return undefined;

    const updatedOp = {
      ...currentOperations[opIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    currentOperations[opIndex] = updatedOp;
    return updatedOp;
  },

  updateTargets: (id: string, targets: Target[]): Operation | undefined => {
    const opIndex = currentOperations.findIndex(op => op.id === id);
    if (opIndex === -1) return undefined;

    const updatedOp = {
      ...currentOperations[opIndex],
      targets: targets,
      maturity: calculateMaturity(targets),
      updatedAt: new Date().toISOString(),
    };

    currentOperations[opIndex] = updatedOp;
    return updatedOp;
  },

  checkTargetConflict: (targetCpf: string, targetNickname: string, currentOpId: string) => {
    for (const op of currentOperations) {
      if (op.id === currentOpId) continue;
      const conflict = op.targets.find(t => 
        (t.hasCpf && t.cpf === targetCpf) || 
        (t.nickname.toLowerCase() === targetNickname.toLowerCase())
      );
      if (conflict) return op;
    }
    return null;
  },

  create: (data: any): Operation => {
    const newId = `op-${Date.now()}`;
    const newOp: Operation = {
      id: newId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      location: data.location,
      department: data.department,
      status: 'EM_ANALISE',
      maturity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
      assignedAgents: [],
      targets: (data.targets || []).map((name: string) => ({
        id: `t-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        nickname: "",
        cpf: "",
        hasCpf: false,
        hasPhoto: false,
        riskLevel: 'MEDIUM',
        operationId: newId,
        addresses: [],
      })),
      documents: [],
      reports: [],
      validationHistory: [],
    };
    
    newOp.maturity = calculateMaturity(newOp.targets);
    currentOperations.unshift(newOp);
    return newOp;
  },

  resetData: () => {
    currentOperations = [...MOCK_OPERATIONS];
    return currentOperations;
  }
};
