const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A player connected!");

    socket.on("disconnect", () => {
        console.log("A player disconnected!");
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});