const { Client } = require("@neondatabase/serverless");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("Failed to connect to the database:", err);
});


async function addMessage(req, res) {
  const { senders_id, receivers_id, message } = req.body;
  try {
    const response = await client.query(
      `INSERT INTO chats (senders_id, receivers_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [senders_id, receivers_id, message]
    );

    const newMessage = response.rows[0];

    try {
      await sendNotification(senders_id, receivers_id, message);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }


    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function sendNotification(senders_id, receivers_id, message) {
  try {
    const userResult = await client.query(
      `SELECT fullname FROM "user" WHERE user_id = $1`,
      [senders_id]
    );

    if (userResult.rows.length === 0) {
      console.error("Sender not found!");
      return;
    }

    const senderFullName = userResult.rows[0].fullname;

    await client.query(
      `INSERT INTO notification (senders_id, receivers_id, message) VALUES ($1, $2, $3)`,
      [senders_id, receivers_id, `${senderFullName}: sent you a message`]
    );

  } catch (error) {
    console.error("Error sending notification:", error);
  }
}


async function getChatUsers(req, res) {
  const { user_id } = req.params;
  try {
    const response = await client.query(
      `SELECT DISTINCT
      CASE
      WHEN c.senders_id = $1 THEN c.receivers_id
      ELSE c.senders_id
      END AS chat_partner_id,
      u.fullname AS chat_partner_name,
      u.profile  AS chat_partner_profile
      FROM chats c
      JOIN "user" u
      ON CASE
      WHEN c.senders_id = $1 THEN c.receivers_id
      ELSE c.senders_id
      END = u.user_id
      WHERE c.senders_id = $1
      OR c.receivers_id = $1`,
      [user_id]
    );
    const chatUsers = response.rows;
    res.status(200).json(chatUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getMessages(req, res) {
  const { currentUserId, chatPartnerId} = req.params;
  try {
    const response = await client.query(
      `SELECT
    c.message_id,
    c.senders_id,
    s.fullname  AS sender_name,
    s.profile   AS sender_profile,
    c.receivers_id,
    r.fullname  AS receiver_name,
    r.profile   AS receiver_profile,
    c.message,
    c.chat_time
    FROM chats c
    JOIN "user" s ON c.senders_id = s.user_id
    JOIN "user" r ON c.receivers_id = r.user_id
    WHERE (c.senders_id   = $1    AND c.receivers_id = $2)
       OR (c.senders_id   = $2    AND c.receivers_id = $1)
    ORDER BY c.chat_time ASC; `,
      [currentUserId, chatPartnerId]
    );

    const messages = response.rows;

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { addMessage, getMessages, getChatUsers };

