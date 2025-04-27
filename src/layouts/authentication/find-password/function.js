import React from "react";
import axios from "axios";

export async function FindPassword(props) {
  return new Promise((resolve, reject) => {
    axios
      .put(
        "/planner/api/user/auth/find-password",
        {},
        {
          params: {
            userId: props.id,
            uuid: props.uuid,
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
