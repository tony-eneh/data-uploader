import express from "express";
import {
  getHandler,
  postHandler,
  putHandler,
  deleteHandler,
  csvPostHandler,
} from "./controllers/index.js";

export const router = express();

router.post("/:endpoint/csv", csvPostHandler);

router.get("/", getHandler);

router.put("/", putHandler);

router.post("/", postHandler);

router.delete("/", deleteHandler);
