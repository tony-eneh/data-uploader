import * as api from "../api-service.js";
import { sendResponse, getClasses } from "../helpers.js";

export async function updateStudentsClasse(req, res) {
  console.log("about to update student classes");
  const successfulUpdates = [];
  const errors = [];
  const classes = getClasses();

  let classedStudents = [];

  for (let { level, institution } of classes) {
    try {
      // fetch the classe
      const classeResponse = await api.get({
        endpoint: `/classe?level=${level}&institution=${institution}&subclass=R&fields=id`,
        res,
      });
      const classe = classeResponse.payload[0];

      console.log("fetched a classe. About to fetch students");

      // fetch students that belong to that classe
      const studentResponse = await api.get({
        endpoint: `/student?level=${level}&institution=${institution}&fields=id`,
        res,
      });
      const students = studentResponse.payload;

      // assign the classe id to the each of the student's classe property
      classedStudents = students.map((student) => {
        student.classe = classe.id;
        return student;
      });
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("data fetch error:", e);
      errors.push(e);
    }

    // send an update request to the API
    try {
      console.log(
        "about to send the following student updates:",
        classedStudents
      );
      const apiResponse = await api.put({
        endpoint: `/student`,
        data: classedStudents,
      });
      successfulUpdates.push(apiResponse);
    } catch (err) {
      const e = err.response ? err.response.data : err;
      console.log("update error:", e);
      errors.push(e);
    }
  }

  sendResponse({ payload: successfulUpdates, errors, res });
}

export async function updateClassesClasseFee(req, res) {
  console.log("about to update classe fees");
  let successfulUpdates = [];
  let errors = [];

  try {
    // PRIMARY SCHOOL FEE STRATEGY
    const phrases = [
      "Creche",
      "PG",
      "Nursery 1",
      "Nursery 2",
      "Nursery 3",
      "Primary 1",
      "Primary 2",
      "Primary 3",
      "Primary 4",
      "Primary 5",
      "Primary 6",
    ];

    const classes = {};
    const fees = {};
    const classeFees = [];
    // for each phrase
    for (let phrase of phrases) {
      // get all classes whose description contains phrase
      const { payload: classePayload } = await api.get({
        endpoint: `/classe?name=/${phrase}/&fields=id,name`,
        res,
      });
      classes[phrase] = classePayload;

      // get all fees whose description contains same phase
      const { payload: feePayload } = await api.get({
        endpoint: `/fee?description=/${phrase}/&fields=id`,
        res,
      });
      fees[phrase] = feePayload;

      const theFees = fees[phrase].map((f) => f.id);
      // create a classeFee with the fees
      const {
        payload: [classeFeePayload],
      } = await api.post({
        endpoint: `/classe-fee`,
        data: [{ fees: theFees, classeName: phrase }],
      });
      console.log("newly created classeFee:", classeFeePayload);
      classeFees.push(classeFeePayload.payload);
    }

    //
    console.log("classes:", classes);
    console.log("classeFees", classeFees);

    // get a flat array of all classes
    let b = [];
    const a = Object.values(classes);
    console.log("a arrays,", a);
    a.forEach((v) => (b = [...b, ...v]));
    // console.log("classes as a flat array:", b);

    // assign classeFee to each classe
    console.error(
      "classeFees before filtering:",
      classeFees.map((f) => f.classeName)
    );
    for (let classe of b) {
      const clsFs = classeFees.filter((clsf) =>
        classe.name.includes(clsf.classeName)
      );
      console.log("classeFees after filter for classe", classe, clsFs);
      if (clsFs[0]) {
        classe.classeFee = clsFs[0].id;
      } else {
        console.error(
          "couldn't find matching classe fee for this class:",
          classe
        );
      }
    }
    console.log("array of classes before posting", b);

    const { payload, errors: errs } = await api.put({
      endpoint: `/classe`,
      data: b,
    });

    successfulUpdates = payload;
    errors = errs;
  } catch (error) {
    if (error.response) {
      errors.push(error.response);
    } else {
      errors.push(error);
    }
    console.error("error occured while putting data:", error);
  }
  sendResponse({ payload: successfulUpdates, errors }, res);
  // [
  // classeFee.fees = fees
  // classe.classeFee = classeFee

  // SECONDARY SCHOOL FEE STRATEGY
  // TO BE DONE DONE MANUALLY VIA POSTMAN
  // ("BOARDING STUDENT", "DAY STUDENT")
  // ];
  // for each phrase
  // create a classeFee
  // boardingClasseFee.fees = [...]
  // dayClasseFee.fees = [...]
}
