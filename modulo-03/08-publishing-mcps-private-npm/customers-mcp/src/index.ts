#!/usr/bin/env tsx

import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { validateConfig } from './config.ts'
import { createServer } from './mcp/server.ts'

async function main() {
  validateConfig()

  await serveStdio(() => createServer())
  console.error('Customers MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
