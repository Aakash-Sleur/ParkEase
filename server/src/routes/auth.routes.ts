import express from "express";
import { login, logout, register } from "../controllers/auth.controller";

export default (router: express.Router) => {
  router.post("/register", register);
  router.post("/login", login);
  router.post("/logout", logout);
};
