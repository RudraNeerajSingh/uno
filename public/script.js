const socket = io();

const joinScreen = document.getElementById("joinScreen");
const lobbyScreen = document.getElementById("lobbyScreen");

const joinButton = document.getElementById("joinButton");

const nameInput = document.getElementById("nameInput");

joinButton.addEventListener("click", ()=>{

    const name = nameInput.value.trim();

    if(name.length===0){

        alert("Enter your name.");

        return;

    }

    socket.emit("join",{

        name:name

    });

});