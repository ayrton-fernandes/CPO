import { Operation, User, Target, Address } from "@/types";

export const MOCK_USERS: User[] = [
  { id: "u-master", name: "Coronel Almeida (Master)", email: "master@policia.pe.gov.br", role: "admin_master" },
  { id: "u-gerente", name: "Delegado Ricardo", email: "gerente@policia.pe.gov.br", role: "intelligence_manager" },
  { id: "u-analista", name: "Analista Fernanda", email: "analista@policia.pe.gov.br", role: "analyst" },
  { id: "u-investigador", name: "Agente Silva", email: "investigador@policia.pe.gov.br", role: "investigator" },
  { id: "u-planejamento", name: "Maj. Cavalcanti", email: "cpo@policia.pe.gov.br", role: "planning" },
  { id: "u-gestao", name: "Secretário Executivo", email: "gestao@sds.pe.gov.br", role: "management" },
];

// Helper para calcular maturidade de uma operação baseada em seus alvos
export const calculateMaturity = (targets: Target[]): number => {
  if (targets.length === 0) return 0;
  
  const totalPossiblePoints = targets.length * 3; // 3 critérios por alvo
  let currentPoints = 0;

  targets.forEach(t => {
    if (t.hasPhoto) currentPoints += 1;
    if (t.hasCpf && t.cpf !== "") currentPoints += 1;
    if (t.addresses.some(a => a.isConfirmed)) currentPoints += 1;
  });

  return Math.round((currentPoints / totalPossiblePoints) * 100);
};

const MOCK_TARGETS: Target[] = [
  {
    id: "t-001",
    name: "João da Silva",
    nickname: "Galo Cego",
    cpf: "123.456.789-00",
    hasCpf: true,
    hasPhoto: true,
    operationId: "op-001",
    riskLevel: "HIGH",
    addresses: [
      { id: "a-1", street: "Rua do Sol", number: "10", neighborhood: "Boa Vista", city: "Recife", isConfirmed: true }
    ]
  },
  {
    id: "t-002",
    name: "Marcos Oliveira",
    nickname: "Magnata",
    cpf: "999.888.777-66",
    hasCpf: true,
    hasPhoto: false,
    operationId: "op-001",
    riskLevel: "EXTREME",
    addresses: [
      { id: "a-2", street: "Av. Agamenon", number: "500", neighborhood: "Derby", city: "Recife", isConfirmed: false }
    ]
  }
];

export const MOCK_OPERATIONS: Operation[] = [
  {
    id: "op-001",
    title: "Operação Tempestade de Verão",
    description: "Desarticulação de quadrilha de roubo de cargas na Região Metropolitana.",
    status: "EM_ANALISE",
    priority: "HIGH",
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-28T14:30:00Z",
    createdBy: "u-gerente",
    department: "DENARC",
    location: "Recife/Jaboatão",
    resources: "Viaturas descaracterizadas, drones térmicos.",
    maturity: calculateMaturity(MOCK_TARGETS),
    assignedAgents: ["u-analista", "u-investigador"],
    targets: MOCK_TARGETS,
    documents: [],
    reports: [],
    validationHistory: []
  },
  {
    id: "op-002",
    title: "Operação Alvorada Segura",
    description: "Cumprimento de mandados de prisão em Olinda.",
    status: "PRONTA_EXECUCAO",
    priority: "CRITICAL",
    createdAt: "2023-11-15T08:00:00Z",
    updatedAt: "2023-12-25T09:00:00Z",
    createdBy: "u-gerente",
    department: "DPC",
    location: "Olinda",
    resources: "Efetivo do CORE, helicóptero da SDS.",
    maturity: 100,
    assignedAgents: ["u-investigador"],
    targets: [],
    documents: [],
    reports: [],
    validationHistory: []
  }
];