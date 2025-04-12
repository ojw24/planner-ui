import React from "react";
import axios from "axios";

export async function FindId(email) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user/auth/find-id", {
        params: {
          email: email,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
