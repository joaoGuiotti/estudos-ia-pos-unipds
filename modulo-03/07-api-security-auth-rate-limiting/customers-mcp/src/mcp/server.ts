import { McpServer } from '@modelcontextprotocol/server'
import { CustomerService } from '../application/customer-service.ts'
import { config } from '../config.ts'
import { registerCreateCustomerPrompt } from './prompts/createCustomer.ts'
import { registerFindCustomerPrompt } from './prompts/findCustomer.ts'
import { registerApiInfoResource } from './resources/api-info.ts'
import { registerCreateCustomerTool } from './tools/create-customer.ts'
import { registerDeleteCustomerTool } from './tools/delete-customer.ts'
import { registerGetCustomerTool } from './tools/get-customer.ts'
import { registerHealthCheckTool } from './tools/health-check.ts'
import { registerListCustomersTool } from './tools/list-customers.ts'
import { registerUpdateCustomerTool } from './tools/update-customer.ts'

export function createServer(): McpServer {
  const service = new CustomerService(config.apiUrl, config.serviceToken)

  const server = new McpServer({
    name: '@jguiottidev/ew-customers-mcp',
    version: '0.0.1',
  })

  registerListCustomersTool(server, service)
  registerGetCustomerTool(server, service)
  registerCreateCustomerTool(server, service)
  registerUpdateCustomerTool(server, service)
  registerDeleteCustomerTool(server, service)
  registerHealthCheckTool(server, service)
  registerApiInfoResource(server, config.apiUrl)
  registerFindCustomerPrompt(server)
  registerCreateCustomerPrompt(server)

  return server
}
