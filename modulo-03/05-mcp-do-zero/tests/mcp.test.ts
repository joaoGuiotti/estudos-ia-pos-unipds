import { Client } from '@modelcontextprotocol/sdk/client';
import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';
import { createTestClient, decryptMessage, encryptMessage } from './helpers.ts';

describe('MCP Tool Tests', () => {
    let client: Client;
    let encryptionKey: string = 'my-super-secret-key-1234';

    before(async () => {
        client = await createTestClient();
    })

    after(async () => {
        await client.close();
    })

    it('Should encrypt messages', async () => {
        const message = 'Hello, World!';
        const result = await encryptMessage(client, message, encryptionKey);
        assert.ok(
            result.structuredContent?.encryptedMessage.length > 60,
            'Encrypted message should be longer than the original'
        );
    });

    it('Should decrypt messages', async () => {
        const message = 'Heyyy, I am Jota!';
        const encryptKey = 'my-secret-key-jota';
        const { structuredContent: { encryptedMessage } } = await encryptMessage(client, message, encryptKey);
        const { structuredContent: { decryptedMessage } } = await decryptMessage(client, encryptedMessage, encryptKey);
        assert.deepStrictEqual(decryptedMessage, message, 'Decrypted message should match the original message');
    });

    it('Should list the encryption://info resource', async () => {
        const { resources } = await client.listResources();
        const info = resources.find(info => info.uri === 'encryption://info');
        assert.ok(
            !!info,
            'Should have an encryption://info resource'
        );
    });

    it('Should return the encrypt_message_prompt', async () => {
        const result = await client.getPrompt({
            name: 'encrypt_message_prompt',
            arguments: {
                message: 'Secret Text',
                encryptionKey,
            }
        });

        const item = result.messages.at(0)?.content as unknown as { text: string }
        const expected = `Encrypt the following message using the 'encrypt_message' tool.\n\nMessage: Secret Text\nEncryption Key: ${encryptionKey}`;
        assert.deepStrictEqual(item.text, expected, 'Prompt text should match the expected text');
    });
});