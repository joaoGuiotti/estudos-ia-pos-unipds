# LangChain / LangGraph Fastify Intro

Este é um projeto simples para introduzir os conceitos de **LangChain** e **LangGraph** rodando em um servidor Node.js com o framework **Fastify**.

A aplicação recebe uma mensagem do usuário através de uma API e, usando um grafo de estado (LangGraph), identifica a intenção e processa o texto para letras maiúsculas (uppercase), minúsculas (lowercase) ou responde com uma mensagem de *fallback* se o comando for desconhecido.

## 🚀 Como Rodar o Projeto

1. **Instale as dependências (caso ainda não tenha feito):**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run start:dev
   # ou apenas: npm start
   ```
   > O servidor será iniciado em `http://localhost:3000`

## 🧪 Como Rodar os Testes

Este projeto utiliza o testador nativo do Node.js (`node:test`) para garantir que os endpoints e o fluxo do grafo estão funcionando corretamente. Os testes E2E (End-to-End) enviam requisições reais para validar se cada intenção é processada pelo nó correto.

Para executar todos os testes da aplicação:
```bash
npm run test
# ou: npm run test:dev
```
*Dica: Você também pode usar a aba oficial de testes (ícone de béquer 🧪) diretamente na barra lateral do VS Code!*

---

## 📊 Visualizando o Grafo (LangGraph Studio / Servidor)

Como este projeto é construído com **LangGraph**, é possível visualizar o fluxo e os nós de execução da arquitetura de forma interativa! 

O projeto já possui um script pronto para subir o servidor de desenvolvimento do LangGraph. Para testar a visualização, execute em um novo terminal:

```bash
npm run lang:server
```
Esse comando inicia o `LangGraph CLI`, que te permite ver na tela como os nós (`identifyIntent`, `uppercase`, `lowercase`, `fallback`) estão conectados e como o roteamento das mensagens acontece nos bastidores.

---

## 📡 Como usar o Endpoint de Chat

O servidor expõe um endpoint `POST /chat` que aceita um objeto JSON contendo a mensagem sob a chave `question`. A propriedade `question` precisa ter no mínimo 5 caracteres.

> **Importante:** Como visto nos seus testes com o `curl`, sempre envie o cabeçalho `Content-Type: application/json`, caso contrário o Fastify irá rejeitar a requisição com o erro `415 Unsupported Media Type`.

### Exemplos de uso com cURL

**1. Transformando para letras MAIÚSCULAS:**
Se a mensagem contiver a palavra "upper", a intenção *uppercase* será ativada no fluxo do LangGraph.
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"make this uppercase please!"}'
```
*Resposta esperada:* `MAKE THIS UPPERCASE PLEASE!`

**2. Transformando para letras minúsculas:**
Se a mensagem contiver a palavra "lower", a intenção *lowercase* será ativada.
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"CONVERT THIS TO lower"}'
```
*Resposta esperada:* `convert this to lower`

**3. Comando desconhecido (Fallback):**
Se a mensagem não contiver as palavras-chave, o sistema não reconhecerá a intenção e ativará o nó de fallback.
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"uma mensagem qualquer"}'
```
*Resposta esperada:* `Unknown command. Try 'make this uppercase' or 'convert to lowercase'`
