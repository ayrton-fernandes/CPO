# Funcionalidades — CPO Digital

Este documento lista apenas as funcionalidades do sistema e descreve, de forma resumida, o que cada uma faz.

- Autenticação: permite login de usuários com credenciais de teste e mantém sessão local em memória.
- Perfis e permissões: diferencia ações e visibilidade por papel (ex.: investigator vê só operações atribuídas).
- Listagem de Operações: exibe operações em cards com título, status, prioridade, maturidade e local.
- Busca e Filtros: busca por título/ID e filtros por status e prioridade para refinar a listagem.
- Criação de Operação (wizard): assistente passo-a-passo para criar nova operação com targets iniciais.
- Detalhe da Operação: visualiza e edita dados da operação, incluindo descrição, recursos e responsáveis.
- Edição de Targets: adicionar/editar alvos de uma operação (nome, CPF, foto, endereços, nível de risco).
- Verificação de Conflitos de Alvo: detecta se um alvo está presente em outra operação (por CPF ou apelido).
- Cálculo de Maturidade: calcula percentual de maturidade da operação com base em critérios dos targets.
- Gestão de Documentos: upload, listagem e associação de documentos à operação.
- Geração de Relatórios: criar e visualizar relatórios relacionados a uma operação.
- Workflow/Validação: aplicar e registrar etapas de validação e histórico de mudanças na operação.
- Mapas / Geolocalização: exibe operações e alvos em mapa para análise espacial.
- Indicadores / Dashboard: painéis com métricas e indicadores do conjunto de operações.
- Kanban de Planejamento: quadro para organizar etapas/atividades de planejamento operacional.
- Notificações: feedback ao usuário (sucesso/erro) via toasts durante ações relevantes.
- Componentes UI Reutilizáveis: biblioteca de componentes (botões, inputs, cards, dialogs) para consistência visual.
- Sidebar e Layouts: navegação lateral e contêineres de página para estrutura da interface.
- Estado e Serviços em Memória: serviços que manipulam dados mock em memória (CRUD de operações).
- Reset de Dados Mock: restaura dados iniciais para demonstração e testes.
