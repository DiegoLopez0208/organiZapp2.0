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
import { groupRoutes } from './router/groupRouter.js' // Importamos las rutas de grupos
import { messageRoutes } from './router/messsageRouter.js' // Importamos las rutas de chats
import { groupController } from './controllers/groupController.js' // Importamos controlador de grupos
import { messageController } from './controllers/messageController.js' // Importamos controlador de chats
import prisma from './database/prisma.js'

dotenv.config()
const PORT = process.env.PORT || 4000
const corsOptions = {
  origin: 'http://localhost:3000', // (https://your-client-app.com)
  optionsSuccessStatus: 200
}

const app = express()
let groups = []

const loadGroupsFromDatabase = async () => {
  const dbGroups = await prisma.group.findMany()
  groups = [...dbGroups] // Reemplazamos el array global
}

// Llamamos a la función asincrónica de forma controlada
const loadData = async () => {
  await loadGroupsFromDatabase()
}

loadData()

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  jwt({
    secret: process.env.SECRET_KEY,
    algorithms: ['HS256']
  }).unless({ path: ['/api/auth/login', '/api/auth/refresh', '/api/auth/register', '/socket.io/'] })
)

// Rutas de la API
app.use('/api', authRoutes(), userRoutes(), taskRoutes(), groupRoutes(), messageRoutes()) // Rutas de grupos y chats

// Middleware de manejo de errores
app.use(errorHandler)

// Crear el servidor HTTP y configurar Socket.io
const server = createServer(app)

// Configuración del servidor de Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS']
  }
})

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado: ', socket.id)

  socket.emit('groups_updated', groups)

  socket.on('create_group', async (groupData) => {
    if (!groupData || !groupData.name) {
      console.log('Datos del grupo inválidos')
      return
    }
    try {
      const req = { body: groupData }
      const res = {
        status: () => ({
          json: (data) => console.log('Respuesta del controlador:', data)
        })
      }
      const group = await groupController().createGroup(req, res)
      if (group) {
        groups.push(group)
        socket.join(group.id)
        io.emit('groups_updated', groups)
      } else {
        console.log('Error al crear el grupo')
      }
    } catch (error) {
      console.error('Error al crear el grupo:', error)
    }
  })

  // Unirse a un grupo - El cliente se une a la room
  socket.on('join_group', async (groupId) => {
    console.log(groupId)
    if (!groupId) {
      console.log('ID del grupo no proporcionado')
      return
    }
    try {
      const req = {
        params: { id: groupId } // Simulamos el objeto `req` correctamente
      }

      const res = {
        status: (code) => ({
          json: (data) => {
            console.log(`Respuesta del controlador con código ${code}:`, data)
            return data // Devuelve los datos para capturarlos en la variable group
          }
        })
      }

      // Llamamos al controlador pasando el objeto req (que ahora tiene params)
      const group = await groupController().getGroupById(req, res) // Obtenemos el grupo desde la base de datos

      if (group) {
        socket.join(groupId) // El usuario entra al grupo
        console.log(`Usuario ${socket.id} se unió al grupo: ${group.name}`)
        io.to(groupId).emit('new_member', { userId: socket.id, groupId }) // Notificamos a los miembros del grupo
      } else {
        console.log('Grupo no encontrado')
      }
    } catch (error) {
      console.error('Error al unirse al grupo:', error)
    }
  })

  // Enviar mensaje a un grupo
  socket.on('send_message', async (data) => {
    console.log(data)

    // Extraemos los datos del mensaje y del grupo
    const { groupId, message } = data

    // Verificamos que los datos son válidos
    if (!groupId || !message) {
      console.log('Datos de mensaje no válidos')
      return
    }

    // Creamos un objeto `req` con la estructura adecuada
    const req = {
      body: data,
      params: { id: groupId } // `params` debe tener un objeto con el `groupId`
    }
    const messageData = {
      content: data.message.text,
      senderId: socket.id,
      receiverId: null,
      groupId: data.groupId
    }
    console.log(messageData)
    // Creamos un objeto `res` para simular la respuesta
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Respuesta del controlador con código ${code}:`, data)
          return data // Retornamos los datos para capturarlos en la variable `group`
        }
      })
    }

    try {
      // Llamamos al controlador para obtener el grupo por `groupId`
      const group = await groupController().getGroupById(req, res)
      if (group) {
        // Llamamos al controlador para guardar el mensaje en la base de datos
        const newMessage = await messageController().sendMessage(socket, messageData, res)

        // Emitimos el mensaje a todos los miembros del grupo
        io.to(groupId).emit('new_message', { userId: socket.id, message: newMessage })
        console.log(`Mensaje enviado al grupo ${groupId}: ${message}`)
      } else {
        console.log('Grupo no encontrado para enviar el mensaje')
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error)
    }
  })

  // Escuchar los eventos de desconexión
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado:', socket.id)
    // Aquí podrías manejar la desconexión y eliminar al usuario de los grupos si lo deseas
  })
})

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(` [✅] Backend ejecutándose en el puerto ${PORT}`)
})
