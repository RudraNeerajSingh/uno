function createDeck() {

    const deck = [];

    const colors = [
        "red",
        "yellow",
        "green",
        "blue"
    ];

    colors.forEach(color => {

        // One zero
        deck.push({
            color,
            value: 0
        });

        // Two of each number 1-9
        for (let number = 1; number <= 9; number++) {

            deck.push({
                color,
                value: number
            });

            deck.push({
                color,
                value: number
            });

        }

        // Two of each action card
        for (let i = 0; i < 2; i++) {

            deck.push({
                color,
                value: "skip"
            });

            deck.push({
                color,
                value: "reverse"
            });

            deck.push({
                color,
                value: "draw2"
            });

        }

    });

    // Four Wild cards
    for (let i = 0; i < 4; i++) {

        deck.push({
            color: null,
            value: "wild"
        });

    }

    // Four Wild Draw Four cards
    for (let i = 0; i < 4; i++) {

        deck.push({
            color: null,
            value: "draw4"
        });

    }

    return deck;

}

function shuffleDeck(deck) {

    for (let i = deck.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [deck[i], deck[j]] = [deck[j], deck[i]];

    }

}

function drawCard(deck) {

    return deck.pop();

}

module.exports = {

    createDeck,

    shuffleDeck,

    drawCard

};