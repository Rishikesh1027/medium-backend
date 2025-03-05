require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function handleBlogInsight(req, res) {
  const { blog_id, user_id } = req.body;
  try {
    const response = await client.query(
      `INSERT INTO "blogInsight" (blog_id,user_id) VALUES ($1,$2)`,
      [blog_id, user_id]
    );
    res.status(200).json({ success: "inserted successfully!" });
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function fetchBlogInsight(req, res) {
  const { user_id } = req.params;
  try {

    const response =await client.query(
      `SELECT 
    SUM(read_count) AS count, 
    TO_CHAR(month_name, 'YYYY-MM-DD') AS full_date,  
    TO_CHAR(month_name, 'Month') AS month_name      
FROM "blogInsight" 
WHERE user_id = $1
GROUP BY full_date, month_name
ORDER BY full_date;`,[user_id]
    );
    res.status(200).json(response.rows)
  } catch (error) {
    res.status(500).json(error);
  }
}

  

module.exports = { handleBlogInsight ,fetchBlogInsight};
