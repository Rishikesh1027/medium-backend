global.WebSocket = require("ws");

const express = require("express");
const { neon } = require("@neondatabase/serverless");
const cors = require("cors");
require("dotenv").config();
const webpush = require("web-push");
const authRoute = require("./routes/authRoutes.js");
const blogRoute = require("./routes/blogRoutes.js");
const commentRoute = require("./routes/commentRoutes.js");
const libraryRoute = require("./routes/libraryRoutes.js");
const creditRoute = require("./routes/creditRoutes.js");
const messageRoute = require("./routes/messageRoute.js");
const followerRoute=require("./routes/followerRoute.js");
const NotificationRoute=require("./routes/notificationRoute.js");
const bloginsightRoute=require("./routes/blogInsightRoutes.js");
const searchRote=require("./routes/searchRoute.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const sql = neon(`${process.env.DATABASE_URL}`);

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`${socket.id} user connected!`);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data); 
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Store io in app locals for controllers to use
app.locals.io = io;

// Routes
app.get("/", async (_, res) => {
  try {
    const response = await sql`SELECT version()`;
    res.json({ version: response[0].version });
  } catch (error) {
    console.error("Database Connection Error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/auth", authRoute);
app.use("/blog", blogRoute);
app.use("/comment", commentRoute);
app.use("/library", libraryRoute);
app.use("/credit", creditRoute);
app.use("/message", messageRoute);
app.use("/follower",followerRoute);
app.use("/notification",NotificationRoute);
app.use("/insight",bloginsightRoute);
app.use("/",searchRote);
  
// Start Server
http.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server startup error:", err);
});
