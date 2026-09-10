# Discovery & Refinement Pipeline

## Descrição do Projeto
Este projeto implementa um pipeline automatizado de **Discovery & Refinement** para UI/UX, impulsionado por Large Language Models (LLMs). Utilizando o Google AI Studio e a família de modelos Gemini como motores analíticos, a arquitetura visa acelerar a descoberta de produto, desde o tratamento inicial de dados e ideação, até o refinamento de requisitos e especificação técnica em formatos declarativos e estruturados.

## Arquitetura do Pipeline
A estrutura de arquivos do repositório reflete uma cadeia de raciocínio (Chain-of-Thought) modular, desenhada para separar contextos e garantir a qualidade do output do LLM:

* **Tratamento de Dados (Data Sanitization & LGPD):**
  * Scripts ou prompts dedicados a aplicar filtros de anonimização nos dados brutos de pesquisa/UX. Este passo elimina dados pessoais (PII), mantendo a conformidade restrita com as diretrizes da LGPD antes da submissão ao modelo de IA.
* **`prompts/` (Engenharia de Prompt):**
  * Diretório core contendo os arquivos de templates, system prompts e user prompts (geralmente em formato `.txt` ou `.md`). Os arquivos estão sequenciados para:
    1. **Discovery:** Extrair insights, personas e épicos com base nos inputs sanitizados.
    2. **Refinement:** Detalhar funcionalidades, quebrar épicos em User Stories técnicas e definir critérios de aceite.
* **Formatos de Saída (Outputs):**
  * **Markdown (`.md`):** Artefatos de documentação consolidados (Single Source of Truth), prontos para repositórios ou wikis corporativas.
  * **JSON (`.json`):** Estruturas de dados tipadas geradas pelo LLM para simular respostas de API, mapeamento de estados da UI e esquemas de banco de dados.
  * **Mermaid.js:** Arquivos ou blocos de código gerados pelo LLM com sintaxe Mermaid, permitindo a renderização direta de fluxogramas de navegação, diagramas de sequência e jornadas de usuário (User Flows).

## Como Utilizar
A arquitetura de prompts é agnóstica em relação à aplicação, permitindo que a cadeia de execução seja testada em qualquer plataforma que suporte janelas de contexto amplas. Para iterar e executar o pipeline localmente:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/joaoGuiotti/estudos-ia-pos-unipds.git
   cd estudos-ia-pos-unipds/modulo-04-ferramentas-IA-para-UI-UX/01-discovery-refinement
   ```
2. **Execute no seu LLM:**
   * Navegue até o diretório `/prompts`.
   * Copie o conteúdo dos arquivos de prompt seguindo a ordem lógica da arquitetura.
   * Cole as instruções no Google AI Studio (ou em seu motor LLM preferido).
   * Forneça seus próprios inputs de Discovery (dados de entrevistas, briefings) quando solicitado pelo prompt e valide as saídas geradas (Markdown, JSON e Mermaid).

## Stack Tecnológico
* **Motor de IA:** Google Gemini / Google AI Studio
* **Técnica:** Engenharia de Prompt (Prompt Engineering)
* **Visualização de Arquitetura:** Mermaid.js
* **Estruturação de Dados e Documentação:** Markdown, JSON
* **Segurança e Compliance:** Data Sanitization (Conformidade com LGPD)