import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../util/prismaInit";
import { generateAccessToken, generateTokens } from "../util/generateTokens";
import {
  loginController,
  logoutController,
  refreshTokenController,
  signUpController,
} from "./login";

jest.mock("express");
jest.mock("bcrypt");
jest.mock("../util/prismaInit", () => {
  return {
    prisma: {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      session: {
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
      },
    },
  };
});

jest.mock("../util/generateTokens");

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGenerateAccessToken = generateAccessToken as jest.Mocked<
  typeof generateAccessToken
>;
const mockGenerateTokens = generateTokens as jest.Mocked<typeof generateTokens>;

describe("auth controller test suite", () => {
  let mockedReq: Partial<Request>;
  let mockedRes: Partial<Response>;
  let mockedNext: jest.MockedFunction<NextFunction>;
  const mockUser = {
    name: "test",
    email: "test@yahoo.com",
    password: "pass-hashed",
  };
  const mockHashPassword = "pass-hashed";
  const mockAccessToken = "access-token";
  const mockRefreshToken = "refresh-token";
  const mockJwtSecret = "test-secret";

  describe("signup controller", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedReq = {
        body: {
          username: "test",
          email: "test@yahoo.com",
          password: "pass123",
        },
      };

      mockedRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      mockedNext = jest.fn();
    });

    it("should create user and return tokens after signup if valid", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: "test",
      });
      (mockGenerateTokens as jest.Mock).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      (mockBcrypt.hashSync as jest.Mock).mockResolvedValue(mockHashPassword);
      await signUpController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );
      expect(mockGenerateTokens({ id: "1", name: "test" })).resolves.toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({ data: mockUser });
      expect(mockedRes.status).toHaveBeenCalledWith(200);
      expect(mockedRes.json).toHaveBeenCalledWith({
        message: "user created successfully",
        user: mockUser.name,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    test("should return status code if req body doesn't exist with user fields", async () => {
      mockedReq.body = {};
      await signUpController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );
      expect(mockedRes.status).toHaveBeenCalledWith(400);
      expect(mockedRes.json).toHaveBeenCalledWith("Bad request");
    });
  });

  describe("login controller", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedReq.body = {
        email: "test@yahoo.com",
        password: "pass123",
      };

      mockedRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockedNext = jest.fn();
    });

    it("should handle login successfully if user creds valid", async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: "test",
      });

      (mockBcrypt.compareSync as jest.Mock).mockResolvedValue(true);

      (mockGenerateTokens as jest.Mock).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      await loginController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );

      expect(mockGenerateTokens).toHaveBeenCalledWith({
        id: 1,
        name: "test",
      });
      expect(mockedRes.status).toHaveBeenCalledWith(200);
      expect(mockedRes.json).toHaveBeenCalledWith({
        message: "user logged in successfully",
        user: "test",
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it("should handle user not found error if user is not found in db", async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await loginController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );
      expect(mockedRes.status).toHaveBeenCalledWith(400);
      expect(mockedRes.json).toHaveBeenCalledWith("user not found");
    });
  });

  describe("refreshToken controller test suite", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedReq.body = {
        email: "test@yahoo.com",
        password: "pass123",
      };

      mockedRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockedNext = jest.fn();
    });

    it("should return access token if session and refresh token is valid", async () => {
      mockedReq.body = {
        refreshToken: mockRefreshToken,
      };
      (mockedPrisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: "session-id",
        userId: "session-user-id",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: "test",
      });
      (mockGenerateAccessToken as jest.Mock).mockResolvedValue(mockAccessToken);

      await refreshTokenController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );

      expect(mockGenerateAccessToken).toHaveBeenCalledWith({
        id: "session-user-id",
        name: "test",
      });

      expect(mockedRes.status).toHaveBeenCalledWith(200);
      expect(mockedRes.json).toHaveBeenCalledWith({
        accessToken: mockAccessToken,
      });
    });

    it("it should fail if failed to pass refresh token through req body", async () => {
      mockedReq.body = {};
      await refreshTokenController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );

      expect(mockedRes.status).toHaveBeenCalledWith(400);
      expect(mockedRes.json).toHaveBeenCalledWith("refresh token not found");
    });
  });

  describe("logout controller", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockedReq.body = {
        refreshToken: mockRefreshToken,
      };

      mockedRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockedNext = jest.fn();
    });

    it("should clear session from db after successful logout", async () => {
      (mockedPrisma.session.deleteMany as jest.Mock).mockResolvedValue({
        id: 1,
      });

      await logoutController(
        mockedReq as Request,
        mockedRes as Response,
        mockedNext
      );
      expect(mockedPrisma.session.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockedRes.status).toHaveBeenCalledWith(200);
      expect(mockedRes.json).toHaveBeenCalledWith("logout successful");
    });
  });
});
