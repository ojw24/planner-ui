import React, { useState } from "react";
import axios from "axios";
import MDSnackbar from "../../components/MDSnackbar";

const Interceptor = () => {
  const ignores = ["/authentication/sign-in"];
  const [popupProps, setPopUpProps] = useState({
    redirect: false,
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  function closePopUp(redirect) {
    setPopUpProps({ ...popupProps, open: false });
    if (redirect) window.location.href = "/";
  }

  let reload = false;

  axios.create({
    baseURL: "",
    timeout: 5000,
  });

  // request interceptor
  axios.interceptors.request.use(
    (config) => {
      // 요청마다 토큰 세팅을 위해 request 내로 이동(위에서는 렌더링될 때 시점의 jwt가 세팅되므로)
      // 세션 스토리지에 jwt 없을 시 null로 세팅되는데 api에서 문자열 "null"로 인식해서, 없을 경우 ''로 세팅
      let jwt = localStorage.getItem("jwt") ? localStorage.getItem("jwt") : "";
      config.baseURL = "";
      config.headers["Authorization"] = `${jwt}`;
      config.headers["Content-Type"] = config.headers["Content-Type"]
        ? config.headers["Content-Type"]
        : "application/json";

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // response interceptor
  axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      const originalRequest = error.config;
      if (originalRequest._retry) {
        return Promise.reject(error); // 재시도한 경우 에러 리턴
      }

      if (
        error.response.status === 403 &&
        error.response.data.message === "Access token is expired. Please refresh."
      ) {
        originalRequest._retry = true;
        return axios
          .post(
            "/planner/api/auth/refresh",
            {},
            {
              headers: { "Content-Type": `application/json` },
            }
          )
          .then((refreshRes) => {
            const newAccess = "Bearer " + refreshRes.data.data.accessToken;

            window.localStorage.setItem("jwt", newAccess);

            originalRequest.headers["Authorization"] = newAccess;
            return axios(originalRequest);
          })
          .catch((err) => {
            window.localStorage.removeItem("jwt");
            setPopUpProps({
              ...popupProps,
              open: true,
              title: "세션 만료",
              icon: "warning",
              color: "warning",
              content: "세션이 만료되었습니다. 다시 로그인 해주세요.",
              redirect: true,
            });
          });
      } else if (error.response.status === 500) {
        setPopUpProps({
          ...popupProps,
          icon: "warning",
          color: "error",
          open: true,
          title: "오류",
          content: "서버 오류가 발생했습니다.\r\n관리자에게 문의해주세요.",
          redirect: false,
        });
      } else if (
        error.response.status === 401 &&
        error.response.data.message !== "아이디 혹은 비밀번호가 올바르지 않습니다."
      ) {
        if (error.response.data.message === "User logged out or banned") {
          window.localStorage.removeItem("jwt");
        }
        setPopUpProps({
          ...popupProps,
          icon: "warning",
          color: "error",
          open: true,
          title: "오류",
          content: "잘못된 요청입니다.",
          redirect: error.response.data.message === "User logged out or banned",
        });
      } else if (error.response.status === 422) {
        setPopUpProps({
          ...popupProps,
          icon: "warning",
          color: "error",
          open: true,
          title: "오류",
          content: "입력값이 잘못되었습니다.",
          redirect: false,
        });
      }

      if (!ignores.includes(window.location.pathname)) {
        reload = !reload;
      }

      return Promise.reject(error);
    }
  );
  return (
    <>
      {popupProps.open && (
        <MDSnackbar
          color={popupProps.color}
          icon={popupProps.icon}
          title={popupProps.title}
          content={popupProps.content}
          open={popupProps.open}
          onClose={() => closePopUp(popupProps.redirect)}
          close={() => closePopUp(popupProps.redirect)}
          bgWhite
        />
      )}
    </>
  );
};

export default Interceptor;
