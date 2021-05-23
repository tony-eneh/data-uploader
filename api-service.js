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
  console.log("api.post ran");
  const url = `${process.env.API_URL}/${endpoint}`;
  const payload = [];
  const errors = [];
  for (let item of data) {
    try {
      const response = await axios.post(url, item, httpOptions());
      // if an error object, throw up to catch block
      if (response.response) {
        throw new Error(response.response);
      }
      // else accept response
      payload.push(response.data);
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("Error while posting this data:", e);
      errors.push(e);
    }
  }
  return { payload, errors };
}

export async function put({ endpoint, data }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  const payload = [];
  const errors = [];
  for (let item of data) {
    const id = item.id;
    delete item.id;
    try {
      const response = await axios.put(`${url}/${id}`, item, httpOptions());
      // if an error object, throw up to catch block
      if (response.response) {
        throw new Error(response.response);
      }
      // else accept response
      payload.push(response.data);
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("Error while updating this data:", e);
      errors.push(e);
    }
  }
  return { payload, errors };
}

export async function del({ endpoint, data }) {
  const url = `${process.env.API_URL}/${endpoint}`;
  const payload = [];
  const errors = [];
  for (let item of data) {
    const id = item.id;
    delete item.id;
    try {
      const response = await axios.delete(`${url}/${id}`, httpOptions());
      // if an error object, throw up to catch block
      if (response.response) {
        throw new Error(response.response);
      }
      // else accept response
      payload.push(response.data);
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("Error while deleting this data:", e);
      errors.push(e);
    }
  }
  return { payload, errors };
}
