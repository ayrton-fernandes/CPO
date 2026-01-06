import { User, Operation, Target, OperationReport, OperationDocument } from "@/types";
import { MOCK_USERS, MOCK_OPERATIONS } from "./mockData";

// Keys for localStorage
const STORAGE_KEYS = {
  USERS: 'cpo_users',
  OPERATIONS: 'cpo_operations',
  TARGETS: 'cpo_targets',
  REPORTS: 'cpo_reports',
  DOCUMENTS: 'cpo_documents',
  MESSAGES: 'cpo_messages',
  NOTIFICATIONS: 'cpo_notifications',
  AUDIT_LOGS: 'cpo_audit_logs'
};

// Types for new entities not yet in global types (will add later if needed, but defined here for storage)
export interface Message {
  id: string;
  senderId: string;
  recipientId?: string; // If null, check recipientOperationId
  recipientOperationId?: string;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'CREDENTIAL_CHANGE_REQUEST';
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  metadata?: any;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
  oldData?: any;
  newData?: any;
}

class DatabaseService {
  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.seed();
    }
  }

  private seed() {
    console.log("Seeding database...");
    
    // 1. Users
    this.save(STORAGE_KEYS.USERS, MOCK_USERS);

    // 2. Targets & Operations
    // MOCK_OPERATIONS currently has targets embedded. We need to extract them.
    const targets: Target[] = [];
    const operations: Operation[] = MOCK_OPERATIONS.map(op => {
      // Extract targets and ensure they have linkedOperationIds
      const opTargets = op.targets.map(t => ({
        ...t,
        linkedOperationIds: [op.id],
        operationId: op.id // keep for now
      }));
      targets.push(...opTargets);
      
      // Return op without full target objects (referenced by ID ideally, but current Operation type has Target[])
      // For the "Simulated DB", we can keep the structure as is for now in the Operations array 
      // BUT we should also have a central Targets array.
      // However, to strictly follow "Database" pattern, Operations should just link to Targets. 
      // But refactoring the whole app to use IDs instead of embedded objects might be too big for this step.
      // We will save the embedded structure for Operations to minimize breakage, 
      // but ALSO save a central Targets list.
      return op;
    });

    this.save(STORAGE_KEYS.OPERATIONS, operations);
    this.save(STORAGE_KEYS.TARGETS, targets);
    this.save(STORAGE_KEYS.REPORTS, []);
    this.save(STORAGE_KEYS.DOCUMENTS, []);
    this.save(STORAGE_KEYS.MESSAGES, []);
    this.save(STORAGE_KEYS.NOTIFICATIONS, []);
    this.save(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // Generic Getters/Setters
  private get<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Public API ---

  // Users
  getUsers(): User[] { return this.get<User>(STORAGE_KEYS.USERS); }
  saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    this.save(STORAGE_KEYS.USERS, users);
  }
  deleteUser(id: string) {
    const users = this.getUsers().filter(u => u.id !== id);
    this.save(STORAGE_KEYS.USERS, users);
  }

  // Operations
  getOperations(): Operation[] { return this.get<Operation>(STORAGE_KEYS.OPERATIONS); }
  getOperationById(id: string): Operation | undefined {
    return this.getOperations().find(op => op.id === id);
  }
  saveOperation(op: Operation) {
    const ops = this.getOperations();
    const index = ops.findIndex(o => o.id === op.id);
    if (index >= 0) ops[index] = op;
    else ops.push(op);
    this.save(STORAGE_KEYS.OPERATIONS, ops);
  }

  // Targets
  getTargets(): Target[] { return this.get<Target>(STORAGE_KEYS.TARGETS); }
  saveTarget(target: Target) {
    const targets = this.getTargets();
    const index = targets.findIndex(t => t.id === target.id);
    
    if (index >= 0) {
      targets[index] = target;
    } else {
      targets.push(target);
    }
    this.save(STORAGE_KEYS.TARGETS, targets);

    // Sync with Operations (since we have embedded targets in Operation type)
    this.syncTargetToOperations(target);
  }

  // Helper to update the embedded targets inside operations whenever a target changes
  private syncTargetToOperations(target: Target) {
    const ops = this.getOperations();
    let opsChanged = false;

    // Remove target from operations it is NOT linked to anymore
    ops.forEach(op => {
      const targetIndex = op.targets.findIndex(t => t.id === target.id);
      const shouldBeLinked = target.linkedOperationIds.includes(op.id);

      if (targetIndex >= 0 && !shouldBeLinked) {
        // Remove
        op.targets.splice(targetIndex, 1);
        opsChanged = true;
      } else if (targetIndex >= 0 && shouldBeLinked) {
        // Update
        op.targets[targetIndex] = target;
        opsChanged = true;
      } else if (targetIndex === -1 && shouldBeLinked) {
        // Add
        op.targets.push(target);
        opsChanged = true;
      }
    });

    if (opsChanged) {
      this.save(STORAGE_KEYS.OPERATIONS, ops);
    }
  }

  // Messages
  getMessages(userId: string): Message[] {
    // Return messages where recipient is User OR recipient is an Operation the user is in
    const allMessages = this.get<Message>(STORAGE_KEYS.MESSAGES);
    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return [];

    return allMessages.filter(msg => {
      if (msg.recipientId === userId) return true;
      if (msg.recipientOperationId && user.linkedOperations?.includes(msg.recipientOperationId)) return true;
      return false;
    });
  }
  
  sendMessage(msg: Message) {
    const msgs = this.get<Message>(STORAGE_KEYS.MESSAGES);
    msgs.push(msg);
    this.save(STORAGE_KEYS.MESSAGES, msgs);
  }

  // Notifications
  getNotifications(userId: string, role: string): Notification[] {
    const all = this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    // Master sees everything? Or distinct logs? 
    // Prompt says: Master receives ALL logs/notifications.
    if (role === 'admin_master') {
        return all;
    }
    return all.filter(n => n.userId === userId);
  }

  addNotification(notif: Notification) {
    const all = this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    all.unshift(notif);
    this.save(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  markNotificationAsRead(id: string) {
    const all = this.get<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.save(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  addAuditLog(log: Omit<AuditLog, "id">) {
    const logs = this.get<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
    const newLog = { ...log, id: `log-${Date.now()}` };
    logs.unshift(newLog);
    this.save(STORAGE_KEYS.AUDIT_LOGS, logs);
    
    // Also create a notification for MASTER users about this log
    this.addNotification({
        id: `notif-log-${Date.now()}`,
        userId: "u-master", // Direct to master
        type: "INFO",
        title: "Log de Sistema",
        description: `${log.action}: ${log.details}`,
        createdAt: log.timestamp,
        isRead: false,
        metadata: { auditLogId: newLog.id }
    });
  }

  getAuditLogById(id: string): AuditLog | undefined {
    return this.get<AuditLog>(STORAGE_KEYS.AUDIT_LOGS).find(l => l.id === id);
  }

  // Reset
  reset() {
    localStorage.clear();
    this.seed();
  }
}

export const database = new DatabaseService();
