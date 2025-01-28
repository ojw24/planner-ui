import React from "react";
import axios from "axios";

async function PostLogin(props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/auth/login", {
        userId: props.id,
        password: props.password,
      })
      .then((response) => {
        window.localStorage.setItem("jwt", "Bearer " + response.data.accessToken);

        document.location.href = "/";

        resolve(response.data);
        return response.data;
      })
      .catch((err) => {
        reject(err);
        return err;
      });
  });
}

export default PostLogin;
