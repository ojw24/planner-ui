import React from "react";
import axios from "axios";

export async function LogOut() {
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

export async function createBoardMQ(uuid) {
  return new Promise((resolve, reject) => {
    axios
      .post(`/planner/api/board/mq?uuid=${uuid}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function createFriendMQ(uuid) {
  return new Promise((resolve, reject) => {
    axios
      .post(`/planner/api/friend/mq?uuid=${uuid}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function createScheduleMQ(uuid) {
  return new Promise((resolve, reject) => {
    axios
      .post(`/planner/api/schedule/mq?uuid=${uuid}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function getMqConfig() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/common/mq-config")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function deleteQueue(uuid) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/common/mq-queue?name=${uuid}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function findBoardCommentNotifications() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/board/memo/comment/notification")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function findScheduleShareRequestNotifications() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/schedule/share-requset/notification")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function findFriendRequestNotifications() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/friend/request/notification")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function checkBoardCommentNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/board/memo/comment/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function checkScheduleShareRequestNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/schedule/share-requset/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function checkFriendRequestNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/friend/request/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteBoardCommentNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/board/memo/comment/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteScheduleShareRequestNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/schedule/share-requset/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteFriendRequestNotification(notiId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/friend/request/notification/${notiId}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}
