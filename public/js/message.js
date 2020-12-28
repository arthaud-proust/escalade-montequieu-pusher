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



window.onunload = window.onbeforeunload = () => {
    socket.emit('leave', {room, username: username});
    socket.close();
};



