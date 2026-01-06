import { User } from "@/types";
import { database } from "./database";
import { MOCK_USERS } from "./mockData"; // Still needed for reset if we want to fallback, but DB has its own seed

export const usersService = {
  getAll: (): User[] => {
    return database.getUsers();
  },

  getById: (id: string): User | undefined => {
    return database.getUsers().find((u) => u.id === id);
  },

  create: (userData: Omit<User, "id">): User => {
    const newUser: User = {
      password: "123456", // Default password
      ...userData,
      id: `u-${Date.now()}`,
    };
    database.saveUser(newUser);
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User => {
    const users = database.getUsers();
    const existing = users.find(u => u.id === id);
    if (!existing) throw new Error("User not found");
    
    const updatedUser = { ...existing, ...updates };
    database.saveUser(updatedUser);

    database.addAuditLog({
        actorId: "SISTEMA",
        action: "ATUALIZAÇÃO DE USUÁRIO",
        targetEntity: "USER",
        targetId: id,
        details: `Atualizou dados do usuário ${existing.name}`,
        timestamp: new Date().toISOString(),
        oldData: existing,
        newData: updatedUser
    });

    return updatedUser;
  },

  delete: (id: string): void => {
    database.deleteUser(id);
  },

  resetData: () => {
    // Database service handles full reset
    database.reset();
  }
};
