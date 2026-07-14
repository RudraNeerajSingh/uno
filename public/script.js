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
// BASIC CONNECTION EVENTS
// ==============================

socket.on("connect", () => {

    console.log("Connected:", socket.id);

});

socket.on("disconnect", () => {

    console.log("Disconnected from server.");

    joinButton.disabled = false;

});

// ==============================
// BASIC ERROR HANDLING
// ==============================

socket.on("joinError", (message) => {

    joinButton.disabled = false;

    alert(message);

});

socket.on("playerList", () => {

    joinButton.disabled = false;

});