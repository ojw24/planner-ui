import React from "react";
import axios from "axios";

export async function FindPassword(id) {
  return new Promise((resolve, reject) => {
    axios
      .put(
        "/planner/api/user/auth/find-password",
        {},
        {
          params: {
            userId: id,
          },
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
