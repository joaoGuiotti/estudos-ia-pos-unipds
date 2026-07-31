import { z } from 'zod/v4'

export const CustomerSchema = z.object({
  _id: z.string().optional().describe('MongoDB ObjectId of the customer'),
  name: z.string(),
  phone: z.string(),
})
export type Customer = z.infer<typeof CustomerSchema>

export const CustomerQuerySchema = CustomerSchema.extend({
  name: z.string().optional().describe('Full name of the customer'),
  phone: z.string().optional().describe('Phone number of the customer'),
})
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>

export const CustomerUpdateSchema = CustomerQuerySchema.extend({
  _id: z.string().describe('MongoDB ObjectId of the customer'),
})
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>
