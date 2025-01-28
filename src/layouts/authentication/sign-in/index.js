/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useRef } from "react";
import { useFormik } from "formik";

// react-router-dom components
import { Link, Navigate, Route, Routes } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import brandWhite from "assets/images/logo-ct.png";

import * as Yup from "yup";

import PostLogin from "./function";

import themeDark from "../../../assets/theme-dark";
import theme from "../../../assets/theme";
import CssBaseline from "@mui/material/CssBaseline";

import Dashboard from "../../dashboard";

function Basic() {
  let isLogin = false;

  if (localStorage.getItem("jwt")) {
    isLogin = true;
  }

  const [login, setLogin] = useState({
    id: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      id: "",
      password: "",
    },
    validationSchema: Yup.object({
      id: Yup.string().max(255).required("* 아이디를 입력하세요"),
      password: Yup.string().max(255).required("* 비밀번호를 입력하세요"),
    }),
    onSubmit: () => {
      handleSubmit();
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (login.id === null || login.id === "") {
      // setPopUpProps({ ...popupProps, open: true, type: "알림", msg: "아이디를 입력하세요" });
      // textRef.current[0].focus();
    } else if (login.password === null || login.password === "") {
      // setPopUpProps({ ...popupProps, open: true, type: "알림", msg: "비밀번호를 입력하세요." });
      // textRef.current[1].focus();
    } else {
      // sha 256 encode && postLogin
      PostLogin(login).catch((rej) => {
        // setPopUpProps({ ...popupProps, open: true, type: "오류", msg: rej.response.data.message });
      });
    }
  }

  return (
    <div>
      {isLogin ? (
        <Routes>
          <Route exact path="/dashboard" element=<Dashboard /> key="sign-in" />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      ) : (
        <BasicLayout image={bgImage}>
          <Card>
            <MDBox
              variant="gradient"
              bgColor="dark"
              borderRadius="lg"
              coloredShadow="info"
              mx={2}
              mt={-3}
              p={2}
              mb={1}
              textAlign="center"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <MDTypography
                variant="h4"
                fontWeight="medium"
                color="white"
                mt={2}
                mb={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <MDBox component="img" src={brandWhite} alt="Brand" width="1.75rem" mx={0.5} />
                Planner
              </MDTypography>
            </MDBox>
            <MDBox pt={4} pb={3} px={3}>
              <MDBox component="form" role="form" onSubmit={handleSubmit}>
                <MDBox mb={2}>
                  <MDInput
                    error={Boolean(formik.touched.id && formik.errors.id)}
                    onBlur={formik.handleBlur}
                    helperText={formik.touched.id && formik.errors.id}
                    value={formik.values.id}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setLogin({
                        ...login,
                        id: e.target.value,
                      });
                    }}
                    type="text"
                    label="ID"
                    name="id"
                    id="id"
                    fullWidth
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    error={Boolean(formik.touched.password && formik.errors.password)}
                    onBlur={formik.handleBlur}
                    helperText={formik.touched.password && formik.errors.password}
                    value={formik.values.password}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setLogin({
                        ...login,
                        password: e.target.value,
                      });
                    }}
                    type="password"
                    label="Password"
                    name="password"
                    id="password"
                    fullWidth
                  />
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    fullWidth
                    sx={{
                      fontFamily: "'Pretendard-Bold', sans-serif",
                      fontSize: "1vw",
                    }}
                  >
                    로그인
                  </MDButton>
                </MDBox>
                <MDBox mt={3} mb={1} textAlign="center">
                  <MDTypography variant="button" color="text">
                    아직 계정이 없다면?&nbsp;{" "}
                    <MDTypography
                      component={Link}
                      to="/authentication/sign-up"
                      variant="button"
                      color="info"
                      fontWeight="medium"
                      textGradient
                      sx={{
                        fontFamily: "'Pretendard-Regular', sans-serif",
                      }}
                    >
                      회원가입
                    </MDTypography>
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </BasicLayout>
      )}
    </div>
  );
}

export default Basic;
