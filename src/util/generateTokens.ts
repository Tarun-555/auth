import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "./prismaInit";

const generateTokens = async (user: { id: string; name: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, name: user.name },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m", //TODO: couldn't able to set through env variable (type error)
    }
  );

  console.log(
    "accessToken",
    accessToken,
    process.env.JWT_SECRET,
    process.env.JWT_TOKEN_EXPIRY
  );

  const refreshToken = await crypto.randomUUID();

  //store refresh token in session table in database for 7 days to create a new access token when access token expires
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });
  await prisma.session.create({
    data: {
      refreshToken: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), //7 days
    },
  });
  return { accessToken, refreshToken };
};

// call this function to generate new access token if refresh token is valid
const generateAccessToken = async (user: { id: string; name: string }) => {
  const accessToken = jwt.sign(
    { userId: user.id, name: user.name },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m", //TODO: couldn't able to set through env variable (type error)
    }
  );

  return accessToken;
};

const verifyToken = async (token: string) => {
  try {
    const valid = await jwt.verify(token, process.env.JWT_SECRET as string);
    if (valid) {
      return true;
    }
  } catch (err) {
    console.log("ERROR:", err);
    return false;
  }
};

export { generateTokens, verifyToken, generateAccessToken };
