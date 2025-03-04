import React from "react";
import axios from "axios";

export async function createFriendGroup(name) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/friend/group", {
        name: name,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function findFriendGroups() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/friend/group")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function updateFriendGroup(friendGrpId, props) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/friend/group/${friendGrpId}`, {
        name: props.name,
        ord: props.ord,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteFriendGroup(friendGrpId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/friend/group/${friendGrpId}`, {
        params: {
          cascade: false,
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function findFriends() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/friend")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function updateFriend(friendId, props) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/friend/${friendId}`, {
        friendGrpId: props.friendGrpId,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteFriend(friendId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/friend/${friendId}`)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {});
  });
}

export async function findSimpleUsers(name) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user", {
        params: {
          searchType: "name",
          searchValue: name,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function createFriendRequest(targetId) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/friend/request", {
        targetId: targetId,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function findFriendRequests() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/friend/request")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function approveFriendRequest(friendReqId, approve) {
  return new Promise((resolve, reject) => {
    axios
      .put(
        `/planner/api/friend/request/${friendReqId}`,
        {},
        {
          params: {
            approve: approve,
          },
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        const status = err.response.status;
        if (status === 400 || status === 404) reject(err);
      });
  });
}
