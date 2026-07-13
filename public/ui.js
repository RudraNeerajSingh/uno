// UI elements local to ui.js
const playerList = document.getElementById("playerList");
const opponentsList = document.getElementById("opponentsList");
const activeTurnName = document.getElementById("activeTurnName");
const playDirectionText = document.getElementById("playDirectionText");
const deckCountText = document.getElementById("deckCountText");
const topCardDisplay = document.getElementById("topCardDisplay");
const playerHand = document.getElementById("playerHand");
const handCountText = document.getElementById("handCountText");

// Helper to transition between screens
function showScreen(screenId) {
    joinScreen.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    if (screenId === "join") joinScreen.classList.remove("hidden");
    if (screenId === "lobby") lobbyScreen.classList.remove("hidden");
    if (screenId === "game") gameScreen.classList.remove("hidden");
}

// Generate beautiful HTML for an UNO card
function createCardHTML(card) {
    if (!card) {
        return `<div class="card-placeholder">Empty</div>`;
    }

    const colorClass = card.color; // red, yellow, green, blue, wild
    const value = card.value;
    let displayValue = value;

    if (value === "skip") displayValue = "⊘";
    else if (value === "reverse") displayValue = "⇄";
    else if (value === "draw2") displayValue = "+2";
    else if (value === "draw4") displayValue = "+4";
    else if (value === "wild") displayValue = "★";

    const isWild = (card.color === "wild");
    const ellipseClass = isWild ? "card-inner wild-inner" : "card-inner";
    const displayContent = isWild ? "" : `<span class="center-text">${displayValue}</span>`;

    return `
        <div class="card ${colorClass}">
            <div class="corner top-left">${displayValue}</div>
            <div class="${ellipseClass}">
                ${displayContent}
            </div>
            <div class="corner bottom-right">${displayValue}</div>
        </div>
    `;
}

// Socket: Update player lobby list
socket.on("playerList", (players) => {
    // Show lobby screen if not already in game
    if (gameScreen.classList.contains("hidden")) {
        showScreen("lobby");
    }

    playerList.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player.name;
        playerList.appendChild(li);
    });
});

// Socket: Designated as host (show start button)
socket.on("host", () => {
    startButton.classList.remove("hidden");
});

// Socket: Receive sanitized game state
socket.on("gameState", (state) => {
    if (state.started) {
        showScreen("game");
    } else {
        showScreen("lobby");
        return;
    }

    // 1. Update Turn and Direction
    const activePlayer = state.players.find(p => p.isCurrent);
    if (activePlayer) {
        const isSelf = activePlayer.id === socket.id;
        activeTurnName.textContent = isSelf ? "YOUR TURN" : activePlayer.name;
    } else {
        activeTurnName.textContent = "-";
    }

    playDirectionText.textContent = state.direction === 1 ? "Clockwise" : "Counter-Clockwise";

    // 2. Update Players & Card counts sidebar
    opponentsList.innerHTML = "";
    state.players.forEach(player => {
        const item = document.createElement("div");
        item.className = "opponent-item";
        if (player.isCurrent) {
            item.classList.add("active-turn");
        }

        const isSelf = player.id === socket.id;
        const displayName = isSelf ? `${player.name} (You)` : player.name;

        item.innerHTML = `
            <span class="opp-name">${displayName}</span>
            <span class="opp-cards">${player.cardCount} cards</span>
        `;
        opponentsList.appendChild(item);
    });

    // 3. Update Draw Deck Count & Discard Pile Top Card
    deckCountText.textContent = state.deckCount;
    topCardDisplay.innerHTML = createCardHTML(state.topCard);

    // 4. Update Your Hand
    playerHand.innerHTML = "";
    handCountText.textContent = state.hand.length;

    state.hand.forEach(card => {
        const cardContainer = document.createElement("div");
        cardContainer.innerHTML = createCardHTML(card);
        playerHand.appendChild(cardContainer.firstElementChild);
    });
});

// Socket: Game reset (disconnect mid-game)
socket.on("gameReset", (data) => {
    alert(data.message);
    showScreen("lobby");
});

// Error handlers
socket.on("joinError", (msg) => {
    alert(msg);
});

socket.on("startError", (msg) => {
    alert(msg);
});
