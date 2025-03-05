require("dotenv").config();
const { Client } = require("@neondatabase/serverless");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});

async function createComment(req, res) {
  const { blog_id, user_id, message } = req.body;
  try {
    const response = await client.query(
      `INSERT INTO comments (blog_id,user_id,message) VALUES($1,$2,$3) RETURNING *`,
      [blog_id, user_id, message]
    );
    return res.status(201).json(response.rows[0]);
  } catch (err) {
    return res.status(500).json({ Error: err });
  }
}

async function deleteComment(req, res) {
  const { comment_id } = req.params;
  try {
    
    const response = await client.query(
        `DELETE FROM comments WHERE  comment_id=$1`,
        [comment_id]
      );
    return res.json(response)
    // return res.json(
    //   response.rowCount === 0
    //     ? "Something went wrong"
    //     : "Comment deleted!"
    // );
    // res.status(200).json({message:"comment deleted!"});
  } catch (err) {
    res.status(500).json(err);
  }
}

async function fetchComments(req, res) {
  const { blog_id } = req.body;
  try {
    const response =await client.query(
      `SELECT 
    c.message, 
    c.comment_date, 
    u.fullname, 
    u.profile,
    u.user_id,
    u.profile,
    c.comment_id
    FROM comments c
    JOIN "user" u ON c.user_id = u.user_id where blog_id=$1`,
      [blog_id]
    );
    res.status(200).json(response.rows);
  } catch (err) {
    res.status(500).json({ Error: err });
  }
}
async function updateComment(req,res) {
    const {comment_id,message}=req.body;
    try{
        const response=await client.query(
            `update comments set message=$1 where comment_id=$2`,[message,comment_id]
        );
        res.status(200).json(response);
    }catch(err){
        res.status(500).json({Error:err});
    }
}

module.exports = { createComment, deleteComment, fetchComments,updateComment };
