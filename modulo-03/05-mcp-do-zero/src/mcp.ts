import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v4';
import { decrypt, encrypt } from './service.ts';

export const server = new McpServer({
    name: '@jguiotti/ciphersuite-mcp',
    version: '1.0.0'
});

server.registerTool(
    'encrypt_message',
    {
        description: 'Encrypt a message',
        inputSchema: z.object({
            message: z.string().describe('The message to encrypt'),
            encryptionKey: z.string().describe(
                'Any passphrase (min 8 chars) to use for encryption - The server derives a strong key from it automatically'
            )
        }),
        outputSchema: z.object({
            encryptedMessage: z.string().describe(
                'The encrypted message (format: <iv>:<ciphertext>)'
            )
        }),
    },
    async ({ message, encryptionKey }) => {
        try {
            const encryptedMessage = encrypt(message, encryptionKey);
            return {
                content: [{ type: 'text', text: encryptedMessage }],
                structuredContent: { encryptedMessage }
            }
        }
        catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Error encrypting message: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            }
        }
    }
);

server.registerTool(
    'decrypt_message',
    {
        description: 'Decrypt a message that was encrypted using `encrypt_message` tool',
        inputSchema: z.object({
            encryptedMessage: z.string().describe(
                'The encrypted message (format: <iv>:<ciphertext>)'
            ),
            encryptionKey: z.string().describe(
                'The passphrase (min 8 chars) used for encryption'
            )
        }),
        outputSchema: z.object({
            decryptedMessage: z.string().describe(
                'The original decrypted message'
            )
        })
    },
    async ({ encryptedMessage, encryptionKey }) => {
        try {
            const decryptedMessage = decrypt(encryptedMessage, encryptionKey);
            return {
                content: [{ type: 'text', text: decryptedMessage }],
                structuredContent: { decryptedMessage }
            }
        }
        catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Error decrypting message: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            }
        }
    }
);

server.registerResource(
    'encryption://info',
    'encryption://info',
    {
        description: 'Describes the encrytion algorithm, key requirements, and output format used by the CipherSuite MCP server.',
    },
    () => ({
        contents: [
            {
                uri: 'encryption://info',
                mimeType: 'text/plain',
                text: `
                    Algorithm: AES-256-CBC
                    KeyDerivation: PBKDF2 (8-16 char passphrase)
                    Output Format: <ivHex>:<encryptedHex>
                    Notes: 
                        - Only supports text/plain content.
                        - Message and key are processed server-side only (no data is leaked).
                        - IV is randomly generated for each encryption.
                        - Keep the full "iv:encrypted" string for decryption. 
                `.trim()
            }
        ]
    })
);

server.registerPrompt("encrypt_message_prompt",
    {
        description: 'Prompt to encrypt a plain-text message using the encrypt_message tool.',
        argsSchema: {
            message: z.string().describe('The message to encrypt'),
            encryptionKey: z.string().describe(
                'Any passphrase (min 8 chars) to use for encryption - The server derives a strong key from it automatically'
            )
        },
    },
    ({ message, encryptionKey }) => ({
        messages: [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Encrypt the following message using the 'encrypt_message' tool.\n\nMessage: ${message}\nEncryption Key: ${encryptionKey}`,
                }
            },
        ]
    })
);


