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

const room = new Room();

function broadcastGameState() {
    room.players.forEach(player => {
        const sanitizedState = {
            started: room.started,
            currentPlayer: room.currentPlayer,
            direction: room.direction,
            topCard: room.discardPile.length > 0 ? room.discardPile[room.discardPile.length - 1] : null,
            deckCount: room.deck.length,
            hand: player.hand,
            players: room.players.map((p, idx) => ({
                id: p.id,
                name: p.name,
                cardCount: p.hand.length,
                isCurrent: idx === room.currentPlayer
            }))
        };
        io.to(player.id).emit("gameState", sanitizedState);
    });
}

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join", (data) => {
        // Fix duplicate joins by socket ID
        if (room.players.some(p => p.id === socket.id)) {
            console.log("Socket already in room:", socket.id);
            return;
        }

        // Do not allow joining an active game
        if (room.started) {
            socket.emit("joinError", "Game has already started.");
            return;
        }

        const name = data.name ? data.name.trim() : "Player";
        const player = {
            id: socket.id,
            name: name,
            hand: []
        };

        room.players.push(player);

        // Broadcast player list
        io.emit("playerList", room.players.map(p => ({ id: p.id, name: p.name })));

        // If first player, designate as host
        if (room.players.length === 1) {
            socket.emit("host");
        } else {
            // Let the first player be informed they are the host (for safety)
            io.to(room.players[0].id).emit("host");
        }

        console.log("Player joined:", player.name, "Total players:", room.players.length);
    });

    socket.on("startGame", () => {
        // Authorization: Only the host can start the game
        if (room.players.length === 0 || room.players[0].id !== socket.id) {
            console.log("Unauthorized startGame attempt by", socket.id);
            return;
        }

        if (room.players.length < 2) {
            socket.emit("startError", "Need at least 2 players to start.");
            console.log("Need at least 2 players to start.");
            return;
        }

        startGame(room);

        console.log("\n========== GAME START ==========\n");
        room.players.forEach(player => {
            console.log(`${player.name}'s Hand:`);
            console.table(player.hand);
        });
        console.log("Top Card:", room.discardPile[room.discardPile.length - 1]);
        console.log("Cards Remaining:", room.deck.length);

        // Broadcast sanitized state to all players
        broadcastGameState();
    });

    socket.on("disconnect", () => {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            const removedPlayer = room.players[index];
            room.players.splice(index, 1);

            console.log("Player disconnected:", removedPlayer.name, socket.id);

            if (room.started) {
                // If game in progress, reset and return to lobby
                room.started = false;
                room.deck = [];
                room.discardPile = [];
                room.players.forEach(p => p.hand = []);
                
                io.emit("gameReset", { message: `${removedPlayer.name} disconnected. Game has been reset.` });
            }

            // Broadcast updated player list
            io.emit("playerList", room.players.map(p => ({ id: p.id, name: p.name })));

            // Host migration: if any player left, make the first one the host
            if (room.players.length > 0) {
                io.to(room.players[0].id).emit("host");
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
