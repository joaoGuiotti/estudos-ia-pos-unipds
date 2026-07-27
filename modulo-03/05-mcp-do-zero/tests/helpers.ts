import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const createTestClient = async () => {
    const transport = new StdioClientTransport({
        command: 'node',
        args: [
            '--experimental-strip-types',
            'src/index.ts'
        ]
    });

    const client = new Client({
        name: 'Test Client',
        version: '1.0.0'
    }, {
        capabilities: {}
    });
    await client.connect(transport);
    return client;
}

export const encryptMessage = async (client: Client, message: string, encryptionKey: string) => {
    const result = await client.callTool({
        name: 'encrypt_message',
        arguments: {
            message,
            encryptionKey
        }
    }) as unknown as { structuredContent: { encryptedMessage: string } }
    return result;
}

export const decryptMessage = async (client: Client, encryptedMessage: string, encryptionKey: string) => {
    const result = await client.callTool({
        name: 'decrypt_message',
        arguments: {
            encryptedMessage,
            encryptionKey
        }
    }) as unknown as { structuredContent: { decryptedMessage: string } }
    return result;
}