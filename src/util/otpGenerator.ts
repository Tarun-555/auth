const generateOTP = () => {
  let numbers = "0123456789";
  let otp = "";
  for (let i = 0; i < 5; i++) {
    otp += numbers[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export { generateOTP };
