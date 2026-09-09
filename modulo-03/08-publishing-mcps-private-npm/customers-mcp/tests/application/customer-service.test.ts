import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import { CustomerService } from '../../src/application/customer-service.ts'
import { getServiceToken } from '../helpers.ts'

describe('CustomerService', () => {
  let service: CustomerService

  before(async () => {
    const token = await getServiceToken()
    service = new CustomerService('http://localhost:9999/v1', token)
  })

  it('should list customers', async () => {
    const customers = await service.listCustomers()
    assert.ok(Array.isArray(customers))
  })

  it('should create and find a customer', async () => {
    const created = await service.createCustomer({ name: 'Unit Test', phone: '000' })
    assert.ok(created.id)

    const found = await service.findCustomer({ name: 'Unit Test' })
    assert.ok(found)
    assert.strictEqual(found!.name, 'Unit Test')
  })

  it('should check health', async () => {
    const health = await service.healthCheck()
    assert.ok(health.app)
    assert.ok(health.version)
  })
})
