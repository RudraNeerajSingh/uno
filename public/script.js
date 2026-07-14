// ==============================
// SOCKET
// ==============================

const socket = io();

// ==============================
// SHARED DOM ELEMENTS
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

        socket.emit("drawCard");

    });

}

// ==============================
// CONNECTION EVENTS
// ==============================

socket.on("connect", () => {

    console.log("Connected:", socket.id);

});

socket.on("disconnect", () => {

    console.log("Disconnected from server.");

});