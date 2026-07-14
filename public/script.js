// ==============================
// SOCKET
// ==============================

const socket = io();

// ==============================
// DOM ELEMENTS
// ==============================

const joinScreen = document.getElementById("joinScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");

const joinButton = document.getElementById("joinButton");
const startButton = document.getElementById("startButton");
const drawButton = document.getElementById("drawButton");

const nameInput = document.getElementById("nameInput");

// ==============================
// JOIN GAME
// ==============================

joinButton.addEventListener("click", () => {

    const name = nameInput.value.trim();

    if (name.length === 0) {

        alert("Please enter your name.");

        return;

    }

    joinButton.disabled = true;

    socket.emit("join", {
        name
    });

});

// ==============================
// START GAME
// ==============================

startButton.addEventListener("click", () => {

    socket.emit("startGame");

});

// ==============================
// DRAW CARD
// ==============================

if (drawButton) {

    drawButton.addEventListener("click", () => {

        drawButton.disabled = true;

        socket.emit("drawCard");

    });

}

// ==============================
// SERVER EVENTS
// ==============================

socket.on("playerList", () => {

    joinButton.disabled = false;

});

socket.on("joinError", (message) => {

    joinButton.disabled = false;

    alert(message);

});

socket.on("actionError", (message) => {

    if (drawButton) {
        drawButton.disabled = false;
    }

    alert(message);

});

socket.on("gameState", () => {

    if (drawButton) {
        drawButton.disabled = false;
    }

});

socket.on("disconnect", () => {

    joinButton.disabled = false;

    if (drawButton) {
        drawButton.disabled = true;
    }

});