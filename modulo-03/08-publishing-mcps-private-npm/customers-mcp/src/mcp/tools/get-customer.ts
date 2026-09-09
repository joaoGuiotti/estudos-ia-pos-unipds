import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerGetCustomerTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'get_customer',
    {
      title: 'Get Customer',
      description: 'Find a customer by _id, name, or phone number',
      inputSchema: z.object({
        _id: z.string().optional().describe('MongoDB ObjectId of the customer'),
        name: z.string().optional().describe('Full name of the customer'),
        phone: z.string().optional().describe('Phone number of the customer'),
      }),
      annotations: { readOnlyHint: true },
    },
    async (query) => {
      try {
        const customer = await service.findCustomer(query)
        return toToolResult(customer)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
