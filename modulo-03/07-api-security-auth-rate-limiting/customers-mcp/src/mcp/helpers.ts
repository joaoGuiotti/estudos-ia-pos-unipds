import type { TextContent } from '@modelcontextprotocol/server'

export type ToolResponse = {
  content: TextContent[]
  isError?: boolean
}

export function toToolResult(data: unknown): ToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  }
}

export function toToolMessage(message: string): ToolResponse {
  return {
    content: [{ type: 'text', text: message }],
  }
}

export function toToolError(err: unknown): ToolResponse {
  const message = err instanceof Error ? err.message : String(err)
  console.error('[tool-error]:', message)
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  }
}
