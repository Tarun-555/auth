import { generateOTP } from "./otpGenerator";

describe("test suite for otp utility func", () => {
  beforeEach(() => {
    (Math.random = jest.fn().mockReturnValue(0.1)), // mocking random to set 0.1
      (Math.floor = jest.fn().mockReturnValue(1)); // mocking floor to set index 1
  });
  it("should generate OTP: ", async () => {
    const otp = await generateOTP();
    console.log(otp);
    expect(otp).toHaveLength(5);
    expect(otp).toBe("11111");
  });
});
