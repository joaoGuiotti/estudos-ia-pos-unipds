import type { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod/v4'

export function registerCreateCustomerPrompt(server: McpServer): void {
  server.registerPrompt(
    'create_customer_prompt',
    {
      title: 'Create Customer Prompt',
      description: 'Prompt to create a new customer',
      argsSchema: z.object({
        name: z.string().describe('Full name of the customer'),
        phone: z.string().describe('Phone number of the customer'),
      }),
    },
    (args) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please create a new customer with the following details using the create_customer tool.\nDetails: ${JSON.stringify(args)}`,
          },
        },
      ],
    }),
  )
}
