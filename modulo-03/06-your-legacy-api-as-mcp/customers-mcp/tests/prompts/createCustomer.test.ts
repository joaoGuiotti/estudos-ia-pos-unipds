import { Client } from '@modelcontextprotocol/sdk/client'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { createTestClient } from '../helpers.ts'

describe('Create Customer Prompts', async () => {
  let client: Client

  before(async () => {
    client = await createTestClient()
  })

  after(async () => {
    await client.close()
  })

  it('should return the create_customer_prompt', async () => {
    const result = await client.getPrompt({
      name: 'create_customer_prompt',
      arguments: { name: 'João Otavio Guiotti' },
    })
    const text = result.messages[0].content
    assert.ok('text' in text && text.text.includes('create_customer'), 'Prompt should reference the create_customer tool')
    assert.ok('text' in text && text.text.includes('João Otavio Guiotti'), 'Prompt should include the query')
  })
})
