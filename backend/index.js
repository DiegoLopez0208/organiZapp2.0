import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { expressjwt as jwt } from 'express-jwt'
import errorHandler from './middleware/errorHandler.js'
import { userRoutes } from './router/userRouter.js'
import { taskRoutes } from './router/taskRouter.js'
import { authRoutes } from './router/authRouter.js'

dotenv.config()
const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(jwt({
  secret: process.env.SECRET_KEY,
  algorithms: ['HS256']
}).unless({ path: ['/api/auth/login', '/api/auth/refresh', '/api/auth/register'] })
)
app.use('/api', authRoutes(), userRoutes(), taskRoutes())
app.use(errorHandler)
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS']
  }
})

io.on('connection', (socket) => {
  console.log('Se ha conectado un cliente')

  socket.on('chat_message', (data) => {
    io.emit('chat_message', data)
  })
})

server.listen(PORT, () => {
  console.log(` [✅] The backend is starting in PORT: ${PORT}`)
})
