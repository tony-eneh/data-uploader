import express from "express";
import {
  getHandler,
  postHandler,
  updateStudentsClasse,
  updateClassesClasseFee,
  deleteHandler,
  csvPostHandler,
} from "./controllers/index.js";

export const router = express();

router.post("/:endpoint/csv", csvPostHandler);

router.get("/:endpoint", getHandler);

router.put("/student", updateStudentsClasse);

router.put("/classe", updateClassesClasseFee);

router.post("/:endpoint", postHandler);

router.delete("/:endpoint", deleteHandler);
