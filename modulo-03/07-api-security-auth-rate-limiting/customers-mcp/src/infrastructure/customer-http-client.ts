import type { Customer } from '../domain/customer.ts'
import { UnauthorizedError, ForbiddenError, RateLimitError } from '../domain/errors.ts'
import { config } from '../config.ts'

interface MutationResult {
  id?: string
  message?: string
  isError?: boolean
}

export class CustomerHttpClient {
  private readonly baseUrl: string
  private readonly authHeaders: Record<string, string>

  constructor(baseUrl: string, serviceToken: string) {
    this.baseUrl = baseUrl
    this.authHeaders = { Authorization: `Bearer ${serviceToken}` }
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const ac = new AbortController()
    const timeoutId = setTimeout(() => ac.abort(), config.requestTimeoutMs)

    const headers: Record<string, string> = {
      'User-Agent': 'customers-mcp-server/0.0.1',
      ...this.authHeaders,
    }

    if (options?.headers) {
      const optHeaders = options.headers as Record<string, string>
      Object.assign(headers, optHeaders)
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: options?.method,
        headers,
        body: options?.body,
        signal: ac.signal,
      })

      if (res.status === 401) throw new UnauthorizedError()
      if (res.status === 403) throw new ForbiddenError()
      if (res.status === 429) throw new RateLimitError()
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText} - ${await res.text()}`)

      return res.json() as Promise<T>
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async listCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers')
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await this.request<Customer>(`/customers/${id}`)
    } catch (err) {
      if (err instanceof Error && (err.message.startsWith('HTTP 404') || err.message.startsWith('HTTP 400'))) {
        return null
      }
      throw err
    }
  }

  async createCustomer(data: Omit<Customer, '_id'>): Promise<MutationResult> {
    return this.request<MutationResult>('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(id: string, data: Partial<Omit<Customer, '_id'>>): Promise<MutationResult> {
    return this.request<MutationResult>(`/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(id: string): Promise<MutationResult> {
    return this.request<MutationResult>(`/customers/${id}`, {
      method: 'DELETE',
    })
  }

  async healthCheck(): Promise<{ app: string; version: string }> {
    const base = this.baseUrl.replace('/v1', '')
    const res = await fetch(`${base}/v1/health`, {
      headers: this.authHeaders,
    })
    if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`)
    return res.json() as Promise<{ app: string; version: string }>
  }
}
