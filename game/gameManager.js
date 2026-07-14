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

    // Ensure the first discard card is a number card
    let firstCard = drawCard(room.deck);
    while (firstCard && typeof firstCard.value !== "number") {
        room.deck.unshift(firstCard); // put back at bottom of deck
        shuffleDeck(room.deck);       // reshuffle to keep it random
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

    room.currentPlayer =
        (
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

function playCardAction(room, socketId, cardIndex) {

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

    const topCard =
        room.discardPile[
            room.discardPile.length - 1
        ];

    if (
        !isValidPlay(card, topCard)
    ) {

        return {
            success: false,
            reason: "Illegal card play."
        };

    }

    // --------------------------
    // Play the card
    // --------------------------

    player.hand.splice(cardIndex, 1);

    room.discardPile.push(card);

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

        // In a 2-player game, Reverse acts like Skip
        if (room.players.length === 2) {
            advanceTurn(room, 2);
        } else {
            advanceTurn(room);
        }

        break;

    default:

        // Number cards
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

    drawCards(room, player, 1);

    const drawnCard =
        player.hand[player.hand.length - 1];

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
