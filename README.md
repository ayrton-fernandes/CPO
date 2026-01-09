# CPO Digital - Sistema de Gestão e Inteligência Operacional

> Este sistema é um **PROTÓTIPO (PoC/MVP)** desenvolvido para fins de validação de conceito e arquitetura. Algumas funcionalidades podem operar com dados simulados e persistência local para demonstração de fluxo.

## 📋 Resumo Executivo

O **CPO Digital** é uma plataforma governamental de alta performance desenvolvida para modernizar a gestão de segurança pública (Polícia Civil e Defesa Social). O sistema orquestra todo o ciclo de vida de operações policiais, desde a fase de inteligência e identificação de alvos até o planejamento tático e execução em campo.

Focado na integridade da informação e na segurança operacional, o CPO centraliza dados sensíveis, garantindo comunicação criptografada e controle rigoroso de acesso, transformando dados brutos em inteligência acionável.


---

## 🚀 Principais Funcionalidades

O sistema foi construído com foco em robustez, usabilidade e segurança.

*   **🔐 Segurança & RBAC (Role-Based Access Control)**
    *   Controle de acesso granular com perfis hierárquicos: Investigador, Analista, Gestor e Admin Master.
    *   Cada funcionalidade e dado é protegido de acordo com a credencial do usuário logado.

*   **🎯 Gestão Inteligente de Alvos**
    *   Banco global de suspeitos unificado.
    *   Detecção automática de duplicidade (CPF/Nome) e alertas de conflito em tempo real entre operações distintas.

*   **📊 Cálculo de Maturidade Operacional**
    *   Algoritmo proprietário que pontua operações (0-100%) baseando-se no preenchimento de dados críticos (alvos identificados, recursos alocados, validação jurídica, etc.).
    *   Bloqueio lógico de operações imaturas para execução.

*   **📱 Mobile First & Responsividade**
    *   Interface adaptativa projetada para uso híbrido: tanto em grandes telas nos Centros de Comando quanto em tablets/celulares de agentes em campo.

*   **👁️ Auditoria Total (Audit Trail)**
    *   Logs imutáveis, detalhados e humanizados de todas as ações.
    *   Rastreabilidade completa: *Quem* fez, *Quando* fez e *O que* foi alterado (Snapshot "Antes" vs "Depois").

*   **💬 Mensageria Segura**
    *   Canal de comunicação interno e criptografado, eliminando a necessidade de apps de terceiros (WhatsApp/Telegram) para troca de informações sensíveis da operação.

*   **📂 Persistência & Resiliência**
    *   Arquitetura resiliente com persistência local avançada (simulação robusta de banco de dados via `localStorage`).
    *   Funcionalidade de **Backup & Restore** de cenários operacionais via arquivos JSON, facilitando testes e migração de dados.

---

## 🛠️ Stack Tecnológica

Projeto desenvolvido utilizando as tecnologias mais modernas do ecossistema React/Next.js.

*   **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/).
*   **Estilização & UI:** [Tailwind CSS](https://tailwindcss.com/), [ShadcnUI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/).
*   **Gerenciamento de Estado:** [Zustand](https://docs.pmnd.rs/zustand) (Store global leve e performático).
*   **Utilitários & Validação:**
    *   `date-fns` para manipulação robusta de datas.
    *   `zod` para validação de schemas e formulários.

---

## 📦 Guia de Instalação e Uso

Siga os passos abaixo para executar o projeto localmente:

1.  **Clonar o repositório**
    ```bash
    git clone https://github.com/seu-usuario/cpo-prototipo.git
    cd cpo-prototipo
    ```

2.  **Instalar dependências**
    ```bash
    npm install
    ```

3.  **Executar o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

4.  **Acessar a aplicação**
    Abra seu navegador em [http://localhost:3000](http://localhost:3000).

### 🔑 Credenciais de Acesso (Demo)
Para explorar todas as funcionalidades (incluindo painéis administrativos):

*   **Usuário:** `admin_master`
*   **Senha:** `123456`

---

## 👥 Desenvolvido por:

*   **Nome:** Ayrton Leonardo Fernandes de Melo
*   **Papel:** Desenvolvedor Fullstack
---

© 2025 CPO Digital. Todos os direitos reservados.
