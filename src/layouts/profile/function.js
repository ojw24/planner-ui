import React from "react";
import axios from "axios";

export async function findMe() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user/profile/me")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {});
  });
}

export async function updateUser(props) {
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/user/" + props.uuid, {
        name: props.name,
        email: props.email,
        settingUpdateDto: props.setting,
        attcFileId: props.attcFileId,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function uploadFile(props) {
  const formData = new FormData();
  formData.append("name", props.name); // 일반 데이터 추가
  formData.append("file", props.file); // 파일 추가

  return new Promise((resolve, reject) => {
    axios
      .post("/planner/api/attached-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        resolve(response.data);
        return response.data;
      })
      .catch((err) => {
        reject(err);
        return err;
      });
  });
}
