require('dotenv').config();
const { Client } = require('@neondatabase/serverless');

const client = new Client({
  connectionString: process.env.DATABASE_URL,  
});
client.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
});


async function sendNotification(req,res) {
    const {user_id}=req.params;
    try {
       const response= await client.query(
            `update notification set "isRead" = 'true' where receivers_id =$1 `,[user_id]
        )
        res.status(200).json(response.rowCount)
    } catch (error) {
        res.status(500).json({error:error})
    }
}

async function fetchNotification(req,res) {
  const {user_id}=req.params;
  try {
    const response =await client.query(
      `SELECT message FROM notification WHERE "isRead" = FALSE AND receivers_id = $1`,[user_id]
    )
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({error});
  }
}

module.exports={sendNotification,fetchNotification}
