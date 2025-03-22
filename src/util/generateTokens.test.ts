import * as jwt from "jsonwebtoken";
import {
  generateTokens,
  generateAccessToken,
  verifyToken,
} from "./generateTokens";
import { prisma } from "./prismaInit";
import crypto from "crypto";

//mock external dependencies
jest.mock("jsonwebtoken");
jest.mock("crypto");
jest.mock("./prismaInit", () => {
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

  it("should generate access token and refresh token", async () => {
    const tokens = await generateTokens(mockUser);
    console.log("tokens", tokens);
    expect(tokens).toEqual({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    });
  });
});
