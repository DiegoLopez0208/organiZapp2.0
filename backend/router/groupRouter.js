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

  groupRouter.route("/group").get(getGroups).post(groupValidation, createGroup); 

  groupRouter
    .route("/group/:id")
    .get(groupParamsValidation, getGroupById) 
    .put(groupParamsValidation, groupValidation, updateGroup) 
    .delete(groupParamsValidation, deleteGroup); 

  return groupRouter;
};
