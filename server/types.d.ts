import { Request } from "express";
import { User } from "../shared/types/schema";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}