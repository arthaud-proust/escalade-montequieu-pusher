const socket = io.connect(`${window.location.origin}?uuid=${uuid}&name=${username}`);

// const username = "Arthaud";
const room = "test";


socket.emit('users', room);


socket.on('users.update', users=>{
    const usersCount = document.querySelector('#users-count');
    const usersList = document.querySelector('#users-list');
    if(usersCount) usersCount.innerHTML =`${users.length} connected`;
    if(usersList) usersList.innerHTML = users.map(user=>`<span class="user">${user}</span>`).join('');
})