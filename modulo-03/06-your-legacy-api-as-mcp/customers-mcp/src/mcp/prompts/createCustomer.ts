import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomerQuerySchema } from "../../domain/customer.ts";


export function registerCreateCustomerPrompt(server: McpServer) {
    server.registerPrompt(
        "create_customer_prompt",
        {
            description: "Prompt to create a new customer using the create_customer tool, ",
            argsSchema: CustomerQuerySchema.shape,
        },
        (query) => ({
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please create a new customer with the following details using the create_customer tool.\nDetails: ${JSON.stringify(query)}`,
                    }
                }
            ]
        })
    )
}