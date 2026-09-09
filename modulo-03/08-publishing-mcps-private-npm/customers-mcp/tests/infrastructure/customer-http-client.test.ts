import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { CustomerHttpClient } from '../../src/infrastructure/customer-http-client.ts'
import { getServiceToken } from '../helpers.ts'
import { UnauthorizedError } from '../../src/domain/errors.ts'

describe('CustomerHttpClient', () => {
  let client: CustomerHttpClient

  before(async () => {
    const token = await getServiceToken()
    client = new CustomerHttpClient('http://localhost:9999/v1', token)
  })

  it('should list customers', async () => {
    const customers = await client.listCustomers()
    assert.ok(Array.isArray(customers))
  })

  it('should throw UnauthorizedError with invalid token', async () => {
    const badClient = new CustomerHttpClient('http://localhost:9999/v1', 'invalid-token')
    await assert.rejects(
      () => badClient.listCustomers(),
      UnauthorizedError,
    )
  })

  it('should return null for non-existent customer by id', async () => {
    const result = await client.getCustomerById('000000000000000000000000')
    assert.strictEqual(result, null)
  })
})
