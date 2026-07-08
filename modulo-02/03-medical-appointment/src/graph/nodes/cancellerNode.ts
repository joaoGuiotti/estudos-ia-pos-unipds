import { z } from 'zod/v3';
import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';

const cancelRequiredFieldsSchema = z.object({
  professionalId: z.number({ required_error: 'Professional ID is required' }),
  datetime: z.string({ required_error: 'Appointment datetime is required' }),
  patientName: z.string({ required_error: 'Patient name is required' }),
});

export function createCancellerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<GraphState> => {
    console.log(`❌ Cancelling appointment...`);

    try {
      const validation = cancelRequiredFieldsSchema.safeParse(state);

      if (!validation.success) {
        const errorMessages = validation.error.errors.map((error) => error.message).join(', ');

        console.log(`❌ Cancellation failed: ${errorMessages}`);

        return {
          ...state,
          actionSuccess: false,
          actionError: errorMessages,
        };
      }

      const { datetime, professionalId, patientName } = validation.data;

      appointmentService.cancelAppointment(
        professionalId,
        patientName,
        new Date(datetime)
      );

      return {
        ...state,
        actionSuccess: true,
      };
    } catch (error) {
      console.log(`❌ Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  };
}
