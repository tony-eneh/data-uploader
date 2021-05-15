import * as api from "../api-service.js";
import { sendResponse, getClasses } from "../helpers.js";

export async function put(req, res) {
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
