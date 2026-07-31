import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'
import type { CustomerService } from '../../application/customer-service.ts'
import { toToolResult, toToolError } from '../helpers.ts'

export function registerUpdateCustomerTool(server: McpServer, service: CustomerService): void {
  server.registerTool(
    'update_customer',
    {
      title: 'Update Customer',
      description: "Update an existing customer's name and/or phone number by their _id",
      inputSchema: z.object({
        _id: z.string().describe('MongoDB ObjectId of the customer to update'),
        name: z.string().optional().describe('New name of the customer'),
        phone: z.string().optional().describe('New phone number of the customer'),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ _id, name, phone }) => {
      try {
        const data: Record<string, string> = {}
        if (name !== undefined) data.name = name
        if (phone !== undefined) data.phone = phone
        const result = await service.updateCustomer(_id, data)
        return toToolResult(result)
      } catch (err) {
        return toToolError(err)
      }
    },
  )
}
