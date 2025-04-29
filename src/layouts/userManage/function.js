import React from "react";
import axios from "axios";

export async function findUsers(props) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user/manage/list", {
        params: {
          searchType: "name",
          searchValue: props.searchValue,
          page: props.page,
          size: props.size,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function banUser(uuid) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/user/${uuid}/ban`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
