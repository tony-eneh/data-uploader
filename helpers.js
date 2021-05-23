let token;

export function sendResponse({ payload, errors }, res) {
  res.send({
    success: !!payload.length, // mark successful if at least 1 request succeeded
    message: `successfully uploaded ${payload.length} records. ${errors.length} requests failed`,
    payload,
    errors,
  });
}

export function httpOptions() {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export function storeToken(t) {
  token = t;
}

export function getClasses() {
  const classes = [];
  const institutions = ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"];
  const levels = [1, 2, 3, 4, 5, 6];

  institutions.forEach((institution) => {
    levels.forEach((level) => {
      switch (institution) {
        case "CRECHE":
          //  no CRECHE 2 class
          if (level > 1) return;
        case "NURSERY":
          // no NURSERY 4 class
          if (level > 3) return;
      }

      classes.push({ level, institution });
    });
  });
  return classes;
}

export function removeEmptyFields(items) {
  return items.map((item) => {
    Object.entries(item).forEach(([k, v]) => {
      if (v === "") delete item[k];
    });
    return item;
  });
}
