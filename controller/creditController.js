require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function addCredit(req, res) {
  const { user_id, credit } = req.body;

  try {
    const checkUserExists = await client.query(
      `select user_id from credit WHERE user_id = $1`,
      [user_id]
    );
    if(checkUserExists.rowCount===0){
      const result = await client.query(
        `INSERT INTO "credit" (user_id, credit_count) VALUES ($1, $2) RETURNING *`,
        [user_id, credit]

    );
    res.status(201).json(result.rows[0]);
    }
    else{
      const result = await client.query(
        `UPDATE "credit" SET credit_count = credit_count + $1 WHERE user_id = $2 RETURNING *`,
        [credit, user_id]
    );
    res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function fetchCredit(req, res) {
  const { user_id } = req.params;

  try {
    const result = await client.query(
      `SELECT credit_count FROM credit WHERE user_id = $1`,
      [user_id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
  
}

async function deductCredit(req, res) {
  const { user_id } = req.params;
  
  try {
    const result = await client.query(
      `UPDATE "credit" SET credit_count = credit_count - 1 WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { addCredit ,fetchCredit,deductCredit};
// 2d2b1d02-9db3-40dd-a040-65e8e664335b
// 4eca08ae-8ec4-470c-a313-c45823565c1d