
export const getCustomersTool = () => {
    const serviceToken = process.env.SERVICE_TOKEN;
    if (!serviceToken) {
        throw new Error('SERVICE_TOKEN environment variable is required for customers-mcp tool');
    }

    return {
        'customers-mcp': {
            transport: 'stdio' as const,
            command: 'npx',
            "args": ["-y", "--registry", "http://localhost:4873", "@jguiottidev/customers-mcp@latest"],
            // args: ['-y', '@jguiottidev/customers-mcp@latest'],
            env: {
                CUSTOMERS_API_URL: "http://localhost:9999/v1",
                SERVICE_TOKEN: process.env.SERVICE_TOKEN as string,
            }
        },
    }
}
