import { Router } from "express";
import { messageController } from "../controllers/messageController.js";
import {
  messageValidation,
  messageParamsValidation,
} from "../middleware/validations.js";

export const messageRoutes = () => {
  const messageRouter = Router();
  const { sendMessage } = messageController();

  // Ruta para enviar un mensaje
  messageRouter
    .route("/message")
    .post(messageValidation, messageParamsValidation, sendMessage); // Validaciones para crear un mensaje

  return messageRouter;
};
