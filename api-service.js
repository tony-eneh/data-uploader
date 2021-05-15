import { httpOptions, sendResponse } from "./helpers.js";
import axios from "axios";

export async function get({ endpoint, res }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  try {
    const response = await axios.get(url, httpOptions());
    // return the reponse back to the caller
    return response.data;
  } catch (error) {
    console.log("Error while fetching this data:", error.response.data);
    sendResponse(error.response.data, res);
  }
}

export async function post({ endpoint, data }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  const uploads = [];
  const errors = [];
  for (let item of data) {
    try {
      const response = await axios.post(url, item, httpOptions());
      uploads.push(response.data);
    } catch (e) {
      console.log("Error while posting this data:", e.response.data);
      errors.push(e.response.data);
    }
  }
  return { uploads, errors };
}

export async function put({ endpoint, data }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  const updates = [];
  const errors = [];
  for (let item of data) {
    const id = item.id;
    delete item.id;
    try {
      const response = await axios.put(`${url}/${id}`, item, httpOptions());
      updates.push(response.data);
    } catch (e) {
      console.log("Error while updating this data:", e.response.data);
      errors.push(e.response.data);
    }
  }
  return { updates, errors };
}

export async function del({ endpoint }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  const deletes = [];
  const errors = [];
  for (let item of data) {
    const id = item.id;
    delete item.id;
    try {
      const response = await axios.delete(`${url}/${id}`, httpOptions());
      deletes.push(response.data);
    } catch (e) {
      console.log("Error while deleting this data:", e.response.data);
      errors.push(e.response.data);
    }
  }
  return { deletes, errors };
}
