import React from "react";
import axios from "axios";

export async function FindMe() {
  return new Promise((resolve, reject) => {
    axios
      .get("/planner/api/user/profile/me")
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function UpdateUser(props) {
  console.log("attttc : " + props.fileId);
  return new Promise((resolve, reject) => {
    axios
      .put("/planner/api/user/" + props.userId, {
        name: props.name,
        email: props.email,
        attcFileId: props.fileId,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function UploadFile(props) {
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
