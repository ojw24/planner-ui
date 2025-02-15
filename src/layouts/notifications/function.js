import React from "react";
import axios from "axios";

export async function findNotices(props) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/notice", {
        params: {
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
