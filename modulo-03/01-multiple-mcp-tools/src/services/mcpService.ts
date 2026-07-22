import type { DynamicStructuredTool } from "@langchain/core/tools";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { getCSVtoJSONTool } from "../tools/csv-to-json.tool.ts";
import { getFileSystemTool as getFileSystemTools } from "../tools/file-system.tool.ts";
import { getMongoDBTool as getMongoDBTools } from "../tools/mongo-db.tool.ts";

export class MCPService {
  private client: MultiServerMCPClient;
  private cachedTools: DynamicStructuredTool[] | null = null;

  constructor() {
    this.client = new MultiServerMCPClient({
      mcpServers: {
        ...getMongoDBTools(),
        ...getFileSystemTools(),
      },
      onMessage: (log, source) => {
        console.log(`[${source}]: ${JSON.stringify(log.data, null, 2)}`);
      }
    });
  }

  async getTools(): Promise<DynamicStructuredTool[]> {
    if (this.cachedTools) {
      return this.cachedTools;
    }
    console.log('🔌 Connecting to MCP servers...');

    const mcpTools = await this.client.getTools();
    this.cachedTools = [
      ...mcpTools,
      getCSVtoJSONTool(),
    ];

    console.log(`✅ MCP tools loaded: ${this.cachedTools.map(t => t.name).join(', ')}`);
    return this.cachedTools;
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
    } catch {
      // ignore errors during shutdown
    } finally {
      this.cachedTools = null;
    }
  }
}
