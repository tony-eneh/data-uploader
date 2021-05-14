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

app.put("/student-classes", async (req, res) => {
  console.log("about to update student classes");
  const successfulUpdates = [];
  const errors = [];

  const institutions = ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"];
  const levels = [1, 2, 3, 4, 5, 6];

  for (let institution of institutions) {
    for (let level of levels) {
      switch (institution) {
        case "CRECHE":
          //  no CRECHE 2 class
          if (level > 1) return;
        case "NURSERY":
          // no NURSERY 4 class
          if (level > 3) return;
      }

      // fetch a classe
      const classeResponse = await axios.get(
        `${process.env.API_URL}/${classe}?level=${level}&institution=${institution}&subclass=R&fields=id`
      );
      const classe = classeResponse.payload[0];

      // fetch students that belong to that classe
      const studentResponse = await axios.get(
        `${process.env.API_URL}/${student}?level=${level}&institution=${institution}&fields=id`
      );
      const students = studentResponse.payload;

      // assign the classe id to the each of the student's classe property
      const classedStudents = students.map(
        (student) => (student.classe = classe.id)
      );

      // send an update request to the API
      try {
        const apiResponse = await axios.put(
          `${process.env.API_URL}/student/batch`,
          classedStudents
        );
        successfulUpdates.push(apiResponse);
      } catch (err) {
        errors.push(err);
      }
    }
  }
  res.send({
    success: !!successfulUpdates.length, // mark successful if at least 1 update succeeded
    message: `successfully updated ${successfulUpdates.length} records. ${errors.length} requests failed`,
    payload: [...successfulUpdates],
    errors: [...errors],
  });
});

app.post("/:endpoint/csv", (req, res) => {
  console.log("request");
  const results = [];
  const filePath = `${__dirname}/tempfile.csv`;

  req.files.csv
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
