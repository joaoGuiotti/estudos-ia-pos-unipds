import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createServer } from './mcp/server.ts'
import { validateConfig } from './config.ts'

async function main() {
  validateConfig()

  await serveStdio(() => createServer())
  console.error('Customers MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
