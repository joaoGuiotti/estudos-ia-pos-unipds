import { describe, it } from 'node:test'
import assert from 'node:assert'
import { CustomerSchema, CustomerQuerySchema } from '../../src/domain/customer.ts'

describe('Customer Schemas', () => {
  it('should validate a valid customer', () => {
    const result = CustomerSchema.safeParse({ name: 'John', phone: '123' })
    assert.ok(result.success)
    if (result.success) {
      assert.strictEqual(result.data.name, 'John')
      assert.strictEqual(result.data.phone, '123')
    }
  })

  it('should reject a customer without name', () => {
    const result = CustomerSchema.safeParse({ phone: '123' })
    assert.ok(!result.success)
  })

  it('should reject a customer without phone', () => {
    const result = CustomerSchema.safeParse({ name: 'John' })
    assert.ok(!result.success)
  })

  it('should accept empty query for CustomerQuerySchema', () => {
    const result = CustomerQuerySchema.safeParse({})
    assert.ok(result.success)
  })

  it('should accept partial query with only name', () => {
    const result = CustomerQuerySchema.safeParse({ name: 'John' })
    assert.ok(result.success)
    if (result.success) {
      assert.strictEqual(result.data.name, 'John')
    }
  })
})
