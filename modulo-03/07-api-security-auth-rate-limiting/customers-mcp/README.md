# @jguiottidev/ew-customers-mcp

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that wraps a Customers CRUD REST API into MCP tools, resources, and prompts — ready to use inside VS Code Copilot Chat and other MCP-compatible agents.

---

## What it does

| Capability | Name | Description |
|---|---|---|
| 🔧 Tool | `health_check` | Check if the Customers API is reachable |
| 🔧 Tool | `list_customers` | List all customers |
| 🔧 Tool | `get_customer` | Find a customer by `_id`, `name`, or `phone` |
| 🔧 Tool | `create_customer` | Create a new customer |
| 🔧 Tool | `update_customer` | Update an existing customer's name and/or phone |
| 🔧 Tool | `delete_customer` | Delete a customer by `_id` |
| 📄 Resource | `customers://api-info` | Describes the Customers REST API endpoints |
| 💬 Prompt | `create_customer_prompt` | Prompt template for creating a customer |
| 💬 Prompt | `find_customer_prompt` | Prompt template for searching a customer |

### Authentication

The MCP server authenticates against the Customers API using a **service token**. Set the `SERVICE_TOKEN` environment variable with a token obtained from `POST /v1/auth/service-token`.

---

## Prerequisites

- **Node.js v24+** (see `engines` in `package.json`)
- A running instance of the [Customers API](https://github.com/jguiottidev/modulo-3-crud-mcp) at `http://localhost:9999`

---

## Installation

```bash
npm install
```

No build step is needed — the server runs TypeScript directly via Node.js native TypeScript support.

---

## Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `CUSTOMERS_API_URL` | `http://localhost:9999/v1` | Base URL of the Customers API |
| `SERVICE_TOKEN` | — | Service token for API authentication |

---

## Using in VS Code

### 1. Add the MCP server configuration

Create (or open) `.vscode/mcp.json` in your workspace and add:

```json
{
  "servers": {
    "customers-mcp": {
      "command": "node",
      "args": ["--experimental-strip-types", "./src/index.ts"],
      "env": {
        "CUSTOMERS_API_URL": "http://localhost:9999/v1",
        "SERVICE_TOKEN": "<your-service-token>"
      }
    }
  }
}
```

### 2. Reload VS Code

Open the Command Palette (`Cmd+Shift+P`) and run **Developer: Reload Window**.

### 3. Use it in Copilot Chat

Open Copilot Chat (Agent mode) and try:

```
List all customers
```

```
Create a customer named "John Doe" with phone "123456789"
```

```
Find customer with name "John Doe"
```

The agent will automatically call the appropriate tool and return the result.

---

## Running the MCP Inspector

```bash
npm run mcp:inspect
```

Opens the inspector at `http://localhost:5173`.

---

## Running tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:dev
```

---

## Project structure

```
src/
  index.ts              # Entry point — connects the server to stdio transport
  config.ts             # Environment configuration
  domain/
    customer.ts         # Zod schemas and types for Customer
    errors.ts           # Domain error classes
  application/
    customer-service.ts # Business logic layer
  infrastructure/
    customer-http-client.ts # HTTP client for the Customers API
  mcp/
    server.ts           # MCP server setup and tool/resource/prompt registration
    tools/              # Tool registration functions
    resources/          # Resource registration
    prompts/            # Prompt registration
    helpers.ts          # Shared helpers for tool responses
tests/
  helpers.ts            # Test client factory
  domain/               # Unit tests for domain schemas
  application/          # Unit tests for application service
  infrastructure/       # Unit tests for HTTP client
  tools/                # E2E tests for MCP tools
  resources/            # E2E tests for MCP resources
  prompts/              # Tests for MCP prompts
```

---

## Available scripts

| Script | Description |
|---|---|
| `npm start` | Start the server (used by MCP clients) |
| `npm run dev` | Start with file-watch and Node.js inspector |
| `npm test` | Run all tests |
| `npm run test:dev` | Run tests in watch mode |
| `npm run mcp:inspect` | Open the MCP Inspector UI |

## License

ISC
