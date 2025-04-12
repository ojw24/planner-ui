import React from "react";
import axios from "axios";

export async function createNotice(props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/notice", {
        title: props.title,
        content: props.content,
        isTop: props.isTop,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

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

export async function findNotice(noticeId) {
  return new Promise((resolve, reject) => {
    axios
      .get(`/planner/api/notice/${noticeId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function updateNotice(props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/notice/" + props.noticeId, {
        title: props.title,
        content: props.content,
        isTop: props.isTop,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteNotice(noticeId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/notice/${noticeId}`)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}
