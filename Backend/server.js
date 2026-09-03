import dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"
import projectModel from './models/project.model.js'
import { generateResult } from './services/ai.service.js'

import app from './app.js'

const server = http.createServer(app)

const port = 4000

// const server = require('http').createServer();
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.use(async (socket, next) => {
    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);

        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }

        socket.user = decoded;

        next();
    }
    catch (err) {
        next(err)
    }
})

// io.on('connection', socket => {
//     console.log('Socket.io is connected')

io.on('connection', socket => {
    console.log('SOCKET CONNECTED:', socket.id)
    console.log('PROJECT:', socket.project?._id)
    console.log('USER:', socket.user)

    socket.roomId = socket.project._id.toString()

    socket.join(socket.roomId)

    // socket.on('project-message', async data => {
    //     console.log(data)

    //     const message=data.message
    //     const aiIsPresentInMessage=message.includes('@ai')
    //     socket.broadcast.to(socket.roomId).emit('project-message', data)

    //     if(aiIsPresentInMessage){
    //         const prompt=message.replace('@ai', " ")
    //         const result=await generateResult(prompt)

    //         io.to(socket.roomId).emit('project-message', {
    //             message:result,
    //             sender:{
    //                 _id:'ai',
    //                 email:'AI'
    //             }
    //         })
    //     }

    //     socket.broadcast.to(socket.roomId).emit('project-message', data)
    // })

    socket.on('project-message', async data => {
        console.log("MESSAGE RECEIVED:", data)

        const message = data.message
        const aiIsPresentInMessage = message.includes('@ai')

        // Send message to other collaborators
        socket.broadcast.to(socket.roomId).emit('project-message', data)

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', " ")

            const result = await generateResult(prompt)

            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            })
        }
    })

    socket.on('event', data => { /* … */ });

    socket.on('disconnect', () => {
        console.log('User disconnected')
        socket.leave(socket.roomId)
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
