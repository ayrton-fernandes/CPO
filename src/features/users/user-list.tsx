"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import { usersService } from "@/services/usersService";
import { Button } from "@/components/ui/button";
import { Edit2, Shield, UserPlus } from "lucide-react";
import { UserFormModal } from "./user-form-modal";
import { Badge } from "@/components/ui/badge";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = () => {
    setUsers(usersService.getAll());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    loadUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
        case 'admin_master': return "bg-purple-600 hover:bg-purple-700";
        case 'intelligence_manager': return "bg-blue-600 hover:bg-blue-700";
        case 'planning': return "bg-orange-600 hover:bg-orange-700";
        default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gov-blue" />
            Base de Usuários e Permissões
        </h2>
        <Button onClick={handleCreate} className="bg-gov-blue text-white gap-2">
            <UserPlus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                <tr>
                    <th className="px-4 py-3">Nome / Email</th>
                    <th className="px-4 py-3">Cargo (Role)</th>
                    <th className="px-4 py-3 text-center">Permissões</th>
                    <th className="px-4 py-3 text-center">Menus</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                            <div className="font-bold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white border-0`}>
                                {formatRole(user.role)}
                            </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-blue-50 text-gov-blue text-xs font-bold">
                                {user.permissions?.length || 0}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                             <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                {user.accessMenus?.length || 0}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="text-gray-500 hover:text-gov-blue">
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={selectedUser}
        onSave={handleSave}
      />
    </div>
  );
}
