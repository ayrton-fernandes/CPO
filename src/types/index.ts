export type Role = 
  | 'admin_master' 
  | 'intelligence_manager' 
  | 'analyst' 
  | 'investigator' 
  | 'planning' 
  | 'management';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export type OperationStatus = 
  | 'EM_ANALISE'           
  | 'AGUARDANDO_VALIDACAO' 
  | 'PLANEJAMENTO'         
  | 'PRONTA_EXECUCAO'      
  | 'FINALIZADA';          

export interface Address {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  isConfirmed: boolean;
}

export interface Target {
  id: string;
  name: string;
  nickname: string;
  cpf: string;
  hasCpf: boolean;
  hasPhoto: boolean;
  addresses: Address[];
  operationId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface ValidationEntry {
  id: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
  userId: string;
  date: string;
}

export interface Operation {
  id: string;
  title: string;
  description: string;
  status: OperationStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  department: string;
  location: string;
  resources?: string;
  maturity: number; 
  assignedAgents: string[]; 
  targets: Target[];
  documents: OperationDocument[];
  reports: OperationReport[];
  validationHistory: ValidationEntry[];
}

export interface OperationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'CAMPO' | 'INTELIGENCIA' | 'MANDADO' | 'ESCUTA' | 'OUTROS';
}

export interface OperationReport {
  id: string;
  title: string;
  content: string;
  type: 'CAMPO' | 'INTELIGENCIA';
  author: string;
  createdAt: string;
  version: number;
}