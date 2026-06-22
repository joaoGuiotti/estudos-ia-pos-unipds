const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`\n  🤖  Web AI Chat`);
    console.log(`  ➜  http://localhost:${PORT}\n`);
});
