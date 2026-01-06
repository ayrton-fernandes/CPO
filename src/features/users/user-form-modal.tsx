"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, UserRole, UserPermission } from "@/types";
import { operationsService } from "@/services/operationsService";
import { usersService } from "@/services/usersService";
import { toast } from "sonner";

interface UserFormModalProps {
  userToEdit?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ROLES: { label: string; value: UserRole }[] = [
  { label: "Admin Master", value: "admin_master" },
  { label: "Gerente de Inteligência", value: "intelligence_manager" },
  { label: "Analista", value: "analyst" },
  { label: "Investigador", value: "investigator" },
  { label: "Planejamento", value: "planning" },
  { label: "Gestão", value: "management" },
];

const PERMISSIONS: { label: string; value: UserPermission }[] = [
  { label: "Visualizar Dashboard", value: "VIEW_DASHBOARD" },
  { label: "Editar Operações", value: "EDIT_OPERATION" },
  { label: "Aprovar Workflows", value: "APPROVE_WORKFLOW" },
  { label: "Gerenciar Usuários", value: "MANAGE_USERS" },
  { label: "Visualizar Dados Sensíveis", value: "VIEW_SENSITIVE_DATA" },
  { label: "Gerenciar Próprias Credenciais", value: "SELF_MANAGE_CREDENTIALS" },
  { label: "Editar Alvos (Banco Global)", value: "EDIT_TARGETS" },
];

const MENUS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Operações", path: "/operations" },
  { label: "Banco de Alvos", path: "/targets" },
  { label: "Validações", path: "/validations" },
  { label: "Relatórios", path: "/reports" },
  { label: "Indicadores", path: "/indicators" },
  { label: "Gestão de Usuários", path: "/users" },
];

export function UserFormModal({ userToEdit, isOpen, onClose, onSave }: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "investigator",
    roles: ["investigator"],
    permissions: [],
    linkedOperations: [],
    accessMenus: [],
  });

  const [availableOperations, setAvailableOperations] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    // Load operations for the select list
    const ops = operationsService.getAll().map(op => ({ id: op.id, title: op.title }));
    setAvailableOperations(ops);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
            ...userToEdit,
            roles: userToEdit.roles || [userToEdit.role],
            permissions: userToEdit.permissions || [],
            accessMenus: userToEdit.accessMenus || [],
            linkedOperations: userToEdit.linkedOperations || []
        });
      } else {
        // Reset for new user
        setFormData({
            name: "",
            email: "",
            role: "investigator",
            roles: ["investigator"],
            permissions: ["VIEW_DASHBOARD"],
            linkedOperations: [],
            accessMenus: ["/dashboard"],
        });
      }
    }
  }, [isOpen, userToEdit]);

  const handleSave = () => {
    if (!formData.name || !formData.email) {
        toast.error("Nome e Email são obrigatórios.");
        return;
    }

    try {
        const dataToSave = {
            ...formData,
            // Ensure consistency between singular role and roles array
            role: formData.roles && formData.roles.length > 0 ? formData.roles[0] : (formData.role || "investigator"),
        } as Omit<User, "id">;

        if (userToEdit) {
            usersService.update(userToEdit.id, dataToSave);
            toast.success("Usuário atualizado com sucesso!");
        } else {
            usersService.create(dataToSave);
            toast.success("Usuário criado com sucesso!");
        }
        onSave();
        onClose();
    } catch (error) {
        toast.error("Erro ao salvar usuário.");
    }
  };

  const togglePermission = (perm: UserPermission) => {
    const current = formData.permissions || [];
    const newPerms = current.includes(perm) 
        ? current.filter(p => p !== perm) 
        : [...current, perm];
    setFormData({ ...formData, permissions: newPerms });
  };

  const toggleMenu = (path: string) => {
    const current = formData.accessMenus || [];
    const newMenus = current.includes(path) 
        ? current.filter(m => m !== path) 
        : [...current, path];
    setFormData({ ...formData, accessMenus: newMenus });
  };

  const toggleOperation = (opId: string) => {
    const current = formData.linkedOperations || [];
    const newOps = current.includes(opId) 
        ? current.filter(id => id !== opId) 
        : [...current, opId];
    setFormData({ ...formData, linkedOperations: newOps });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{userToEdit ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Dados Básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Nome do usuário"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Institucional</label>
                <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="email@policia.pe.gov.br"
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Função Principal</label>
            <select 
                className="w-full h-10 border rounded px-3 text-sm focus:ring-2 focus:ring-gov-blue outline-none"
                value={formData.role}
                onChange={(e) => setFormData({
                    ...formData, 
                    role: e.target.value as UserRole, 
                    roles: [e.target.value as UserRole]
                })}
            >
                {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                ))}
            </select>
          </div>

          {/* Permissões */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase block">Permissões de Acesso</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border">
                {PERMISSIONS.map(perm => (
                    <label key={perm.value} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white p-1 rounded transition-colors">
                        <input 
                            type="checkbox" 
                            className="rounded text-gov-blue focus:ring-gov-blue h-4 w-4"
                            checked={formData.permissions?.includes(perm.value)}
                            onChange={() => togglePermission(perm.value)}
                        />
                        <span>{perm.label}</span>
                    </label>
                ))}
            </div>
          </div>

          {/* Menus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase block">Acesso aos Menus</label>
            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded border">
                {MENUS.map(menu => (
                    <label key={menu.path} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white p-1 rounded transition-colors">
                        <input 
                            type="checkbox" 
                            className="rounded text-gov-blue focus:ring-gov-blue h-4 w-4"
                            checked={formData.accessMenus?.includes(menu.path)}
                            onChange={() => toggleMenu(menu.path)}
                        />
                        <span className="text-xs">{menu.label}</span>
                    </label>
                ))}
            </div>
          </div>

          {/* Operações Vinculadas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase block">Operações Vinculadas</label>
            <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded border space-y-2">
                {availableOperations.length === 0 ? (
                    <span className="text-xs text-gray-400">Nenhuma operação cadastrada.</span>
                ) : (
                    availableOperations.map(op => (
                        <label key={op.id} className="flex items-center space-x-2 text-sm cursor-pointer border-b last:border-0 pb-1 last:pb-0 border-gray-200 hover:bg-white p-1 rounded transition-colors">
                            <input 
                                type="checkbox" 
                                className="rounded text-gov-blue focus:ring-gov-blue h-4 w-4"
                                checked={formData.linkedOperations?.includes(op.id)}
                                onChange={() => toggleOperation(op.id)}
                            />
                            <span className="truncate">{op.title}</span>
                        </label>
                    ))
                )}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-gov-blue hover:bg-blue-800 text-white" onClick={handleSave}>Salvar Usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
