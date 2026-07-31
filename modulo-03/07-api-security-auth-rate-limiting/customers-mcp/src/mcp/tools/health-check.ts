import type { McpServer } from '@modelcontextprotocol/server'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerHealthCheckTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'health_check',
    {
      title: 'Health Check',
      description: 'Check if the Customers API is reachable',
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const result = await service.healthCheck()
        return toToolResult(result)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
