import React from "react";
import axios from "axios";

export async function createBoardMemo(boardId, props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/board/" + boardId + "/memo", {
        title: props.title,
        content: props.content,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

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

export async function findBoardMemo(boardId, boardMemoId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`/planner/api/board/${boardId}/memo/${boardMemoId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function updateBoardMemo(boardId, props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/board/" + boardId + "/memo/" + props.boardMemoId, {
        title: props.title,
        content: props.content,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteBoardMemo(boardId, boardMemoId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/board/${boardId}/memo/${boardMemoId}`)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}
