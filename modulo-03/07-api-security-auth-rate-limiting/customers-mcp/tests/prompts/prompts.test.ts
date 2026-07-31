import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { createTestClient, getServiceToken } from '../helpers.ts'
import type { Client } from '@modelcontextprotocol/client'

describe('Customer Prompts', async () => {
  let client: Client

  before(async () => {
    const serviceToken = await getServiceToken()
    client = await createTestClient(serviceToken)
  })

  it('should list prompts', async () => {
    const { prompts } = await client.listPrompts()
    const names = prompts.map(p => p.name)
    assert.ok(names.includes('create_customer_prompt'), 'Should list create_customer_prompt')
    assert.ok(names.includes('find_customer_prompt'), 'Should list find_customer_prompt')
  })

  it('should get create_customer_prompt', async () => {
    const result = await client.getPrompt({
      name: 'create_customer_prompt',
      arguments: { name: 'Test', phone: '123' },
    })
    assert.ok(result.messages.length > 0, 'Should return at least one message')
    const text = result.messages[0].content as { type: string; text: string }
    assert.ok(text.text.includes('create_customer'), 'Message should reference create_customer tool')
  })

  it('should get find_customer_prompt', async () => {
    const result = await client.getPrompt({
      name: 'find_customer_prompt',
      arguments: { name: 'John' },
    })
    assert.ok(result.messages.length > 0, 'Should return at least one message')
    const text = result.messages[0].content as { type: string; text: string }
    assert.ok(text.text.includes('get_customer'), 'Message should reference get_customer tool')
  })
})
