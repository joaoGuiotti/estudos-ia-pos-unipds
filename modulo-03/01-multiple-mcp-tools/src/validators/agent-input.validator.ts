import { z } from 'zod/v3';
import { BaseValidator } from './common/base.validator.ts';

const AgentInputSchema = z.object({
    intent: z.string().min(1, 'intent must be a non-empty string'),
    fileName: z.string().min(1, 'fileName must be a non-empty string'),
    fileContent: z.string().min(1, 'fileContent must be a non-empty string'),
});

export class AgentValidator extends BaseValidator {
    validate(state: any) {
        const validation = AgentInputSchema.safeParse(state);
        if (!validation.success) {
            const issues = super.translateError(validation);
            throw new Error(`Invalid state for agent node:\n${issues}`);
        }
        return validation;
    }

    static validate(state: any) {
        return new AgentValidator()
            .validate(state);
    }
}