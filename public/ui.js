const playerList = document.getElementById("playerList");

const startButton = document.getElementById("startButton");

socket.on("playerList",(players)=>{

    joinScreen.classList.add("hidden");

    lobbyScreen.classList.remove("hidden");

    playerList.innerHTML="";

    players.forEach(player=>{

        const li=document.createElement("li");

        li.textContent=player.name;

        playerList.appendChild(li);

    });

});

socket.on("host",()=>{

    startButton.classList.remove("hidden");

});