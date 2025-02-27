require('dotenv').config();
const { Client } = require('@neondatabase/serverless');

const client = new Client({
  connectionString: process.env.DATABASE_URL,  
});

// Optional: Connect explicitly if needed
client.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
});



const pushNotification=(req, res) => {
    const { subscription, title, message } = req.body;
    console.log(req.body);
    const payload = JSON.stringify({ title, message });
    webpush.sendNotification(subscription, payload)
    .catch((err) => console.error("err", err));
    res.status(200).json({ success: true });
    }

    module.exports={pushNotification}