import { z } from 'zod/v3';
import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';

const scheduleRequiredFieldsSchema = z.object({
  professionalId: z.number({ required_error: 'Professional ID is required' }),
  datetime: z.string({ required_error: 'Appointment datetime is required' }),
  patientName: z.string({ required_error: 'Patient name is required' }),
});



export function createSchedulerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`📅 Scheduling appointment...`);

    try {
      const validation = scheduleRequiredFieldsSchema.safeParse(state);

      if (!validation.success) {
        const errorMessages = validation.error.errors.map((error) => error.message).join(', ');

        console.log(`❌ Scheduling failed: ${errorMessages}`);
        return {
          actionSuccess: false,
          actionError: errorMessages,
        };
      }

      console.log(`✅ Appointment scheduled successfully`);

      const { datetime, professionalId, patientName } = validation.data;

      const appointmentData = appointmentService.bookAppointment(
        professionalId,
        new Date(datetime),
        patientName,
        state.reason ?? 'check-up regular',
      );

      return {
        ...state,
        actionSuccess: true,
        appointmentData,
      };
    } catch (error) {
      console.log(`❌ Scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Scheduling failed',
      };
    }
  };
}
