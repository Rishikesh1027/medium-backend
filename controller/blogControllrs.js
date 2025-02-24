require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Optional: Connect explicitly if needed
client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function writeBlog(req, res) {
  const { user_id, title, story } = req.body;
  try {
    const result = await client.query(
      `INSERT INTO blog (user_id, title, story) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, title, story]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
}
async function editblog(req, res) {
  const { blog_id, title, story } = req.body;
  try {
    const response = await client.query(
      `UPDATE "blog" set title=$1,story=$2 WHERE blog_id=$3`,
      [title, story, blog_id]
    );
    res.status(200).json({ message: "Blog updated successfully" });
  } catch (err) {
    res.status(500).json({ Error: err });
  }
}
async function fetchblogById(req, res) {
  const { user_id } = req.params;
  try {
    const response = await client.query(
      `SELECT * FROM "blog" where user_id=$1`,
      [user_id]
    );
    res.status(200).json(response.rows);
  } catch (err) {
    res.status(500).json({ Error: err });
  }
}
async function fetchAllBlogs(req, res) {
  try {
    const response = await client.query(
      // `SELECT blog.*, "user".fullname FROM blog JOIN "user" ON blog.user_id = "user".user_id `
      `SELECT 
    blog.*, 
        "user".fullname, "user".profile,
            COUNT(comments.blog_id) AS comment_count 
            FROM blog 
            JOIN "user" ON blog.user_id = "user".user_id 
            LEFT JOIN comments ON blog.blog_id = comments.blog_id 
            GROUP BY blog.blog_id, "user".fullname, "user".profile
            ORDER BY blog.publish_date DESC`
    );
    res.status(200).json(response.rows);
  } catch (err) {
    res.status(500).json({ Error: err });
  }
}
async function updateclap(req, res) {
  const { blog_id } = req.body;

  try {
    // Check if the blog exists and get the current clap count
    const countResult = await client.query(
      `SELECT clap_count FROM blog WHERE blog_id = $1`,
      [blog_id]
    );

    if (countResult.rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let totalClap = parseInt(countResult.rows[0].clap_count) + 1;

    // Update the clap count in the database
    const updateResult = await client.query(
      `UPDATE blog SET clap_count = $1 WHERE blog_id = $2 RETURNING clap_count`,
      [totalClap, blog_id]
    );

    res.status(200).json({ clap_count: updateResult.rows[0].clap_count });
  } catch (err) {
    console.error("Error updating clap count:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { writeBlog, editblog, fetchblogById, updateclap, fetchAllBlogs };
