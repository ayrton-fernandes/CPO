import { Operation, OperationStatus, Target } from "@/types";
import { database } from "./database";
import { calculateMaturity } from "./mockData";

export const operationsService = {
  getById: (id: string): Operation | undefined => {
    return database.getOperationById(id);
  },

  getAll: () => database.getOperations(),

  getAllTargets: (): Target[] => {
    return database.getTargets();
  },

  // Save target (Create or Update)
  saveTarget: (target: Target): void => {
    const oldTarget = database.getTargets().find(t => t.id === target.id);
    
    // If target has operationId (legacy/single context) but not linkedOperationIds, fix it
    if (target.operationId && (!target.linkedOperationIds || target.linkedOperationIds.length === 0)) {
        target.linkedOperationIds = [target.operationId];
    }

    database.saveTarget(target);

    // Audit Log
    database.addAuditLog({
        actorId: "SISTEMA", // Idealmente pegar do store de auth, mas service não tem acesso direto fácil sem passar como param
        action: oldTarget ? "ATUALIZAÇÃO DE ALVO" : "CRIAÇÃO DE ALVO",
        targetEntity: "TARGET",
        targetId: target.id,
        details: `${oldTarget ? "Editou" : "Criou"} o alvo ${target.name} (${target.nickname})`,
        timestamp: new Date().toISOString(),
        oldData: oldTarget,
        newData: target
    });
  },

  updateStatus: (id: string, newStatus: OperationStatus): Operation | undefined => {
    const op = database.getOperationById(id);
    if (!op) return undefined;

    const oldStatus = op.status;
    const updatedOp = {
      ...op,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    database.saveOperation(updatedOp);

    database.addAuditLog({
        actorId: "SISTEMA",
        action: "ALTERAÇÃO DE STATUS",
        targetEntity: "OPERATION",
        targetId: id,
        details: `Alterou status da operação "${op.title}" de ${oldStatus} para ${newStatus}`,
        timestamp: new Date().toISOString(),
        oldData: { status: oldStatus },
        newData: { status: newStatus }
    });

    return updatedOp;
  },

  updateOperation: (id: string, data: Partial<Operation>): Operation | undefined => {
    const op = database.getOperationById(id);
    if (!op) return undefined;

    const updatedOp = {
      ...op,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    database.saveOperation(updatedOp);
    return updatedOp;
  },

  updateTargets: (id: string, targets: Target[]): Operation | undefined => {
    // This method is tricky with the new DB structure because targets are central.
    // If we update the operation's target list directly, we might miss updating the central target store.
    // Best approach: Iterate and save each target via database.
    
    const op = database.getOperationById(id);
    if (!op) return undefined;

    // Save each target to DB (which triggers sync)
    targets.forEach(t => {
        if (!t.linkedOperationIds.includes(id)) {
            t.linkedOperationIds.push(id);
        }
        database.saveTarget(t);
    });

    // Recalculate maturity
    const updatedOp = {
        ...op,
        maturity: calculateMaturity(targets),
        updatedAt: new Date().toISOString()
    };
    database.saveOperation(updatedOp);

    return updatedOp;
  },

  checkTargetConflict: (targetCpf: string, targetNickname: string, currentOpId: string) => {
    const operations = database.getOperations();
    for (const op of operations) {
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
    const newTargets = (data.targets || []).map((name: string) => ({
        id: `t-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        nickname: "",
        cpf: "",
        hasCpf: false,
        hasPhoto: false,
        riskLevel: 'MEDIUM',
        operationId: newId,
        linkedOperationIds: [newId], // Critical for new DB
        addresses: [],
    }));

    const newOp: Operation = {
      id: newId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      location: data.location,
      department: data.department,
      status: 'EM_ANALISE',
      maturity: calculateMaturity(newTargets),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
      assignedAgents: data.assignedAgents || [],
      targets: newTargets,
      documents: [],
      reports: [],
      validationHistory: [],
    };
    
    // Save targets first
    newTargets.forEach((t: Target) => database.saveTarget(t));
    
    // Save Op
    database.saveOperation(newOp);
    return newOp;
  },

  resetData: () => {
    database.reset();
    return database.getOperations();
  }
};
