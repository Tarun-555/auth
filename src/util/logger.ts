import winston from "winston";

const { combine, colorize, timestamp, printf, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // upto which level we want to log
  format: combine(
    colorize({ level: true }), //sets color for log level and message
    timestamp({ format: "DD-MM-YYYY hh:mm:ss:SSS A" }), // logs timestamp in given format
    align(),
    printf((info) => `[${info.timestamp}]: ${info.level} - ${info.message}`) // format in which you see logs in console
  ),
  transports: [new winston.transports.Console()], // .Console tells to send logs to console, we can move to file etc
});

export { logger };
