import nodemailer from "nodemailer";

const mailService = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export { mailService };
