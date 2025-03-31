import * as jwt from "jsonwebtoken";
import {
  generateTokens,
  generateAccessToken,
  verifyToken,
} from "./generateTokens";
import { prisma } from "../config/prismaInit";
import crypto from "crypto";

//mock external dependencies
jest.mock("jsonwebtoken");
jest.mock("crypto");
jest.mock("../config/prismaInit", () => {
  return {
    prisma: {
      session: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
    },
  };
});

//mocked dependencies with types
const mockedJWT = jwt as jest.Mocked<typeof jwt>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedPrisma = prisma.session as jest.Mocked<typeof prisma.session>;

describe("test suite for token related functions: ", () => {
  //mock the values
  const mockUser = { id: "user-123", name: "John Doe" };
  const mockAccessToken = "mock-access-token";
  const mockRefreshToken = "mock-refresh-tuid";
  const mockJwtSecret = "test-secret";
  beforeEach(() => {
    // console.log(mockedJWT.sign);
    jest.resetAllMocks();
    process.env.JWT_SECRET = mockJwtSecret;
    //mock return values for mocked dependencies
    mockedJWT.sign.mockReturnValue(mockAccessToken as never);
    mockedJWT.verify.mockResolvedValue(true as never);
    mockedCrypto.randomUUID.mockReturnValue(mockRefreshToken as never);
    mockedPrisma.create.mockReturnValue({} as never);
  });

  describe("generateTokens function utiltity", () => {
    it("should generate access token and refresh token", async () => {
      const tokens = await generateTokens(mockUser);
      // console.log("tokens", tokens);
      expect(tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it("should sign access token with correct params and create refresh token", async () => {
      await generateTokens(mockUser);

      expect(mockedJWT.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          name: mockUser.name,
        },
        mockJwtSecret,
        { expiresIn: "15m" }
      );
      expect(mockedCrypto.randomUUID).toHaveBeenCalledTimes(1);
    });

    it("should delete existing sessions if session exists and create new session", async () => {
      await generateTokens(mockUser);
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          refreshToken: mockRefreshToken,
          userId: mockUser.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });
    });
  });

  describe("generateAccessToken utility", () => {
    it("it should return access token and call jwt sign when called", async () => {
      const accessToken = await generateAccessToken(mockUser);
      expect(mockedJWT.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, name: mockUser.name },
        mockJwtSecret,
        {
          expiresIn: "15m",
        }
      );
      expect(accessToken).toBe(mockAccessToken);
    });
  });

  describe("verifyToken utility function", () => {
    it("should call jwt verify and return true for valid token", async () => {
      const valid = await verifyToken(mockAccessToken);
      expect(mockedJWT.verify).toHaveBeenCalledWith(
        mockAccessToken,
        mockJwtSecret
      );
      expect(valid).toBeTruthy();
    });

    it("should return false for invalid token", async () => {
      mockedJWT.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });
      const valid = await verifyToken("invalid");

      expect(valid).toBeFalsy();
    });
  });
});
