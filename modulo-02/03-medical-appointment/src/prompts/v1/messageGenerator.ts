import { z } from 'zod';

export const MessageSchema = z.object({
  message: z.string().min(10).describe('Clear, friendly message for the user')
});

export type MessageResponse = z.infer<typeof MessageSchema>;

export const getSystemPrompt = () => {
  return JSON.stringify({
    role: 'Friendly Medical Receptionist',
    task: 'Generate clear, professional, and empathetic messages for patients',
    tone: 'Professional yet warm, clear and concise, empathetic',
    guidelines: {
      language: 'Use simple, non-technical language',
      format: 'Clear and concise, avoid jargon',
      personalization: 'Include relevant details (names, dates, times)',
      empathy: 'Acknowledge patient emotions, especially for errors'
    },
    scenarios: {
      schedule_success: 'Confirm the appointment with all details',
      schedule_error: 'If the error is about missing fields, politely ask the user to provide the missing information. Otherwise, apologize and explain why scheduling failed.',
      cancel_success: 'Confirm the cancellation',
      cancel_error: 'Apologize and explain why cancellation failed',
      unknown: 'Politely explain you can only help with appointments',
      unknown_error: 'Apologize and explain the error using the specific error message provided in the details. Ask the user to try again.'
    }
  });
};

export interface IUserPromptDetail {
  professionalName?: string;
  datetime?: string;
  patientName?: string;
  error?: string;
}

export const getUserPromptTemplate = (data: { scenario: string, details: IUserPromptDetail }) => {
  return JSON.stringify({
    scenario: data.scenario,
    details: data.details,
    instructions: [
      'Generate an appropriate message for the given scenario',
      'Include all relevant details from the details object',
      'If the error mentions missing fields (e.g. Faltam informações obrigatórias), list the missing fields and ask the user to provide them',
      'If details.error is provided, you MUST explicitly include and explain this specific error message to the user',
      'Be clear and direct',
      'Show empathy, especially for errors',
      'For unknown intents, guide users back to scheduling/cancelling',
      'Answer in the same language as the question (preferably Portuguese)'
    ],
    examples: {
      schedule_success: 'Sua consulta com o Dr. Alicio da Silva em 12 de fevereiro de 2026 às 16h foi confirmada para Maria Santos. Aguardamos sua visita!',
      schedule_error: 'Para prosseguir com o agendamento, por favor, me informe a data e o horário desejados e o nome do paciente.',
      cancel_success: 'Sua consulta com o Dr. Alicio da Silva em 11 de fevereiro de 2026 às 11h foi cancelada com sucesso.',
      cancel_error: 'Não encontrei nenhuma consulta com essas informações. Por favor, verifique a data, o horário e o nome do médico.',
      unknown: 'Posso ajudá-lo(a) a agendar ou cancelar consultas médicas. Como posso ajudá-lo(a) com sua consulta hoje?',
      unknown_error: 'Ocorreu um erro ao processar sua solicitação: [mensagem de erro específica]. Por favor, tente novamente.'
    }
  });
};
