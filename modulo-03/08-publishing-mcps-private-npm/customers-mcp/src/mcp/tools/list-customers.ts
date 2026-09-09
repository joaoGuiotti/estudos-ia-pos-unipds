import type { McpServer } from '@modelcontextprotocol/server'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerListCustomersTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'list_customers',
    {
      title: 'List Customers',
      description: 'List all customers',
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const customers = await service.listCustomers()
        return toToolResult(customers)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
