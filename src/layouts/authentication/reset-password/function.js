import React from "react";
import axios from "axios";

export async function ResetPassword(props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/user/auth/password", {
        userId: props.id,
        password: props.password,
        key: props.key,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
