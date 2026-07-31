import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerDeleteCustomerTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'delete_customer',
    {
      title: 'Delete Customer',
      description: 'Delete a customer by their _id',
      inputSchema: z.object({
        _id: z.string().describe('MongoDB ObjectId of the customer to delete'),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ _id }) => {
      try {
        const result = await service.deleteCustomer(_id)
        return toToolResult(result)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
