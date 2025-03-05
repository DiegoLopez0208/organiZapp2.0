import { Router } from "express";
import { groupController } from "../controllers/groupController.js";
import {
  groupValidation,
  groupParamsValidation,
} from "../middleware/validations.js";

export const groupRoutes = () => {
  const groupRouter = Router();
  const { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } =
    groupController();

  groupRouter.route("/group").get(getGroups).post(groupValidation, createGroup); // Validaciones para crear un grupo

  groupRouter
    .route("/group/:id")
    .get(groupParamsValidation, getGroupById) // Validaciones para el parámetro id
    .put(groupParamsValidation, groupValidation, updateGroup) // Validaciones para el id y los datos del grupo
    .delete(groupParamsValidation, deleteGroup); // Validación del id antes de eliminar

  return groupRouter;
};
