import React from "react";
import axios from "axios";

export async function SignUp(props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/user", {
        userId: props.id,
        password: props.password,
        name: props.name,
        email: props.email,
      })
      .then((response) => {
        resolve(response.data);
        return response.data;
      })
      .catch((err) => {
        reject(err);
        return err;
      });
  });
}

export async function DupCheck(id) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user/duplicate-check", {
        params: {
          userId: id,
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
