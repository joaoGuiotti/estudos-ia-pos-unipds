import { readFileSync } from 'fs';
import { createServer } from './server.ts';

process.on('uncaughtException', (err: any) => {
  if (err?.code === 'EPIPE' || err?.syscall === 'write') return;
  console.error('Uncaught Exception:', err);
});

const app = await createServer();

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log(`Server is running on http://0.0.0.0:3000`);

const salesData = readFileSync('./data/sales.csv', 'utf-8');
// const salesData = readFileSync('./data/sales-complete.csv', 'utf-8');

const question = `
Rank the top 5 most sold products:

${salesData}
`

// const question = `
// Here is a CSV file called sales.csv.
// What's the total revenue from this sales data?.

// ${salesData}
// `

app.inject({
  method: 'POST',
  url: '/chat',
  payload: {
    question,
  },
}).then(async response => {
  console.log('Response from /chat:', response.statusCode);
  console.log(response.body);
  // Wait briefly for MCP child processes to flush pending STDIO log messages
  await new Promise((resolve) => setTimeout(resolve, 500));
  await app.close();
  process.exit(0);
}).catch(error => {
  console.error('Error testing /chat endpoint:', error);
  process.exit(1);
});
