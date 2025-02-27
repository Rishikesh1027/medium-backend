require("dotenv").config();
const { Client } = require("@neondatabase/serverless");
const { assert } = require("console");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function addRemoveFollower(req, res) {
  const { user_id, publisher_id } = req.params;
  try {
    const isExist = await client.query(
      `select * from follower where user_id=$1 and publisher_id=$2`,
      [user_id, publisher_id]
    );
    if (isExist.rowCount !== 0) {
      const removeFollower = await client.query(
        `delete from follower where user_id=$1 and publisher_id=$2`,
        [user_id, publisher_id]
      );
      res.status(200).json({ message: "Unfollowed successfully" });
    }
    if (isExist.rowCount === 0) {
      const response = await client.query(
        `INSERT INTO follower (user_id, publisher_id) VALUES ($1, $2)`,
        [user_id, publisher_id]
      );
      res.status(201).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.log(error);
  }
}

async function findFollower(req, res) {
  const { user_id, publisher_id } = req.params;
  try {
    const user = await client.query(
      `select * from follower where user_id=$1 and publisher_id=$2`,
      [user_id, publisher_id]
    );
    res.status(200).json(user.rowCount);
  } catch (error) {
    res.status(500).json({ Error: error });
  }
}

async function getFollowerBlog(req, res) {
  const { user_id } = req.params;
  try {
    const response = await client.query(
      `SELECT 
    blog.*, 
        "user".fullname, "user".bio, "user".profile,
            COUNT(comments.blog_id) AS comment_count 
            FROM blog 
            JOIN "user" ON blog.user_id = "user".user_id 
            LEFT JOIN comments ON blog.blog_id = comments.blog_id 
            WHERE "user".user_id = $1
            GROUP BY blog.blog_id, "user".fullname, "user".bio, "user".profile
            ORDER BY blog.publish_date DESC`,
      [user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
}
async function getUserBlogById(req, res) {
  const { user_id } = req.params;
  try {
    const response = client.query(
      `
    SELECT 
        blog.*, 
        "user".fullname, "user".profile,
            COUNT(comments.blog_id) AS comment_count 
            FROM blog 
            JOIN "user" ON blog.user_id = "user".user_id 
            LEFT JOIN comments ON blog.blog_id = comments.blog_id 
            WHERE "user".user_id = $1
            GROUP BY blog.blog_id, "user".fullname, "user".profile
            ORDER BY blog.publish_date DESC`,[user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
}

module.exports = { addRemoveFollower, findFollower, getFollowerBlog ,getUserBlogById};
