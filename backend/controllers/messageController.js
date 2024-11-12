import prisma from '../database/prisma.js'

export const messageController = () => {
  // Enviar un mensaje
  const sendMessage = async (socket, data, res) => {
    const { senderId, content, receiverId, groupId } = data

    try {
      // Crear el mensaje en la base de datos
      const newMessage = await prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
          groupId
        }
      })

      // Emitir el mensaje a la room correspondiente
      if (groupId) {
        // Si hay un groupId, lo emitimos a la room del grupo
        socket.to(groupId).emit('chat_message', newMessage)
      } else if (receiverId) {
        // Si hay un receiverId, es un mensaje privado
        socket.to(receiverId).emit('private_message', newMessage)
      }

      // Responder con el mensaje creado
      return newMessage
    } catch (error) {
      return error
    }
  }

  return {
    sendMessage
  }
}
