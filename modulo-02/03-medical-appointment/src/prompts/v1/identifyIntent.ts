import { z } from 'zod';

export const IntentSchema = z.object({
  intent: z.enum(['schedule', 'cancel', 'unknown']).describe('The user intent'),
  professionalId: z.number().optional().nullable().describe('ID of the medical professional'),
  professionalName: z.string().optional().nullable().describe('Name of the medical professional'),
  datetime: z.string().optional().nullable().describe('Appointment date and time in ISO format'),
  patientName: z.string().optional().nullable().describe('Patient name extracted from question'),
  reason: z.string().optional().nullable().describe('Reason for appointment (for scheduling)'),
});

export type IntentData = z.infer<typeof IntentSchema>;

export const getSystemPrompt = (professionals: any[]) => {
  return JSON.stringify({
    role: 'Intent Classifier for Medical Appointments',
    task: 'Identify user intent and extract all appointment-related details',
    professionals: professionals.map(p => ({ id: p.id, name: p.name, specialty: p.specialty })),
    current_date: new Date().toISOString(),
    rules: {
      schedule: {
        description: 'User wants to book/schedule a new appointment',
        keywords: ['schedule', 'book', 'appointment', 'I want to', 'make an appointment'],
        required_fields: ['professionalId', 'datetime', 'patientName'],
        optional_fields: ['reason']
      },
      cancel: {
        description: 'User wants to cancel an existing appointment',
        keywords: ['cancel', 'remove', 'delete', 'cancel my appointment'],
        required_fields: ['professionalId', 'datetime', 'patientName']
      },
      unknown: {
        description: 'Anything not related to scheduling or cancelling appointments',
        examples: ['weather questions', 'general info', 'unrelated queries']
      }
    },
    extraction_instructions: {
      professionalId: 'Match the professional name mentioned to the ID from the professionals list. Use fuzzy matching. If not mentioned, omit this field.',
      professionalName: 'Extract the professional name as mentioned by the user. If not mentioned, omit this field.',
      datetime: 'Parse relative dates (today, tomorrow) and times. Convert to ISO format. Use current_date as reference. If not mentioned, omit this field.',
      patientName: 'Extract the patient name from the question or context. If not mentioned, omit this field.',
      reason: 'Extract the reason/purpose for the appointment (only for scheduling). If not mentioned, omit this field.'
    },
    examples: [
      {
        input: 'human: I want to schedule with Dr. Alicio da Silva for tomorrow at 4pm for a check-up',
        output: { intent: 'schedule', professionalId: 1, professionalName: 'Dr. Alicio da Silva', datetime: '2026-02-12T16:00:00.000Z', reason: 'check-up' }
      },
      {
        input: 'human: Cancel my appointment with Dr. Ana Pereira today at 11am',
        output: { intent: 'cancel', professionalId: 2, professionalName: 'Dr. Ana Pereira', datetime: '2026-02-11T11:00:00.000Z' }
      },
      {
        input: 'human: What is the weather today?',
        output: { intent: 'unknown' }
      },
      {
        input: 'human: I want to schedule an appointment\nai: Sure, I can help with that. What is the patient name, date and doctor?\nhuman: Paciente José',
        output: { intent: 'schedule', patientName: 'José' }
      }
    ]
  });
};

export const getUserPromptTemplate = (conversationHistory: string) => {
  return JSON.stringify({
    conversationHistory,
    instructions: [
      'Carefully analyze the conversation history to determine the user intent',
      'If the user is answering a question to provide missing info (like patient name), maintain the intent of the conversation (e.g. schedule or cancel)',
      'Extract all relevant appointment details mentioned in the latest message, combining with context if necessary',
      'Convert dates and times to ISO format',
      'Match professional names to their IDs',
      'Return only the fields that are clearly present or implied'
    ]
  });
};