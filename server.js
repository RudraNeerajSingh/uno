const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const Room = require("./game/room");

const {
    startGame
} = require("./game/gameManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = [];

let room = new Room();

io.on("connection", (socket) => {

    console.log("Connected:", socket.id);

    socket.on("join", (data) => {

        const player = {
            id: socket.id,
            name: data.name
        };

        players.push(player);

        room.players = players;

        io.emit("playerList", players);

        if (players.length === 1) {
            socket.emit("host");
        }

        console.log(players);

    });

    socket.on("startGame", () => {

        if (players.length < 2) {

            console.log("Need at least 2 players to start.");

            return;

        }

        startGame(room);

        console.log("\n========== GAME START ==========\n");

        room.players.forEach(player => {

            console.log(`${player.name}'s Hand:`);

            console.table(player.hand);

        });

        console.log("Top Card:");

        console.table([room.discardPile[0]]);

        console.log("Cards Remaining:", room.deck.length);

    });

    socket.on("disconnect", () => {

        players = players.filter(player => player.id !== socket.id);

        room.players = players;

        io.emit("playerList", players);

        console.log("Disconnected:", socket.id);

    });

});

server.listen(3000, () => {

    console.log("Server running on http://localhost:3000");

});