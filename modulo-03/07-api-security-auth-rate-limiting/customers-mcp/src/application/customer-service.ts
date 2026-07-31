import type { Customer, CustomerQuery } from '../domain/customer.ts'
import { CustomerHttpClient } from '../infrastructure/customer-http-client.ts'

interface MutationResult {
  id?: string
  message?: string
  isError?: boolean
}

export class CustomerService {
  private readonly client: CustomerHttpClient

  constructor(baseUrl: string, serviceToken: string) {
    this.client = new CustomerHttpClient(baseUrl, serviceToken)
  }

  async listCustomers(): Promise<Customer[]> {
    return this.client.listCustomers()
  }

  async createCustomer(customer: Omit<Customer, '_id'>): Promise<MutationResult> {
    return this.client.createCustomer(customer)
  }

  async findCustomer(query: CustomerQuery): Promise<Customer | null> {
    if (query._id) return this.client.getCustomerById(query._id)

    const customers = await this.client.listCustomers()
    return (
      customers.find(customer => {
        const entries = Object.entries(query) as [keyof Customer, string][]
        return entries.every(([key, value]) => {
          const customerValue = customer[key]
          return customerValue?.includes(value)
        })
      })
    ) ?? null
  }

  async updateCustomer(id: string, data: Partial<Omit<Customer, '_id'>>): Promise<MutationResult> {
    return this.client.updateCustomer(id, data)
  }

  async deleteCustomer(id: string): Promise<MutationResult> {
    return this.client.deleteCustomer(id)
  }

  async healthCheck(): Promise<{ app: string; version: string }> {
    return this.client.healthCheck()
  }
}
