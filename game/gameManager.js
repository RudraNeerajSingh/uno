const {
    createDeck,
    shuffleDeck,
    drawCard
} = require("./deck");

const {
    isValidPlay
} = require("./rules");

function startGame(room) {

    room.started = true;
    room.currentPlayer = 0;
    room.direction = 1;

    room.pendingDraw = 0;
    room.pendingDrawType = null;
    room.currentColor = null;

    room.discardPile = [];

    room.deck = createDeck();
    shuffleDeck(room.deck);

    room.players.forEach(player => {

        player.hand = [];

        for (let i = 0; i < 7; i++) {

            player.hand.push(
                drawCard(room.deck)
            );

        }

    });

    // First discard must be a number card

    let firstCard = drawCard(room.deck);

    while (
        firstCard &&
        typeof firstCard.value !== "number"
    ) {

        room.deck.unshift(firstCard);

        shuffleDeck(room.deck);

        firstCard = drawCard(room.deck);

    }

    room.discardPile.push(firstCard);

    return room;

}

function advanceTurn(room, steps = 1) {

    if (room.players.length === 0) {
        return;
    }

    const totalPlayers = room.players.length;

    room.currentPlayer = (

        room.currentPlayer +

        (room.direction * steps) +

        (totalPlayers * steps)

    ) % totalPlayers;

}

function reshuffleDeck(room) {

    if (room.deck.length > 0) {
        return;
    }

    if (room.discardPile.length <= 1) {
        return;
    }

    const topCard = room.discardPile.pop();

    room.deck = [...room.discardPile];

    shuffleDeck(room.deck);

    room.discardPile = [topCard];

}

function drawCards(room, player, amount) {

    for (let i = 0; i < amount; i++) {

        reshuffleDeck(room);

        if (room.deck.length === 0) {
            break;
        }

        player.hand.push(
            drawCard(room.deck)
        );

    }

}
function playCardAction(room, socketId, cardIndex, chosenColor = null) {

    const playerIdx = room.players.findIndex(
        p => p.id === socketId
    );

    if (
        playerIdx === -1 ||
        playerIdx !== room.currentPlayer
    ) {

        return {
            success: false,
            reason: "Not your turn."
        };

    }

    const player = room.players[playerIdx];

    if (
        cardIndex < 0 ||
        cardIndex >= player.hand.length
    ) {

        return {
            success: false,
            reason: "Invalid card index."
        };

    }

    const card = player.hand[cardIndex];

    // --------------------------
    // Pending Draw Check
    // --------------------------

    if (room.pendingDraw > 0) {

        if (room.pendingDrawType === "draw2") {

            // House Rule:
            // Draw 2 can be answered by Draw 2 or Draw 4

            if (
                card.value !== "draw2" &&
                card.value !== "draw4"
            ) {

                return {
                    success: false,
                    reason: "You must draw cards or continue the stack."
                };

            }

        }

        else if (room.pendingDrawType === "draw4") {

            // House Rule:
            // Draw 4 can ONLY be answered by Draw 4

            if (
                card.value !== "draw4"
            ) {

                return {
                    success: false,
                    reason: "You must draw cards or continue the stack."
                };

            }

        }

    }

    const topCard =
        room.discardPile[
            room.discardPile.length - 1
        ];

    if (
        !isValidPlay(
            card,
            topCard,
            room.currentColor
        )
    ) {

        return {
            success: false,
            reason: "Illegal card play."
        };

    }

    // --------------------------
    // Play card
    // --------------------------

    player.hand.splice(
        cardIndex,
        1
    );

    room.discardPile.push(card);

    // Any colored card clears a Wild color

    if (card.color !== null) {

        room.currentColor = null;

    }

    // --------------------------
    // Winner
    // --------------------------

    if (player.hand.length === 0) {

        const winner = player.name;

        room.started = false;

        room.currentPlayer = 0;

        room.direction = 1;

        room.pendingDraw = 0;

        room.pendingDrawType = null;

        room.currentColor = null;

        room.players.forEach(player => {

            player.hand = [];

        });

        room.deck = [];

        room.discardPile = [];

        return {

            success: true,

            winner

        };

    }
    // --------------------------
    // Action Cards
    // --------------------------

    switch (card.value) {

        case "skip":

            // Skip the next player's turn
            advanceTurn(room, 2);

            break;

        case "reverse":

            // Reverse play direction
            room.direction *= -1;

            // In a 2-player game,
            // Reverse acts like Skip
            if (room.players.length === 2) {

                advanceTurn(room, 2);

            }

            else {

                advanceTurn(room);

            }

            break;

        case "draw2":

            // Start or continue Draw Two stack

            room.pendingDraw += 2;

            room.pendingDrawType = "draw2";

            advanceTurn(room);

            break;

        case "wild":

            if (

                chosenColor !== "red" &&
                chosenColor !== "yellow" &&
                chosenColor !== "green" &&
                chosenColor !== "blue"

            ) {

                return {

                    success: false,

                    reason: "Please choose a valid color."

                };

            }

            room.currentColor = chosenColor;

            advanceTurn(room);

            break;

        case "draw4":

            if (

                chosenColor !== "red" &&
                chosenColor !== "yellow" &&
                chosenColor !== "green" &&
                chosenColor !== "blue"

            ) {

                return {

                    success: false,

                    reason: "Please choose a valid color."

                };

            }

            room.currentColor = chosenColor;

            room.pendingDraw += 4;

            room.pendingDrawType = "draw4";

            advanceTurn(room);

            break;

        default:

            advanceTurn(room);

            break;

    }

    return {

        success: true,

        playedCard: card

    };

}
function drawCardAction(room, socketId) {

    const playerIdx = room.players.findIndex(
        p => p.id === socketId
    );

    if (
        playerIdx === -1 ||
        playerIdx !== room.currentPlayer
    ) {

        return {
            success: false,
            reason: "Not your turn."
        };

    }

    const player = room.players[playerIdx];

    // --------------------------
    // Resolve pending draw
    // --------------------------

    if (room.pendingDraw > 0) {

        drawCards(
            room,
            player,
            room.pendingDraw
        );

        const amount = room.pendingDraw;

        room.pendingDraw = 0;
        room.pendingDrawType = null;

        advanceTurn(room);

        return {

            success: true,

            forcedDraw: true,

            amount

        };

    }

    // --------------------------
    // Normal draw
    // --------------------------

    drawCards(
        room,
        player,
        1
    );

    const drawnCard =
        player.hand[
            player.hand.length - 1
        ];

    advanceTurn(room);

    return {

        success: true,

        card: drawnCard

    };

}

module.exports = {

    startGame,

    playCardAction,

    drawCardAction

};