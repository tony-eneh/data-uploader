import * as api from "../api-service.js";
import { sendResponse } from "../helpers.js";

export async function post(req, res) {
  console.log("about to post data");
  const { endpoint } = req.params;
  let response;

  try {
    response = await api.post({ endpoint, data: req.body });
  } catch (e) {
    console.log("upload error:", e);
  }
  sendResponse(response, res);
}
