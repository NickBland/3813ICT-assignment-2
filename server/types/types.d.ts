import { Db } from "mongodb";

declare global {
  namespace Express {
    interface Request {
      db?: Db; // Append the db property to the Request object
    }
  }
}
