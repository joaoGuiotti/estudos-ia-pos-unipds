import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'

export function registerFindCustomerPrompt(server: McpServer): void {
  server.registerPrompt(
    'find_customer_prompt',
    {
      title: 'Find Customer Prompt',
      description: 'Prompt to search a customer using any combination of _id, name or phone',
      argsSchema: z.object({
        _id: z.string().optional().describe('MongoDB ObjectId of the customer'),
        name: z.string().optional().describe('Full name of the customer'),
        phone: z.string().optional().describe('Phone number of the customer'),
      }),
    },
    (args) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please find the customer matching the following query using the get_customer or list_customers tool.\nQuery: ${JSON.stringify(args)}`,
          },
        },
      ],
    }),
  )
}
