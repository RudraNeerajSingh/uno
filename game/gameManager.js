const {
    createDeck,
    shuffleDeck,
    drawCard
}=require("./deck");

function startGame(room){

    room.started=true;

    room.deck=createDeck();

    shuffleDeck(room.deck);

    room.players.forEach(player=>{

        player.hand=[];

        for(let i=0;i<7;i++){

            player.hand.push(

                drawCard(room.deck)

            );

        }

    });

    room.discardPile.push(

        drawCard(room.deck)

    );

    return room;

}

module.exports={

    startGame

};