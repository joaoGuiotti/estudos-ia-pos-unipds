import { describe, it, afterEach, beforeEach } from 'node:test'
import assert from 'node:assert'
import { createTestClient, getServiceToken } from '../helpers.ts'
import type { Client } from '@modelcontextprotocol/client'
import type { Customer } from '../../src/domain/customer.ts'

type ToolResult = { content: { text: string }[]; isError?: boolean }

function parseResult<T>(result: ToolResult): T {
  return JSON.parse(result.content[0].text) as T
}

describe('Customer Tools', async () => {
  let client: Client
  let createdId: string

  beforeEach(async () => {
    const serviceToken = await getServiceToken()
    client = await createTestClient(serviceToken)
  })

  afterEach(async () => {
    await client.close()
  })

  it('should list all customers', async () => {
    const result = await client.callTool({
      name: 'list_customers',
      arguments: {},
    }) as unknown as ToolResult

    const customers = parseResult<Customer[]>(result)
    assert.ok(Array.isArray(customers), 'Should return an array of customers')
  })

  it('should create a customer', async () => {
    const result = await client.callTool({
      name: 'create_customer',
      arguments: { name: 'Test MCP User', phone: '999-000-0001' },
    }) as unknown as ToolResult

    const data = parseResult<{ id: string; message: string }>(result)
    assert.ok(data.id, 'Should return the new customer id')
    assert.ok(data.message.includes('Test MCP User'), 'Confirmation message should include customer name')
    createdId = data.id
  })

  it('should get a customer by _id', async () => {
    const result = await client.callTool({
      name: 'get_customer',
      arguments: { _id: createdId },
    }) as unknown as ToolResult

    const customer = parseResult<Customer | null>(result)
    assert.ok(customer, 'Should return a customer object')
    assert.strictEqual(customer!.name, 'Test MCP User')
  })

  it('should get a customer by name', async () => {
    const result = await client.callTool({
      name: 'get_customer',
      arguments: { name: 'Test MCP User' },
    }) as unknown as ToolResult

    const customer = parseResult<Customer | null>(result)
    assert.ok(customer, 'Should return a customer matching the name')
    assert.strictEqual(customer!.phone, '999-000-0001')
  })

  it('should update a customer', async () => {
    const result = await client.callTool({
      name: 'update_customer',
      arguments: { _id: createdId, name: 'Test MCP User Updated', phone: '999-000-0002' },
    }) as unknown as ToolResult

    const data = parseResult<{ message: string; id: string }>(result)
    assert.ok(data.message, 'Should return a confirmation message')
    assert.strictEqual(data.id, createdId)
  })

  it('should reflect the update when getting by id', async () => {
    const result = await client.callTool({
      name: 'get_customer',
      arguments: { _id: createdId },
    }) as unknown as ToolResult

    const customer = parseResult<Customer>(result)
    assert.strictEqual(customer.name, 'Test MCP User Updated')
    assert.strictEqual(customer.phone, '999-000-0002')
  })

  it('should delete a customer', async () => {
    const result = await client.callTool({
      name: 'delete_customer',
      arguments: { _id: createdId },
    }) as unknown as ToolResult

    const data = parseResult<{ message: string }>(result)
    assert.ok(data.message, 'Should return a confirmation message')
  })

  it('should return null when getting a deleted customer by name', async () => {
    const result = await client.callTool({
      name: 'get_customer',
      arguments: { name: 'Test MCP User Updated' },
    }) as unknown as ToolResult

    const customer = parseResult<Customer | null>(result)
    assert.ok(!customer, 'Deleted customer should not be found')
  })

  it('should return isError when deleting with an invalid id', async () => {
    const result = await client.callTool({
      name: 'delete_customer',
      arguments: { _id: 'not-a-valid-id' },
    }) as unknown as ToolResult

    assert.ok(result.isError, 'Should return isError: true for invalid id')
  })

  it('should return isError when service token is invalid (list_customers)', async () => {
    const badClient = await createTestClient('invalid-token-that-does-not-exist')
    try {
      const result = await badClient.callTool({
        name: 'list_customers',
        arguments: {},
      }) as unknown as ToolResult

      assert.ok(result.isError, 'Should return isError: true for invalid token')
      assert.ok(
        result.content[0].text.toLowerCase().includes('unauthorized'),
        `Error message should mention "unauthorized", got: ${result.content[0].text}`,
      )
    } finally {
      await badClient.close()
    }
  })

  it('should reach rate limit', async () => {
    let result: ToolResult = { content: [{ text: '' }] }
    const maxAttempts = 100
    for (let index = 0; index < maxAttempts; index++) {
      result = await client.callTool({
        name: 'list_customers',
        arguments: {},
      }) as unknown as ToolResult

      if (result.isError) {
        break
      }
    }

    assert.ok(result.isError, 'Should return isError: true for rate limit exceeded')
    assert.ok(
      result.content[0].text.toLowerCase().includes('rate limit'),
      `Error message should mention "rate limit", got: ${result.content[0].text}`,
    )
  })
})
