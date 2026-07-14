// ==============================
// UI ELEMENTS
// ==============================

const playerList = document.getElementById("playerList");
const opponentsList = document.getElementById("opponentsList");

const activeTurnName = document.getElementById("activeTurnName");
const playDirectionText = document.getElementById("playDirectionText");
const currentColorText = document.getElementById("currentColorText");

const deckCountText = document.getElementById("deckCountText");
const topCardDisplay = document.getElementById("topCardDisplay");

const playerHand = document.getElementById("playerHand");
const handCountText = document.getElementById("handCountText");

const drawButton = document.getElementById("drawButton");

const wildOverlay = document.getElementById("wildOverlay");
const wildButtons = document.querySelectorAll(".wild-choice");

let pendingWildIndex = null;
let pendingWildDraw4 = false;

let myTurn = false;


// ==============================
// SCREEN SWITCHER
// ==============================

function showScreen(screenId) {

    joinScreen.classList.add("hidden");
    lobbyScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    if (screenId === "join") {
        joinScreen.classList.remove("hidden");
    }

    if (screenId === "lobby") {
        lobbyScreen.classList.remove("hidden");
    }

    if (screenId === "game") {
        gameScreen.classList.remove("hidden");
    }

}


// ==============================
// CARD HTML
// ==============================

function createCardHTML(card) {

    if (!card) {

        return `<div class="card-placeholder">Empty</div>`;

    }

    let displayValue = card.value;

    switch (card.value) {

        case "skip":
            displayValue = "⊘";
            break;

        case "reverse":
            displayValue = "⇄";
            break;

        case "draw2":
            displayValue = "+2";
            break;

        case "wild":
            displayValue = "★";
            break;

        case "draw4":
            displayValue = "+4";
            break;

    }

    const isWild = card.color === null;

    return `

    <div class="card ${card.color ?? "wild"}">

        <div class="corner top-left">
            ${displayValue}
        </div>

        <div class="${isWild ? "card-inner wild-inner" : "card-inner"}">

            ${
                isWild
                    ? ""
                    : `<span class="center-text">${displayValue}</span>`
            }

        </div>

        <div class="corner bottom-right">
            ${displayValue}
        </div>

    </div>

    `;

}


// ==============================
// PLAYER LIST
// ==============================

socket.on("playerList", (players) => {

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


// ==============================
// HOST
// ==============================

socket.on("host", () => {

    startButton.classList.remove("hidden");

});


// ==============================
// GAME STATE
// ==============================

socket.on("gameState", (state) => {

    if (!state.started) {

        showScreen("lobby");

        return;

    }

    showScreen("game");

    const activePlayer = state.players.find(

        p => p.isCurrent

    );

    myTurn = false;

    if (activePlayer) {

        myTurn = activePlayer.id === socket.id;

        activeTurnName.textContent = myTurn

            ? "YOUR TURN"

            : `${activePlayer.name}'s Turn`;

    } else {

        activeTurnName.textContent = "-";

    }

    playDirectionText.textContent =

        state.direction === 1

            ? "Clockwise"

            : "Counter Clockwise";
    if (currentColorText) {

        currentColorText.textContent =
            state.currentColor
                ? state.currentColor.toUpperCase()
                : "None";

    }



    // ==========================
    // SIDEBAR
    // ==========================

    opponentsList.innerHTML = "";

    state.players.forEach(player => {

        const div = document.createElement("div");

        div.className = "opponent-item";

        if (player.isCurrent) {

            div.classList.add("active-turn");

        }

        const you =

            player.id === socket.id

                ? " (You)"

                : "";

        div.innerHTML = `

        <span class="opp-name">

            ${player.name}${you}

        </span>

        <span class="opp-cards">

            ${player.cardCount} cards

        </span>

        `;

        opponentsList.appendChild(div);

    });



    // ==========================
    // TOP CARD
    // ==========================

    deckCountText.textContent = state.deckCount;

    topCardDisplay.innerHTML =

        createCardHTML(state.topCard);



    // ==========================
    // HAND
    // ==========================

    playerHand.innerHTML = "";

    handCountText.textContent = state.hand.length;

    state.hand.forEach((card, index) => {

        const wrapper = document.createElement("div");

        wrapper.innerHTML = createCardHTML(card);

        const element = wrapper.firstElementChild;

        if (myTurn) {

            element.style.cursor = "pointer";

            element.addEventListener("click", () => {

    if (
        card.value === "wild" ||
        card.value === "draw4"
    ) {

        pendingWildIndex = index;

        pendingWildDraw4 =
            card.value === "draw4";

        wildOverlay.classList.remove("hidden");

        return;

    }   

    // Every other card

    socket.emit("playCard", {

        cardIndex: index

    });

});
        } else {

            element.style.opacity = "0.6";

            element.style.cursor = "default";

        }

        playerHand.appendChild(element);

    });

    if (drawButton) {

        drawButton.disabled = !myTurn;

    }

});
// ==============================
// GAME RESET
// ==============================

socket.on("gameReset", (data) => {

    alert(data.message);

    wildOverlay.classList.add("hidden");

    pendingWildIndex = null;

    showScreen("lobby");

    playerHand.innerHTML = "";

    opponentsList.innerHTML = "";

    topCardDisplay.innerHTML = "";

    deckCountText.textContent = "-";

    handCountText.textContent = "0";

    activeTurnName.textContent = "-";

    currentColorText.textContent = "None";

});


// ==============================
// GAME OVER
// ==============================

socket.on("gameOver", (data) => {

    alert(`${data.winner} wins the game!`);

    playerHand.innerHTML = "";

    opponentsList.innerHTML = "";

    wildOverlay.classList.add("hidden");

    pendingWildIndex = null;

    showScreen("lobby");

    currentColorText.textContent = "None";

});


// ==============================
// ACTION ERROR
// ==============================

socket.on("actionError", (message) => {

    alert(message);

});


// ==============================
// JOIN ERROR
// ==============================

socket.on("joinError", (message) => {

    alert(message);

});


// ==============================
// START ERROR
// ==============================

socket.on("startError", (message) => {

    alert(message);

});


// ==============================
// CONNECTION EVENTS
// ==============================

socket.on("connect", () => {

    console.log("Connected:", socket.id);

});


socket.on("disconnect", () => {

    wildOverlay.classList.add("hidden");
    pendingWildIndex = null;
    alert("Disconnected from server.");

});


socket.on("connect_error", (err) => {

    console.error(err);

});


// ==============================
// DRAW BUTTON
// ==============================

if (drawButton) {

    drawButton.addEventListener("click", () => {

        if (!myTurn) {

            return;

        }

        socket.emit("drawCard");

    });

}

wildButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (pendingWildIndex === null) {
            return;
        }

        socket.emit("playCard", {

            cardIndex: pendingWildIndex,

            chosenColor: button.dataset.color

        });

        pendingWildIndex = null;

        pendingWildDraw4 = false;

        wildOverlay.classList.add("hidden");

    });

});


// ==============================
// HELPER
// ==============================

function clearGameBoard() {

    playerHand.innerHTML = "";

    opponentsList.innerHTML = "";

    topCardDisplay.innerHTML = "";

    deckCountText.textContent = "-";

    handCountText.textContent = "0";

    activeTurnName.textContent = "-";

    currentColorText.textContent = "None";

}


// ==============================
// FUTURE PLACEHOLDERS
// ==============================

// Future:
// socket.on("chooseWildColor", ...)
//
// socket.on("unoWarning", ...)
//
// socket.on("playerSkipped", ...)
//
// socket.on("playerDrewCards", ...)
//
// socket.on("winnerAnimation", ...)