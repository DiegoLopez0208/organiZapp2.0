import httpStatus from "../helpers/httpStatus.js";
import prisma from "../database/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const authController = () => {
  const login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username,
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          password: true,
          email: true,
          birthDate: true,
          createdAt: true,
          image: true,
          provider: true,
        },
      });

      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      if (user.provider !== "credentials") {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: `Este usuario debe iniciar sesión con ${user.provider}`,
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Contraseña incorrecta",
        });
      }

      const tokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      res.status(httpStatus.OK).json({
        success: true,
        message: "Login exitoso",
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          birthDate: user.birthDate,
          createdAt: user.createdAt,
          image: user.image || null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const register = async (req, res, next) => {
    try {
      const { username, password, email, birthDate, name, image } = req.body;

      // Validación básica de campos requeridos
      if (!username || !password || !email) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Todos los campos son obligatorios",
        });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        return res.status(httpStatus.CONFLICT).json({
          success: false,
          message: "El usuario o email ya existe",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Procesar la fecha de nacimiento
      let parsedBirthDate = null;
      if (birthDate) {
        parsedBirthDate = new Date(birthDate);
        if (isNaN(parsedBirthDate.getTime())) {
          return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Formato de fecha inválido",
          });
        }
      }

      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          birthDate: parsedBirthDate,
          name: name || null,
          image:
            image ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" + username, // Avatar por defecto
          provider: "credentials",
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          birthDate: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });

      return res.status(httpStatus.CREATED).json({
        success: true,
        message: "Usuario registrado exitosamente",
        user: newUser,
      });
    } catch (error) {
      console.error("Error en registro:", error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error al registrar usuario",
        error: error.message,
      });
    }
  };

  const refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const newToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      res.status(httpStatus.OK).json({
        success: true,
        message: "Token actualizado",
        token: newToken,
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Token de refresco inválido",
        });
      }
      next(error);
    }
  };

  const oauthLogin = async (req, res, next) => {
    try {
      console.log("OAuth login request body:", req.body);
      const { email, name, image, provider } = req.body;

      if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Email es requerido",
        });
      }

      let user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          username: true,
          email: true,
          image: true,
          provider: true,
        },
      });

      if (!user) {
        let username = (name || email.split("@")[0])
          .toLowerCase()
          .replace(/\s+/g, "");
        let usernameExists = await prisma.user.findUnique({
          where: { username },
        });

        let suffix = 1;
        while (usernameExists) {
          username = `${username}${suffix}`;
          usernameExists = await prisma.user.findUnique({
            where: { username },
          });
          suffix++;
        }

        const dummyPassword = await bcrypt.hash(
          `oauth-${provider}-${Date.now()}`,
          10,
        );

        user = await prisma.user.create({
          data: {
            username,
            email,
            name: name || null,
            image: image || null,
            password: dummyPassword,
            provider: provider,
            emailVerified: new Date(),
          },
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
            provider: true,
          },
        });
      } else if (user.provider !== provider) {
        return res.status(httpStatus.CONFLICT).json({
          success: false,
          message: `Esta cuenta ya está registrada con ${user.provider}. Por favor inicia sesión con ese método.`,
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      console.log("Generated token:", token);

      return res.status(httpStatus.OK).json({
        success: true,
        message: "OAuth login exitoso",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
          provider: user.provider,
        },
      });
    } catch (error) {
      console.error("OAuth login error:", error);
      next(error);
    }
  };

  return {
    login,
    register,
    refresh,
    oauthLogin,
  };
};
