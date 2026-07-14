const { drawCard } = require("./deck");

/**
 * Returns true if the card can legally be played.
 * Currently supports ONLY number cards.
 * Action cards will be added later.
 */
function isPlayable(card, topCard) {

    if (!card || !topCard) {
        return false;
    }

    // Ignore action cards for Milestone 2
    if (
        typeof card.value !== "number" ||
        typeof topCard.value !== "number"
    ) {
        return false;
    }

    return (
        card.color === topCard.color ||
        card.value === topCard.value
    );

}

/**
 * Advances the turn.
 */
function advanceTurn(room) {

    const totalPlayers = room.players.length;

    room.currentPlayer =
        (room.currentPlayer + room.direction + totalPlayers) %
        totalPlayers;

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
        !isPlayable(
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

    // Add to discard pile
    room.discardPile.push(selectedCard);

    // Winner?
    if (currentPlayer.hand.length === 0) {

        return {
            success: true,
            winner: currentPlayer.id
        };

    }

    advanceTurn(room);

    return {
        success: true
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

    isPlayable,

    advanceTurn,

    drawPlayerCard,

    playCard,

    checkWinner

};