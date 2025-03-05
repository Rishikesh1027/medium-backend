require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function search(req, res) {
  const { title } = req.params;
  const search = `%${title?.toLowerCase()}%`; 

  try {
    const query = `
      SELECT 
        blog.*, 
        "user".fullname, 
        "user".profile,
        COUNT(comments.blog_id) AS comment_count 
      FROM blog  
      JOIN "user" ON blog.user_id = "user".user_id 
      LEFT JOIN comments ON blog.blog_id = comments.blog_id 
      WHERE lower(blog.title) LIKE $1  -- Use parameterized query
      GROUP BY blog.blog_id, "user".fullname, "user".profile
      ORDER BY blog.publish_date DESC
    `;

    const response = await client.query(query, [search]); 
    res.status(200).json(response.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { search };
