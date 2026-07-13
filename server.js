const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const {
    createDeck,
    shuffleDeck,
    drawCard
} = require("./game/deck");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = [];

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    socket.on("join", (data) => {

        const player = {
            id: socket.id,
            name: data.name
        };

        players.push(player);

        io.emit("playerList", players);

        if (players.length === 1) {
            socket.emit("host");
        }

        console.log(players);

    });

    socket.on("disconnect", () => {

        players = players.filter(player => player.id !== socket.id);

        io.emit("playerList", players);

        console.log("Disconnected:", socket.id);

    });

});

server.listen(3000, () => {

    console.log("Server running on http://localhost:3000");

});