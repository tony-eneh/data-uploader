import * as api from "../api-service.js";
import { sendResponse } from "../helpers.js";

export async function post(req, res) {
  console.log("about to post data");
  const uploads = [];
  const errors = [];
  const { endpoint, payload } = req.body;

  for (let data of payload) {
    try {
      const response = await api.post({ endpoint, data });
      uploads.push(response);
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("upload error:", e);
      errors.push(e);
    }
  }
  sendResponse({ payload: uploads, errors, res });
}
