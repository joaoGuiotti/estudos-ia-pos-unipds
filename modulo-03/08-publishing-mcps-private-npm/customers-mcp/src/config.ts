export const config = {
  apiUrl: process.env.CUSTOMERS_API_URL ?? 'http://localhost:9999/v1',
  serviceToken: process.env.SERVICE_TOKEN ?? '',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 10_000,
  maxRetries: Number(process.env.MAX_RETRIES) || 3,
} as const

export function validateConfig(): void {
  if (!config.serviceToken) {
    console.error('[error]: SERVICE_TOKEN env var is required')
    process.exit(1)
  }
}
