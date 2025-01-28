import React, { useState } from "react";
import axios from "axios";
// import PopUp from "./PopUp";

const Interceptor = () => {
  const [popupProps, setPopUpProps] = useState({ open: false, type: "", msg: "" });
  // 1. jwt check
  // 2. 만료 시, login relocate.
  //let jwt = sessionStorage.getItem("jwt") ? sessionStorage.getItem("jwt") : '';

  // 에러 axios 중복 호출 방지 flag
  // (component에서 useEffect 등을 통해 axios 요청을 2개 이상 하는 경우, 요청이 끝난 후 차례대로 다음 요청을 하지 않기 때문에(동시 요청) )
  let flag = false;

  axios.create({
    baseURL: "",
    timeout: 5000,
  });

  const closeFunc = () => {
    setPopUpProps({ ...popupProps, open: !popupProps.open });
    if (popupProps.code != 500) {
      window.location.href = "/";
    }
  };

  // request interceptor
  axios.interceptors.request.use(
    (config) => {
      // 요청마다 토큰 세팅을 위해 request 내로 이동(위에서는 렌더링될 때 시점의 jwt가 세팅되므로)
      // 세션 스토리지에 jwt 없을 시 null로 세팅되는데 api에서 문자열 "null"로 인식해서, 없을 경우 ''로 세팅
      let jwt = localStorage.getItem("jwt") ? localStorage.getItem("jwt") : "";
      config.baseURL = "";
      config.headers["Authorization"] = `${jwt}`;
      config.headers["Content-Type"] = "application/json";

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

      if (!flag) {
        if (error.response.status === 403) {
          originalRequest._retry = true;
          axios
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
                type: "오류",
                code: 400,
                msg: "세션이 만료되었습니다. 다시 로그인 해주세요.",
              });
            });
        } else if (error.response.status === 401) {
          window.localStorage.removeItem("jwt");
          document.location.href = "/";
          setPopUpProps({
            ...popupProps,
            open: true,
            type: "오류",
            code: 400,
            msg: "토큰 없이 요청했습니다. 다시 로그인 해주세요.",
          });
        } else {
          setPopUpProps({
            ...popupProps,
            open: true,
            type: "오류",
            code: 500,
            msg: "서버 오류가 발생했습니다.\r\n관리자에게 문의해주세요.",
          });
        }

        if (window.location.pathname !== "/") {
          flag = !flag;
        }

        return Promise.reject(error);
      }
    }
  );
  return (
    <div>
      {/*{popupProps.open && <PopUp closeModal={closeFunc} type={popupProps.type} msg={popupProps.msg}/>}*/}
    </div>
  );
};

export default Interceptor;
