import { taskSchema, taskParamsSchema, updateTaskSchema } from "../validations/taskSchema.js";
import { userSchema, userParamsSchema } from "../validations/userSchema.js";
import { groupSchema, groupParamsSchema } from "../validations/groupSchema.js";
import {
  messageSchema,
  messageParamsSchema,
} from "../validations/messageSchema.js";

export const taskValidation = (req, _res, next) => {
  const data = req.body;
  const { error } = taskSchema.validate(data);
  if (error) {
    next(error);
  }
  next();
};
export const createTaskValidation = (req, _res, next) => {
  const { error } = createTaskSchema.validate(req.body);
  if (error) return next(error);
  next();
};

export const updateTaskValidation = (req, _res, next) => {
  const { error } = updateTaskSchema.validate(req.body);
  if (error) return next(error);
  next();
};

export const taskParamsValidation = (req, _res, next) => {
  const { error } = taskParamsSchema.validate(req.params);
  if (error) return next(error);
  next();
};

export const userValidation = (req, _res, next) => {
  const data = req.body;
  const { error } = userSchema.validate(data);
  if (error) {
    next(error);
  }
  next();
};

export const userParamsValidation = (req, _res, next) => {
  const { id } = req.params;
  const { error } = userParamsSchema.validate(id);
  if (error) {
    next(error);
  }
  next();
};

export const groupValidation = (req, _res, next) => {
  const data = req.body;
  const { error } = groupSchema.validate(data);
  if (error) {
    next(error);
  }
  next();
};

export const groupParamsValidation = (req, _res, next) => {
  const { id } = req.params;
  const { error } = groupParamsSchema.validate(id);
  if (error) {
    next(error);
  }
  next();
};

export const messageValidation = (req, _res, next) => {
  const data = req.body;
  const { error } = messageSchema.validate(data);
  if (error) {
    next(error);
  }
  next();
};

export const messageParamsValidation = (req, _res, next) => {
  const { id } = req.params;
  const { error } = messageParamsSchema.validate(id);
  if (error) {
    next(error);
  }
  next();
};
