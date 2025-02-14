global.WebSocket = require('ws');
const express = require('express');
const { neon } = require('@neondatabase/serverless');
const authRoute = require('./routes/authRoutes.js');
const cors=require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4242;

app.use(express.json());
app.use(cors());
// console.log(process.env.DATABASE_URL);
const sql = neon(`${process.env.DATABASE_URL}`);

app.get('/', async (_, res) => {
  try {
    const response = await sql`SELECT version()`;
    res.json({ version: response[0].version });
  } catch (error) {
    console.error("Database Connection Error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use('/auth', authRoute);

// Start server with error handling
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server startup error:", err);
});
