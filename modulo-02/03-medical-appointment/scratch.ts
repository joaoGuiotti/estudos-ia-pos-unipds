import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

async function run() {
    const llmClient = new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        modelName: 'openai/gpt-4o-mini',
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
        modelKwargs: {
        }
    });

    const structuredLlm = llmClient.withStructuredOutput(z.object({ greeting: z.string() }));
    
    try {
        const response = await structuredLlm.invoke([
            new SystemMessage("You are a helpful assistant."),
            new HumanMessage("Say hello")
        ]);
        console.log("Success:", response);
    } catch (e: any) {
        console.error("Failed:", e.message);
        console.error(e);
    }
}
run();
