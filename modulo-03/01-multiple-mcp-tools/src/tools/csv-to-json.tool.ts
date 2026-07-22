import { tool } from '@langchain/core/tools';
import csvtojson from 'csvtojson';
import { z } from 'zod/v3';

const csvToJsonInputSchema = z.object({
    csvText: z.string().describe('CSV data to be converted to JSON format')
});

export const getCSVtoJSONTool = () => tool(
    async ({ csvText }) => {
        const result = await csvtojson().fromString(csvText);
        console.log(`✅ CSV to JSON conversion: ${result.length} records`);
        return JSON.stringify(result);
    },
    {
        name: 'csv_to_json',
        description: 'Convert CSV to JSON format',
        schema: csvToJsonInputSchema
    }
);