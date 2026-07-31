import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerCreateCustomerTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'create_customer',
    {
      title: 'Create Customer',
      description: 'Create a new customer',
      inputSchema: z.object({
        name: z.string().describe('Full name of the customer'),
        phone: z.string().describe('Phone number of the customer'),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ name, phone }) => {
      try {
        const result = await service.createCustomer({ name, phone })
        return toToolResult(result)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
