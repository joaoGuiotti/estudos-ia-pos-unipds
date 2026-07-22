import { z } from 'zod/v3';

export abstract class BaseValidator<T = any> {
    protected translateError(validation: z.SafeParseReturnType<T, any>) {
        const translatedErros = validation.error!.issues
            .map(i => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        return translatedErros;
    }

    validate(state: any) {
        throw new Error("Method 'validate' must be implemented.");
    }
}