let peerConnection;
const leaveSessionButton = document.querySelector('#leave-session');

leaveSessionButton.addEventListener("click", function () {
    socket.emit('leave', {room, username: username});
    socket.close();
    document.location.href = '/'
});


window.onunload = window.onbeforeunload = () => {
    socket.emit('leave', {room, username: username});
    socket.close();
};

