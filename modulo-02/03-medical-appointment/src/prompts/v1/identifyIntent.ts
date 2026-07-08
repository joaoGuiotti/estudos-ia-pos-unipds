import { z } from 'zod';
import { professionals } from '../../services/appointmentService.ts';

export const IntentSchema = z.object({
  intent: z.enum(['schedule', 'cancel', 'unknown']).describe('The user intent'),
  professionalId: z.number().optional().nullable().describe('ID of the medical professional'),
  professionalName: z.string().optional().nullable().describe('Name of the medical professional'),
  datetime: z.string().optional().nullable().describe('Appointment date and time in ISO format'),
  patientName: z.string().optional().nullable().describe('Patient name extracted from question'),
  reason: z.string().optional().nullable().describe('Reason for appointment (for scheduling)'),
});

export type IntentData = z.infer<typeof IntentSchema>;

const tomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setUTCHours(16, 0, 0, 0);
  return tomorrow;
}

const todayDate = () => {
  const today = new Date();
  today.setUTCHours(11, 0, 0, 0);
  return today;
}

export const getSystemPrompt = () => {
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
      professionalId: 'Match the professional name mentioned in the question to the ID from the professionals list. Use fuzzy matching.',
      professionalName: 'Extract the professional name as mentioned by the user',
      datetime: 'Parse relative dates (today, tomorrow) and times. Convert to ISO format. Use current_date as reference.',
      patientName: 'Extract the patient name from the question or context',
      reason: 'Extract the reason/purpose for the appointment (only for scheduling)'
    },
    examples: [
      {
        input: 'I want to schedule with Dr. Alicio da Silva for tomorrow at 4pm for a check-up',
        output: { intent: 'schedule', professionalId: 1, professionalName: 'Dr. Alicio da Silva', datetime: tomorrowDate().toISOString(), reason: 'check-up' }
      },
      {
        input: 'Cancel my appointment with Dr. Ana Pereira today at 11am',
        output: { intent: 'cancel', professionalId: 2, professionalName: 'Dr. Ana Pereira', datetime: todayDate().toISOString() }
      },
      {
        input: 'What is the weather today?',
        output: { intent: 'unknown' }
      }
    ]
  });
};

export const getUserPromptTemplate = (input: string) => {
  return JSON.stringify({ input });
};
