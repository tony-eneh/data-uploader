import * as api from "../api-service.js";
import { sendResponse } from "../helpers.js";

export async function get(req, res) {
  const { endpoint } = req.params;
  try {
    const response = await api.get({ endpoint, res });
    sendResponse({ payload: response.data, res });
  } catch (e) {
    const error = e.response ? e.response.data : e;
    console.log("error in get API:", error);
    sendResponse({ errors: [error], res });
  }
}
