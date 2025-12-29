# CPO Digital - Controle de Operações Policiais (Protótipo)

Este é um protótipo funcional de alta fidelidade do **CPO Digital**, um sistema governamental para gestão do ciclo de vida de operações policiais, desenvolvido com **Next.js 14**, **TypeScript** e **Tailwind CSS**, seguindo a identidade visual do **Governo de Pernambuco**.

## 🚀 Visão Geral

O sistema digitaliza e orquestra o fluxo de operações entre diferentes departamentos:
1.  **Inteligência:** Identificação de demandas e criação de operações.
2.  **Investigação:** Coleta de evidências e relatórios de campo.
3.  **Planejamento:** Validação estratégica, alocação de recursos e aprovação.
4.  **Gestão:** Monitoramento via indicadores e mapas táticos.

## 🛠️ Stack Tecnológica

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS v4 + Design System Customizado (PE Digital)
*   **Estado:** Zustand (Gerenciamento Global e Auth)
*   **Formulários:** React Hook Form + Zod
*   **Ícones:** Lucide React
*   **Gráficos:** Recharts
*   **Componentes UI:** Radix UI Primitives (Tabs, Popover)

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura baseada em funcionalidades (**Feature-Based**), facilitando a escalabilidade e manutenção.

```plaintext
src/
├── app/                      # Rotas (Next.js App Router)
├── components/               # Componentes Visuais Genéricos
│   ├── ui/                   # Design System (Button, Input, Card, etc.)
│   └── layout/               # Sidebar, Header, PageContainer
├── features/                 # DOMÍNIO DO NEGÓCIO
│   ├── auth/                 # Login
│   ├── dashboard/            # Kanban e Widgets
│   ├── indicators/           # Gráficos de Gestão
│   ├── map/                  # Mapa Tático
│   └── operacoes/            # CRUD, Wizard e Detalhes
├── hooks/                    # Hooks globais (useAuthStore, useNotificationStore)
├── services/                 # Mock Services (Simulação de Backend)
└── types/                    # Definições de Tipos (User, Operation, etc.)
```

## 🔑 Acesso e Personas (Mock)

O sistema possui um autenticador simulado. Utilize as credenciais abaixo (Senha padrão: **123**):

| Usuário | Login | Função | Acessos Principais |
| :--- | :--- | :--- | :--- |
| **Investigador** | `investigador` | Execução | Ver Operações, Criar Relatórios, Upload Docs |
| **Inteligência** | `inteligencia` | Criação | **Criar Operação (Wizard)**, Ver Mapa, Dashboard |
| **Planejamento** | `planejamento` | Validação | **Kanban**, Validar Operação, Alocar Recursos, Mapa |
| **Admin** | `admin` | Gestão Total | Acesso irrestrito a todas as funcionalidades |
| **Gestor** | (Use Admin) | Estratégia | Dashboards, Indicadores, Mapas |

## ✨ Funcionalidades Implementadas

### 1. Fluxo Operacional (BPMN)
*   **Criação (Wizard):** Formulário em etapas para Inteligência cadastrar operações, alvos e anexos iniciais.
*   **Pipeline:** Status bem definidos: *Em Análise* -> *Em Investigação* -> *Em Planejamento* -> *Pronta p/ Execução*.
*   **Kanban:** Visualização de cartões para o setor de Planejamento gerenciar o fluxo.

### 2. Detalhes da Operação
*   **Abas:** Geral, Documentos, Relatórios, Fluxo & Status.
*   **Documentos:** Simulação de upload de arquivos.
*   **Relatórios:** Timeline de relatórios investigativos com formulário de criação.
*   **Edição Estratégica:** Planejamento pode editar recursos e equipe responsável.

### 3. Ferramentas de Gestão
*   **Indicadores:** Dashboard com gráficos (Pizza, Barras) e métricas de eficiência.
*   **Mapa Tático:** Visualização geográfica (Heatmap simulado) das operações ativas.
*   **Busca Global:** Pesquisa rápida por operações, IDs ou alvos no Header.
*   **Filtros Avançados:** Filtragem por Data, Prioridade e Delegacia.

### 4. UX e Acessibilidade
*   **Design System:** Cores e componentes fiéis ao guia do Governo de PE.
*   **Responsividade:** Menu lateral adaptável (Drawer mobile).
*   **Notificações:** Central de alertas simulada.
*   **Reset Demo:** Botão flutuante para reiniciar o estado da demonstração.

## 🚀 Como Rodar

1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Acesse `http://localhost:3000`.

---
*Desenvolvido como Protótipo Conceitual para o CPO Digital.*