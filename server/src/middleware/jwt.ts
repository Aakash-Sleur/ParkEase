import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import User from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  id: String;
  isAdmin: boolean;
}

interface JwtPayload {
  id: string;
  isAdmin: boolean;
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("You are not authenticated!");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
    req.id = payload.id;
    req.isAdmin = payload.isAdmin;
    next();
  } catch (err) {
    return res.status(403).json("Token is not valid!");
  }
};

export const getUserByToken = async (token: string) => {
  if (!token) {
    return {
      message: "session expired",
      logout: true,
      //@ts-ignore
      user: null,
    };
  }

  const decode = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;

  const user = await User.findById(decode.id).select("-password");

  return user;
};
