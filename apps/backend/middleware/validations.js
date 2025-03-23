import { taskSchema, taskParamsSchema } from "../validations/taskSchema.js";
import { userSchema, userParamsSchema } from "../validations/userSchema.js";
import { groupSchema, groupParamsSchema } from "../validations/groupSchema.js";
import {
  messageSchema,
  messageParamsSchema,
} from "../validations/messageSchema.js";

// Task Validations
export const taskValidation = (req, _res, next) => {
  const data = req.body;
  const { error } = taskSchema.validate(data);
  if (error) {
    next(error);
  }
  next();
};

export const taskParamsValidation = (req, _res, next) => {
  const { id } = req.params;
  const { error } = taskParamsSchema.validate(id);
  if (error) {
    next(error);
  }
  next();
};

// User Validation
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

// Group Validations
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

// Message Validations
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
