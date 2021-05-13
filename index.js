const app = require("express")();
const fileUpload = require("express-fileupload");
const csvParser = require("csv-parser");
const fs = require("fs");
const axios = require("axios");
const bodyParser = require("body-parser");
const { doesNotMatch } = require("assert");
require("dotenv").config();

app.use(fileUpload());
app.use(bodyParser.json());

app.post("/:endpoint/csv", (req, res) => {
  console.log("request");
  const results = [];
  const filePath = `${__dirname}/tempfile.csv`;

  req.files.rafs
    .mv(filePath)
    .then(() => {
      const fileStream = fs.createReadStream(filePath);
      fileStream
        .pipe(csvParser())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", () => {
          console.log("end of reading file stream");
          sendToEcoleApi({
            items: results,
            res,
            endpoint: req.params.endpoint,
            cb: sendResponse,
          });
        });
    })
    .catch((e) => {
      console.log("error saving file in filesystem:", e);
    });
});

app.post("/:endpoint/json", (req, res) => {
  sendToEcoleApi({
    items: req.body,
    res,
    endpoint: req.params.endpoint,
    cb: sendResponse,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("express server listening on port 5001"));

function sendToEcoleApi({ items, res, endpoint, cb }) {
  console.log("process.env.API_URL", process.env.API_URL);
  authenticate().then((token) => {
    console.log("token before posting data:", token);
    // console.log("items to be posted", items);
    // send the data recursively starting from the first
    const config = { index: 0, items, token, res, endpoint, cb };
    postData(config);
  });
}

let sn = 0;
const uploads = [];
const errors = [];

function postData({ index, items, token, res, endpoint, cb }) {
  const item = items[index];

  if (!item) {
    console.log(`posted the last of ${sn + 1} items. Returning response now`);
    return cb({ uploads, errors, res });
  }

  if (item.phone === "") {
    //   avoid api 'phone cannot be empty' error
    delete item.phone;
  }
  if (item.contactEmail === "") {
    delete item.contactEmail;
  }
  axios
    .post(`${process.env.API_URL}/${endpoint}`, item, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(`response ${sn + 1}: ${res.data}`);
      uploads.push(res.data);
    })
    .catch((error) => {
      console.log("error creating record. Reason:", error.response.data);
      errors.push(error.response.data);
    })
    .finally(() => {
      if (sn < items.length) {
        sn++;
        // send next data
        return postData({ index: sn, items, res, endpoint, token, cb });
      }
    });
}

function authenticate() {
  return axios
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
        return data.payload.token;
      } else {
        console.log("authentication failed. res object=", res);
      }
    })
    .catch((e) => console.log("error occured:", e));
}

function sendResponse({ uploads, errors, res }) {
  res.send({
    success: !!uploads.length, // mark successful if at least 1 upload succeeded
    message: `successfully uploaded ${uploads.length} records. ${errors.length} requests failed`,
    payload: [...uploads],
    errors: [...errors],
  });
}
