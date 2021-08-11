const express = require('express')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

server.listen(3000)

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = []

// Abrindo a conexõa com o socket.io
io.on('connection', (socket) => {
    console.log("Conexão detectada....")

    // Vai criar a lista de usuários conectados
    socket.on('join-request', (username) => {
        socket.username = username
        connectedUsers.push(username)
        console.log(connectedUsers)

        socket.emit('user-ok', connectedUsers) // confirmação do recebimento do usuário
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        }) // Enviar algo pra todas as conexões do momento
    })

    // Remover usuários conectados da lista ao fechar a página
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username) // aceita tudo menos socket.username
        console.log(connectedUsers)

        // Vai atualizar para todos os chats a saida do usuário
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        })
    })

    // Enviando mensagem pra todo mundo
    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        }
        // socket.emit('show-msg', obj)
        socket.broadcast.emit('show-msg', obj)
    })
})