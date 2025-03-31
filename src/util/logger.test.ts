import winston from "winston";
import { logger } from "./logger";

jest.mock("winston", () => {
  return {
    createLogger: jest.fn(),
  };
});

const mockedWinston = winston as jest.Mocked<typeof winston>;

describe("logger instance test suite", () => {
  let mocklogger;
  beforeEach(() => {
    mocklogger = {};
  });

  afterAll(() => {
    mocklogger = {};
  });
  it("should create logger instance", async () => {
    mocklogger = mockedWinston.createLogger({ level: "info" });
    expect(mockedWinston.createLogger).toHaveBeenCalledTimes(1);
  });
});
