import React from "react";
import axios from "axios";

export async function createSchedule(props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/schedule", {
        name: props.name,
        startDtm: props.startDtm,
        endDtm: props.endDtm,
        location: props.location,
        isAll: props.isAll,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function findSchedules(searchDate) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/schedule", {
        params: {
          searchDate: searchDate,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function updateSchedule(scheduleId, props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/schedule/" + scheduleId, {
        name: props.name,
        startDtm: props.startDtm,
        endDtm: props.endDtm,
        location: props.location,
        isAll: props.isAll,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteSchedule(scheduleId) {
  return new Promise((resolve, reject) => {
    axios
      .delete("/planner/api/schedule/" + scheduleId)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function createScheduleShareRequest(scheduleId, props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/schedule/" + scheduleId + "/share-requset", {
        targetIds: props.targetIds,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function findScheduleShareRequests() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/schedule/share-requset")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function approveScheduleShareRequest(scheduleId, reqId, approve) {
  return new Promise((resolve, reject) => {
    axios
      .put(`/planner/api/schedule/${scheduleId}/share-requset/${reqId}`, null, {
        params: { approve: approve },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function deleteScheduleShare(scheduleId) {
  return new Promise((resolve, reject) => {
    axios
      .delete(`/planner/api/schedule/${scheduleId}/share`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}
