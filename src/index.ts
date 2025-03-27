import express from "express";
import morgan from "morgan";
const app = express();
require("dotenv").config();
import authRoutes from "./routes/auth";
// import { generateTokens } from "./util/generateTokens";
import { authCheck } from "./middleware/authCheck";
import { prisma } from "./config/prismaInit";
import { logger } from "./util/logger";
import swaggerUI from "swagger-ui-express";
// import { openApiSpecs } from "./config/swagger";
import swaagerDoc from "./../swagger.json";

const PORT = process.env.PORT || 3001;

app.use(express.json()); // used for parsing json sent through req.body
app.use(express.urlencoded({ extended: true })); //middleware in Express.js used to handle form submissions sent in application/x-www-form-urlencoded format.
app.use(morgan("dev")); //logger for dev

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaagerDoc));

app.use("/api", authRoutes); // auth routes

/* protected route where authCheck middleware check for jwt token */
app.use("/api/protected", authCheck, (req, res) => {
  console.log("protected route");
  res.send("protected route");
});

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
  logger.info("connected to server");
  prisma
    .$connect()
    .then((res) => {
      console.log("db connected");
    })
    .catch((error) => {
      console.log("error in connecting DB: ", error);
      logger.error("failed to connect DB");
    });
});
