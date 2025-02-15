import React from "react";
import axios from "axios";

async function LogOut() {
  return new Promise((resolve, reject) => {
    axios
      .delete("/planner/api/auth/logout")
      .then((response) => {
        window.localStorage.removeItem("jwt");

        document.location.href = "/";

        resolve(response);
        return response;
      })
      .catch((err) => {});
  });
}

export default LogOut;
