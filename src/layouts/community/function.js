import React from "react";
import axios from "axios";

export async function findBoardMemos(props) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/board/" + props.boardId + "/memo", {
        params: {
          searchType: props.searchType,
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
