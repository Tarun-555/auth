import winston from "winston";
import { logger } from "./logger";

jest.mock("winston");

const mockedWinston = winston as jest.Mocked<typeof winston>;

describe("logger instance test suite", () => {
  let mocklogger;
  beforeEach(() => {
    mocklogger = {};
  });
  it("should create logger instance", async () => {
    mocklogger = mockedWinston.createLogger({ level: "info" });
    console.log(mockedWinston.createLogger, mocklogger);
    expect(mocklogger).toBeInstanceOf(mockedWinston);
  });
});
