import React from "react";
import axios from "axios";

export async function createGoal(props) {
  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/goal", {
        parentGoalId: props.parentGoalId,
        name: props.name,
        goalType: props.goalType,
        startDate: props.startDate,
        endDate: props.endDate,
        scheduleCreateDto: props.schedule,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function findGoalBy(props) {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/goal", {
        params: {
          goalType: props.goalType,
          searchDate: props.searchDate,
          detail: props.detail,
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        if (err.response.status === 404) reject(err);
      });
  });
}

export async function updateGoal(props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/goal/" + props.goalId, {
        name: props.name,
        isArchive: props.isArchive,
        startDate: props.startDate,
        endDate: props.endDate,
        scheduleUpdateDto: props.schedule,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
