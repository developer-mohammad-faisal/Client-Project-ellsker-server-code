const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const fileUpload = require("express-fileupload");
const socketio = require("socket.io");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const hangoutRoutes = require("./routes/hangoutRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["https://localhost:3000", "http://localhost:3000", "/"],
    Credential: true,
  },
});

//-------------MIDDLEWARE----------
app.use(cors());
app.use(fileUpload());
app.use(express.urlencoded());
app.use(express.json());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//-------------MIDDLEWARE----------

io.on("connection", (socket) => {
  // console.log(socket);
  socket.on("joinRoom", ({ _id, room }) => {
    socket.join(room);
  });
  socket.on("leaveRoom", ({ _id, room }) => {
    socket.leave(room);
  });
  socket.on("chatMessage", (messageObj) => {
    io.to(messageObj.room).emit("message", {
      sender: {
        _id: messageObj._id,
        name: messageObj.name,
        images: messageObj.images,
      },
      content: messageObj.message,
      createdTime: messageObj.time,
    }); //broadcast to all clients
  });
  socket.on("sendNotif", (occasionID) => {
    io.emit("notif", occasionID);
  });
});

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/hangouts", hangoutRoutes);
app.use("/api/admins", adminRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "build")));
  app.get("*", (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log("Server running on port 5000"));
