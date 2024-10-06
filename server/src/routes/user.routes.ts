import express from "express";
import { getUserById, getUsers } from "../controllers/user.controller";

const router = express.Router();

export default (mainRouter: express.Router) => {
  router.get("/", getUsers);
  router.get("/:id", getUserById);

  mainRouter.use("/user", router);
};
