import assert from 'node:assert/strict';
import test from "node:test";
import { createServer } from "../src/server.ts";

const app = createServer();

test('Should command upper transform message into UPPERCASE', async (t) => {
    const app = createServer();
    const msg = 'MAKE THIS MESSAGE UPPERCASE, AND WRITE IT DOWN HERE'
    const expectedMsg = msg.toUpperCase();

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: msg }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expectedMsg)
});

test('Should command lower transform message into lowercase', async (t) => {
    const app = createServer();
    const msg = 'make this message lowercase, and write it down here'
    const expectedMsg = msg.toLowerCase();

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: msg }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expectedMsg)
});

test('Should command unknown answer message when does not recognize command', async (t) => {
    const app = createServer();
    const msg = 'Hello how are you?';
    const expectedMsg = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'";

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: msg }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expectedMsg)
});