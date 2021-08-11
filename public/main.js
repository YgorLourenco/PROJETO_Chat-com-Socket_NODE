// Cliente Socket.io
const socket = io()
let username = ''
let userList = []

let loginPage = document.querySelector('#loginPage')
let chatPage = document.querySelector('#chatPage')

let loginInput = document.querySelector('#loginNameInput')
let textInput = document.querySelector('#chatTextInput')

loginPage.style.display = 'flex'
chatPage.style.display = 'none'

// Mostrando os nomes na barra de lista de usuários a esquerda do chat
function renderUserList() {
    let ul = document.querySelector('.userList')
    ul.innerHTML = ''

    userList.forEach(i => {
        ul.innerHTML += '<li>'+i+'</li>'
    })
}

// Mensagens de Status
function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList')

    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">'+msg+'</li>'
            break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span>'+msg+'</li>'
            } else {
                ul.innerHTML += '<li class="m-txt"><span>'+user+'</span>'+msg+'</li>'
            }
            break;
    }
}

// Colocando o nome do usuário sendo visto no navegador
loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim()
        if(name != '') {
            username = name
            document.title = 'Chat ( '+username+' )'

            socket.emit('join-request', username) // Emitir a conexão com o servidor, no caso o nome do usuário
        }
    }
})

// Enviando mensagem no campo de mensagens
textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let txt = textInput.value.trim()
        textInput.value = ''

        if(txt != '') {
            addMessage('msg', username, txt)
            socket.emit('send-msg', txt)
        }
    }
})

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none'
    chatPage.style.display = 'flex'
    textInput.focus()

    addMessage('status', null, 'Conectado!')

    userList = list
    renderUserList()
})

// Atualização de status de entrada e saida de usuário
socket.on('list-update', (data) => {
    if(data.joined) {
        addMessage('status', null, data.joined+' entrou no chat!')
    }
    if(data.left) {
        addMessage('status', null, data.left+' saiu do chat!')
    }
    userList = data.list
    renderUserList();
})

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message)
})

// Mensagem de problemas técnicos
socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!')
    userList = [] // Vai tirar o nome da lista de usuários ativos
    renderUserList() 
})

// Tentar reconectar e não funcionar
socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentano reconectar...')
})

// Se conseguir reconectar
socket.on('reconnect', () => {
    addMessage('status', null, 'Reconectado!')

    if(username != '') {
        socket.emit('join-request', username)
    }
})