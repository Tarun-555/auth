import { Request, Response, NextFunction } from "express";
import { authCheck } from "./authCheck";
import { verifyToken } from "../util/generateTokens";

//mock verifyToken with jest after module import
jest.mock("../util/generateTokens", () => ({
  verifyToken: jest.fn(),
}));

const mockedVerifyToken = verifyToken as jest.MockedFunction<
  typeof verifyToken
>; // use typeof from jest mocked as mockedFunction

describe("Test suite for authCheck middleware", () => {
  let mockedReq: Partial<Request>;
  let mockedRes: Partial<Response>;
  let mockedNext: jest.MockedFunction<NextFunction>;
  beforeEach(() => {
    jest.resetAllMocks();
    mockedReq = {
      headers: {},
    };

    mockedRes = {
      status: jest.fn(this),
      json: jest.fn(this),
    };
    mockedNext = jest.fn();
  });
  it("should return error when token not present in header", async () => {
    mockedReq.headers = {};
    await authCheck(mockedReq as Request, mockedRes as Response, mockedNext);
    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenCalledWith("not authenticated");
  });

  it("should return valid true if it is valid token", async () => {
    mockedReq.headers = { authorization: "valid-token" };
    mockedVerifyToken.mockResolvedValue(true);

    await authCheck(mockedReq as Request, mockedRes as Response, mockedNext);
    expect(mockedVerifyToken).toHaveBeenCalledWith("valid-token");
    expect(mockedVerifyToken.mockResolvedValue).toBeTruthy();
    expect(mockedNext).toHaveBeenCalledTimes(1);
  });

  it("should return valid false if it is invalid token", async () => {
    mockedReq.headers = { authorization: "invalid-token" };
    mockedVerifyToken.mockResolvedValue(false);

    await authCheck(mockedReq as Request, mockedRes as Response, mockedNext);
    expect(mockedVerifyToken).toHaveBeenCalledWith("invalid-token");
    expect(mockedNext).toHaveBeenCalledTimes(1);
  });
});
