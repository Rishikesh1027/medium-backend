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
  const { user_id, title, story,blog_image } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO blog (user_id, title, story,blog_image) VALUES ($1, $2, $3,$4) RETURNING *`,
      [user_id, title, story,blog_image]
    );

    try {
      await sendNotification(user_id);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Blog creation error:", err);
    res.status(500).json({ error: "Failed to create blog" });
  }
}

async function sendNotification(user_id) {
  console.log("Sending notifications for user:", user_id);

  try {
    // Fetch the full name of the user
    const userResult = await client.query(
      `SELECT fullname FROM "user" WHERE user_id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      console.error("User not found!");
      return;
    }

    const userFullName = userResult.rows[0].fullname;

    // Fetch all followers of the user
    const response = await client.query(
      "SELECT user_id FROM follower WHERE publisher_id = $1",
      [user_id]
    );

    const followers = response.rows.map((follower) => follower.user_id);

    if (followers.length === 0) {
      console.log("No followers found.");
      return;
    }

    // Prepare values array and placeholders for batch insert
    const values = [];
    const placeholders = [];

    followers.forEach((follower, index) => {
      values.push(user_id, follower, `${userFullName} posted a new blog`);
      placeholders.push(
        `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
      );
    });

    const query = `INSERT INTO notification (senders_id, receivers_id, message) VALUES ${placeholders.join(
      ", "
    )}`;
    await client.query(query, values);

    console.log("Notifications sent successfully.");
  } catch (error) {
    console.error("Error sending notifications:", error);
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
    console.log(req.query)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log(`Fetching Page: ${page}, Limit: ${limit}, Offset: ${offset}`); // Debugging

    const response = await client.query(
      `SELECT 
        blog.*, 
        "user".fullname, 
        "user".profile,
        COUNT(comments.blog_id) AS comment_count 
      FROM blog 
      JOIN "user" ON blog.user_id = "user".user_id 
      LEFT JOIN comments ON blog.blog_id = comments.blog_id 
      GROUP BY blog.blog_id, "user".fullname, "user".profile
      ORDER BY blog.publish_date DESC
      LIMIT $1 OFFSET $2`, 
      [limit, offset]
    );

    console.log("Returned Blogs:", response.rows.length); // Debugging
    res.status(200).json(response.rows);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ Error: err.message });
  }
}




async function updateclap(req, res) {
  const { blog_id } = req.body;
  console.log(blog_id);

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

module.exports = {
  writeBlog,
  editblog,
  fetchblogById,
  updateclap,
  fetchAllBlogs,
  sendNotification
};
