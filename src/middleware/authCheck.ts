import { verifyToken } from "../util/generateTokens";
import { Request, Response, NextFunction } from "express";

//middleware to check if user is authenticated by verify accessToken if valid proceed forward else send 401 unauthorized
const authCheck = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  console.log("token", token);
  if (!token) {
    return next("not authenticated");
  }

  //verify token
  try {
    const valid = await verifyToken(token);
    console.log("valid", valid);

    if (valid) {
      return next();
    } else {
      return next("not authenticated");
    }
  } catch (err) {
    console.log("ERROR:", err);
    return next("not authenticated");
  }
};

export { authCheck };
