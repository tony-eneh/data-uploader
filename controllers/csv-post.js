import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import csv from "csv-parser";
import { sendResponse, removeEmptyFields } from "../helpers.js";
import * as api from "../api-service.js";

// get the current directory. This is important since this project is on es6 and doesn't use a transpiler
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function csvPost(req, res) {
  console.log("about to convert csv data before posting");

  const filePath = `${__dirname}/tempfile.csv`;
  const items = [];
  const { endpoint } = req.params;
  let response;

  try {
    await req.files.csv.mv(filePath);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => items.push(data))
      .on("end", async () => {
        console.log("contents of csv file before sending to API", items);
        console.log("endpoint:", endpoint);
        const data = removeEmptyFields(items);
        response = await api.post({ endpoint, data });

        sendResponse(response, res);
      });
  } catch (e) {
    console.log("upload error:", e);
    const errorResponse = {
      success: false,
      message: `some unexpected error occured: ${e}`,
    };
    sendResponse(errorResponse, res);
  }
}
