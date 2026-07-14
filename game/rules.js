const { drawCard } = require("./deck");

/**
 * Returns true if the card can legally be played.
 *
 * Supported:
 * - Number cards
 * - Skip cards
 *
 * Upcoming:
 * - Reverse
 * - Draw Two
 * - Wild
 * - Wild Draw Four
 */
function isValidPlay(card, topCard) {

    if (!card || !topCard) {
        return false;
    }

    // Same color always works
    if (card.color === topCard.color) {
        return true;
    }

    // Same number
    if (
        typeof card.value === "number" &&
        typeof topCard.value === "number"
    ) {
        return card.value === topCard.value;
    }

    // Same action card
    switch (card.value) {

        case "skip":
            return topCard.value === "skip";

        case "reverse":
            return topCard.value === "reverse";
        
        case "draw2":
        return topCard.value === "draw2";

        default:
            return false;

    }

}

/**
 * Advances the turn.
 *
 * steps = 1 -> normal
 * steps = 2 -> skip
 */
function advanceTurn(room, steps = 1) {

    const totalPlayers = room.players.length;

    room.currentPlayer =
        (
            room.currentPlayer +
            (room.direction * steps) +
            totalPlayers * steps
        ) % totalPlayers;

}

/**
 * Draw one card.
 */
function drawPlayerCard(room, playerId) {

    const player = room.players.find(
        p => p.id === playerId
    );

    if (!player) {

        return {
            success: false,
            message: "Player not found."
        };

    }

    if (room.deck.length === 0) {

        return {
            success: false,
            message: "Deck is empty."
        };

    }

    player.hand.push(
        drawCard(room.deck)
    );

    advanceTurn(room);

    return {
        success: true
    };

}

/**
 * Play a card.
 */
function playCard(room, playerId, cardIndex) {

    if (!room.started) {

        return {
            success: false,
            message: "Game has not started."
        };

    }

    const currentPlayer =
        room.players[room.currentPlayer];

    if (!currentPlayer) {

        return {
            success: false,
            message: "Invalid current player."
        };

    }

    if (currentPlayer.id !== playerId) {

        return {
            success: false,
            message: "Not your turn."
        };

    }

    if (
        cardIndex < 0 ||
        cardIndex >= currentPlayer.hand.length
    ) {

        return {
            success: false,
            message: "Invalid card."
        };

    }

    const selectedCard =
        currentPlayer.hand[cardIndex];

    const topCard =
        room.discardPile[
            room.discardPile.length - 1
        ];

    if (
        !isValidPlay(
            selectedCard,
            topCard
        )
    ) {

        return {
            success: false,
            message: "Illegal move."
        };

    }

    // Remove from hand
    currentPlayer.hand.splice(cardIndex, 1);

    // Place onto discard pile
    room.discardPile.push(selectedCard);

    // Winner
    if (currentPlayer.hand.length === 0) {

        return {
            success: true,
            winner: currentPlayer.id
        };

    }

    // Normal turn advance
    // Skip logic will be handled in gameManager.js
    advanceTurn(room);

    return {
        success: true,
        playedCard: selectedCard
    };

}

/**
 * Returns winner object or null.
 */
function checkWinner(room) {

    return room.players.find(
        player => player.hand.length === 0
    ) || null;

}

module.exports = {

    isValidPlay,

    advanceTurn,

    drawPlayerCard,

    playCard,

    checkWinner

};