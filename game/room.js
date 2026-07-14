class Room {

    constructor() {

        this.players = [];

        this.deck = [];

        this.discardPile = [];

        this.currentPlayer = 0;

        this.direction = 1;

        this.started = false;

        // House Rules Engine
        this.pendingDraw = 0;
        this.pendingDrawType = null;

        // Reserved for Wild cards
        this.currentColor = null;

    }

}

module.exports = Room;