import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prismaInit";
import { generateAccessToken, generateTokens } from "../util/generateTokens";
import { mailService } from "../util/mailService";
import { logger } from "../util/logger";

type User = {
  username: string;
  email: string;
  password: string;
};

/*
 This controller is used to create new user by checking username, email and password in request body
 if all fields are present then encrypt password and save it to the database
 then generate access token and refresh token and send it to client
*/
export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   console.log(req.body, !req.body);
  if (req.body && req.body.username && req.body.email && req.body.password) {
    const { username, email, password } = req.body as User;
    console.log(username, email, password);
    // encrypt password before saving it to the database, 10 represents salt rounds
    const hashPassword = await bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashPassword,
      },
    });
    //create accessToken and refreshToken and send it to client in response so user can pass it in header for further requests
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      name: user.name,
    });
    // next();
    return res.status(200).json({
      message: "user created successfully",
      user: user.name,
      accessToken,
      refreshToken,
    });
  } else {
    return res.status(400).json("Bad request");
  }
};

/*
 This controller is used to login user by checking email and password in database
 if user found then generate access token and refresh token and send it to client
 else send error message
*/
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   console.log(req.body, !req.body);
  if (req.body && req.body.email && req.body.password) {
    const { email, password } = req.body as User;
    console.log(email, password);
    // encrypt password before saving it to the database, 10 represents salt rounds
    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      res.status(400).json("user not found");
      return;
    }

    const passwordMatch = await bcrypt.compareSync(password, user.password);
    // console.log("comparing pass", passwordMatch);

    if (passwordMatch) {
      //create accessToken and refreshToken and send it to client in response so user can pass it in header for further requests
      const { accessToken, refreshToken } = await generateTokens({
        id: user.id,
        name: user.name,
      });
      return res.status(200).json({
        message: "user logged in successfully",
        user: user.name,
        accessToken,
        refreshToken,
      });
    } else {
      return res.status(400).json("Invalid credentials");
    }
  } else {
    return res.status(400).json("Bad request");
  }
};

/*
 This controller is used to generate new access token if refresh token in session db is valid and not expired
 else if there is session but expired then delete that session from db and ask user to login again.
*/
export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("refresh token controller", req.body);
  const { refreshToken } = req.body;

  // if refresh token not found in request body
  if (!refreshToken) {
    res.status(400).json("refresh token not found");
    return;
  }

  //else find session associated with refresh token in database
  const session = await prisma.session.findFirst({
    where: { refreshToken: refreshToken },
  });

  //if session not found in database
  if (!session) {
    res.status(400).json("session not found");
    return;
  }

  // console.log("session ==", session);
  //if session found and not expired generate only new access token and send it to client
  if (session && new Date(session.expiresAt) > new Date()) {
    // res.status(400).json("refresh token valid");

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    console.log("session valid:", session.expiresAt > new Date(), user);
    const newAccessToken = await generateAccessToken({
      id: session.userId,
      name: user?.name as string,
    });

    res.status(200).json({ accessToken: newAccessToken });
    return;
  } else {
    console.log("session expired");
    // res.status(400).json("refresh token valid");
    const updateSession = await prisma.session.deleteMany({
      where: { refreshToken: refreshToken },
    });

    res.status(400).json("session expired. Please login again");
    return;
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("logout controller", req.body);
  const { refreshToken } = req.body;

  // if refresh token not found in request body

  if (refreshToken) {
    const session = await prisma.session.deleteMany({
      where: { refreshToken: refreshToken },
    });
    res.status(200).json("logout successful");
    return;
  }
  res.status(200).json("logout successful");
  return;
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await mailService.sendMail({
      from: "auth@testmail.com",
      to: "test@gmail.com",
      subject: "Forgot Password",
      html: `<div>here is the otp to reset password</div>`,
    });

    console.log(result);

    if (result.response) {
      logger.info("Email sent successfully!!");
      return res.status(200).json("email sent");
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json("internal server error");
  }
};
