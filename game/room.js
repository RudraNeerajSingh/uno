class Room {

    constructor(){

        this.players=[];

        this.deck=[];

        this.discardPile=[];

        this.currentPlayer=0;

        this.direction=1;

        this.started=false;

    }

}

module.exports=Room;