import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import { authenticate } from "./middleware.js";
import { router } from "./routes.js";

dotenv.config();
const app = express();

app.use(fileUpload());
app.use(bodyParser.json());

app.use(authenticate);

app.use("/", router);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`express server listening on port ${PORT}`));
