import express from "express";
const app = express();
require("dotenv").config();
import routes from "./routes/login";
// import { generateTokens } from "./util/generateTokens";
import { authCheck } from "./middleware/authCheck";

const PORT = process.env.PORT || 3001;

app.use(express.json()); // used for parsing json sent through req.body
app.use(express.urlencoded({ extended: true })); //middleware in Express.js used to handle form submissions sent in application/x-www-form-urlencoded format.

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

/* protected route where authCheck middleware check for jwt token */
app.use("/api/protected", authCheck, (req, res) => {
  console.log("protected route");
  res.send("protected route");
});

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});
