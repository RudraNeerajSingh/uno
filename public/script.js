// Initialize socket
const socket = io();

// Shared DOM Elements
const joinScreen = document.getElementById("joinScreen");
const lobbyScreen = document.getElementById("lobbyScreen");
const gameScreen = document.getElementById("gameScreen");

const joinButton = document.getElementById("joinButton");
const startButton = document.getElementById("startButton");
const nameInput = document.getElementById("nameInput");

// Join event handler
joinButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name.length === 0) {
        alert("Please enter your name.");
        return;
    }
    socket.emit("join", { name });
});

// Start game event handler
startButton.addEventListener("click", () => {
    socket.emit("startGame");
});
