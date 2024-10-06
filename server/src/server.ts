import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";
import * as http from "http";
import routes from "./routes";
import "./cron/cron-job";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

const server = http.createServer(app);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Ensure routes is invoked as a function
app.use("/", routes());

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
