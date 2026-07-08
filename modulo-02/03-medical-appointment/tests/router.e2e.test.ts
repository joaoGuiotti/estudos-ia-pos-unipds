import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createServer } from '../src/server.ts';
import { professionals } from '../src/services/appointmentService.ts';

const app = createServer();

async function makeARequest(question: string) {
    return await app.inject({
        method: 'POST',
        url: '/chat',
        payload: {
            question,
        },
    });
}

const getAIMessageContent = (body: any) => {
    const messages = body.messages;
    if (!messages || !messages.length) return undefined;
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.kwargs?.content || lastMessage?.content || lastMessage?.text || undefined;
};

describe('Medical Appointment System - E2E Tests', async () => {
    // Helper to generate expected dynamic dates
    const today = new Date();
    
    const todayAt14 = new Date(today);
    todayAt14.setUTCHours(14, 0, 0, 0);

    const tomorrowAt16 = new Date(today);
    tomorrowAt16.setDate(today.getDate() + 1);
    tomorrowAt16.setUTCHours(16, 0, 0, 0);

    const tomorrowAt14 = new Date(today);
    tomorrowAt14.setDate(today.getDate() + 1);
    tomorrowAt14.setUTCHours(14, 0, 0, 0);

    it('Schedule appointment - Success', async () => {
        const response = await makeARequest(
            `Olá, sou Maria Santos e quero agendar uma consulta com ${professionals.at(0)?.name} para amanhã às 16h para um check-up regular`
        )
        assert.equal(response.statusCode, 200);
        const body = JSON.parse(response.body);
        assert.equal(body.intent, 'schedule');
        assert.equal(body.actionSuccess, true);
        assert.notDeepStrictEqual(body.appointmentData, undefined);
        assert.equal(body.appointmentData.patientName, 'Maria Santos');
        assert.equal(body.appointmentData.date, tomorrowAt16.toISOString());
        assert.ok(getAIMessageContent(body), 'Should have a response message');
    });

    it('Schedule appointment - Error (Time already booked)', async () => {
        // Luana Costa already has an appointment tomorrow at 14h with Dra. Ana Pereira (id: 2)
        const response = await makeARequest(
            `Quero agendar uma consulta com ${professionals.at(1)?.name} para amanhã às 14h, me chamo Pedro Alves.`
        )
        assert.equal(response.statusCode, 200);
        const body = JSON.parse(response.body);
        assert.equal(body.intent, 'schedule');
        assert.equal(body.actionSuccess, false);
        assert.equal(body.actionError, 'Horário indisponível para este profissional');
        assert.ok(getAIMessageContent(body), 'Should have a response message for the error');
    });

    it('Cancel appointment - Success', async () => {
        // Schedule an appointment first
        await makeARequest(
            `Sou Joao da Silva e quero agendar uma consulta com ${professionals.at(1)?.name} para hoje às 14h`
        );

        // Cancel it
        const response = await makeARequest(
            `Cancele minha consulta com ${professionals.at(1)?.name} que tenho hoje às 14h, me chamo Joao da Silva`
        );

        assert.equal(response.statusCode, 200);
        const body = JSON.parse(response.body);
        assert.equal(body.intent, 'cancel');
        assert.equal(body.actionSuccess, true);
        assert.ok(getAIMessageContent(body), 'Should have a response message for cancellation');
    });

    it('Cancel appointment - Error (Not found)', async () => {
        const response = await makeARequest(
            `Cancele minha consulta com ${professionals.at(2)?.name} que tenho amanhã às 10h, me chamo Carlos Silva`
        );

        assert.equal(response.statusCode, 200);
        const body = JSON.parse(response.body);
        assert.equal(body.intent, 'cancel');
        assert.equal(body.actionSuccess, false);
        assert.equal(body.actionError, 'Agendamento não encontrado para cancelamento');
        assert.ok(getAIMessageContent(body), 'Should have an error message');
    });

    it('Unknown intent', async () => {
        const response = await makeARequest(
            `Qual a previsão do tempo para amanhã?`
        );

        assert.equal(response.statusCode, 200);
        const body = JSON.parse(response.body);
        assert.equal(body.intent, 'unknown');
        assert.equal(body.actionSuccess, undefined);
        assert.ok(getAIMessageContent(body), 'Should have a fallback response message');
    });
});
