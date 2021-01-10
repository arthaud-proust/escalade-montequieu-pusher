const messages = document.querySelector('#messages');
const writings = document.querySelector('#writings');
const input = document.querySelector('#input');
const send = document.querySelector('#send');
var writeTimeout = null;

const sendMessage = function() {
    socket.emit('message.new', {author: username, content: input.value});
    input.value='';
}
const sendWritingStart = function() {
    socket.emit('writing.start', {author: username});
}
const sendWritingStop = function() {
    socket.emit('writing.stop', {author: username});
    writeTimeout = null;
}

const handleWrite = function() {
    if(writeTimeout == null) {
        sendWritingStart()
        clearTimeout(writeTimeout);
        writeTimeout = setTimeout(sendWritingStop, 500);
    } else {
        clearTimeout(writeTimeout);
        writeTimeout = setTimeout(sendWritingStop, 500);
    }
}

send.addEventListener("click", sendMessage)
input.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        sendMessage()
    } else {
        handleWrite()
    }
})


socket.on("connect", () => {
    socket.emit('join', {room, username: username});
});

socket.on("messages.update", (message) => {
    if(message.type == 'message') {
        messages.innerHTML += `<div class="message"><b class="author">${message.author}</b><p class="content">${message.content}<p></div>`;
    } else {
        messages.innerHTML += `<span>${message.content}</span>`
    }
    messages.scrollTo(0,messages.scrollHeight);
});

socket.on("writings.update", (users) => {
    console.log(users);
    const index = users.indexOf(username);
    if (index > -1) {
        users.splice(index, 1);
    }
    writings.innerHTML = users.length==0?'':`<span>${users.join()} ${users.length==1?'écrit':'écrivent'}...</span>`
});

socket.on("seen.update", (usersUuid) => {
    // bypassed here
    let index = usersUuid.indexOf(window._uuid);
    if (index > -1) {
        usersUuid.splice(index, 1);
    }
    // bypassed too
    index = usersUuid.indexOf(window._last_message_author);
    if (index > -1) {
        usersUuid.splice(index, 1);
    }

    let seenBox = document.getElementById('seenBox');
    // what's interesting
    if(usersUuid.length>0) {
        let usersTiles = "";
        for (let i=0; (i<usersUuid.length+1)&&(i<3); i++) {
            usersTiles+='<img src="https://eu.ui-avatars.com/api/?name='+usersUuid.shift()+'" class="seenBox-seenTile">';
        }
        seenBox.innerHTML = `Vu par <div id="seenBox-seen">${usersTiles}</div> ${usersUuid.length>0?'+'+usersUuid.length:''}`;
    } else {
        seenBox.innerHTML = ''
    }
    
});

window.onunload = window.onbeforeunload = () => {
    socket.emit('leave', {room, username: username});
    socket.close();
};



