const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

let users = [];

io.on("connection", function(socket) {
    let currentUser = null;

    socket.on("newuser", function(username) {
        currentUser = username;
        users.push(username);
        socket.broadcast.emit("update", `${username} joined the conversation`);
        io.emit("online-users", users.length - 1);
    });

    socket.on("exituser", function(username) {
        users = users.filter(u => u !== username);
        socket.broadcast.emit("update", `${username} left the conversation`);
        io.emit("online-users", users.length - 1);
    });

    socket.on("disconnect", function() {
        if (currentUser) {
            users = users.filter(u => u !== currentUser);
            socket.broadcast.emit("update", `${currentUser} left the conversation`);
            io.emit("online-users", users.length - 1);
        }
    });

    socket.on("chat", function(message) {
        socket.broadcast.emit("chat", message);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
