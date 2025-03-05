import httpStatus from "../helpers/httpStatus.js";
import { Prisma } from "@prisma/client";

const ERROR_HANDLERS = {
  P2002: ({ error, response }) => {
    response.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Unique constraint failed on one or more fields",
      error: error.message,
    });
  },
  defaultError: ({ error, response }) => {
    response
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: error.message,
        isFromErrorHandler: true,
      });
  },
};

const errorHandler = (error, _request, response, _next) => {
  let option = error.name;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    option = error.code;
  }
  const handler = ERROR_HANDLERS[option] ?? ERROR_HANDLERS.defaultError;
  handler({ response, error });
};
export default errorHandler;
