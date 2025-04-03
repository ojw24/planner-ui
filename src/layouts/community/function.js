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

export async function createBoardMemoComment(boardId, boardMemoId, props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/board/" + boardId + "/memo/" + boardMemoId + "/comment", {
        content: props.content,
        parentCommentId: props.parentCommentId,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function findBoardMemoComments(boardId, boardMemoId, props) {
  return new Promise((resolve, reject) => {
    axios
      .get(`/planner/api/board/${boardId}/memo/${boardMemoId}/comment`, {
        params: {
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

export async function findBoardCommentOrder(boardMemoId, boardCommentId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`/planner/api/board/memo/${boardMemoId}/comment/${boardCommentId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function updateBoardMemoComment(boardId, boardMemoId, boardCommentId, content) {
  return new Promise((resolve, reject) => {
    axios
      .put(
        "/planner/api/board/" + boardId + "/memo/" + boardMemoId + "/comment/" + boardCommentId,
        {
          content: content,
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteBoardMemoComment(boardId, boardMemoId, boardMemoCommentId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/board/${boardId}/memo/${boardMemoId}/comment/${boardMemoCommentId}`)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}
