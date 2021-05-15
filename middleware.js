import { storeToken } from "./helpers.js";
import axios from "axios";

export function authenticate(req, res, next) {
  axios
    .post(process.env.LOGIN_URL, {
      email: process.env.EMAIL,
      password: process.env.PASSWORD,
    })
    .then(({ data }) => {
      if (data.success) {
        console.log(
          "API authentication successfull. Token",
          data.payload.token
        );
        storeToken(data.payload.token);
        next();
      } else {
        console.log("authentication failed. res object=", res);
        res.send(data);
      }
    })
    .catch((e) => {
      console.log("error occured:", e);
      res.send({
        success: false,
        message: `Auth error: ${e.message}`,
      });
    });
}
