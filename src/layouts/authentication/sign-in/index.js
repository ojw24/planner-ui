import { useState, useRef } from "react";
import { useFormik } from "formik";

// react-router-dom components
import { Link, Navigate, Route, Routes } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Dashboard from "../../dashboard";
import MDSnackbar from "../../../components/MDSnackbar";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-basic.jpeg";
import brandWhite from "assets/images/logo-ct.png";

import * as Yup from "yup";

import SignIn from "./function";

function Basic() {
  let isLogin = false;

  if (localStorage.getItem("jwt")) {
    isLogin = true;
  }

  const [login, setLogin] = useState({
    id: "",
    password: "",
  });

  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

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

    if (!login.id) {
      formik.setFieldTouched("id", true);
      textRef.current[0]?.focus();
    } else if (!login.password) {
      formik.setFieldTouched("password", true);
      textRef.current[1]?.focus();
    } else {
      SignIn(login).catch((rej) => {
        if (rej.response.data.message) {
          setPopUpProps({
            ...popupProps,
            open: true,
            title: "로그인 실패",
            content: rej.response.data.message,
          });
        }
      });
    }
  }

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  return (
    <>
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
                <MDBox mb={2} height="3.2rem">
                  <MDInput
                    error={Boolean(formik.touched.id && formik.errors.id)}
                    onBlur={formik.handleBlur}
                    helperText={formik.touched.id && formik.errors.id}
                    value={formik.values.id}
                    onChange={(e) => {
                      e.target.value = e.target.value.trim();
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
                    FormHelperTextProps={{
                      style: {
                        fontFamily: "Pretendard-Regular",
                        fontSize: "1.4vmin",
                        color: "red",
                        marginLeft: 0,
                      },
                    }}
                    inputRef={(el) => (textRef.current[0] = el)}
                    autoComplete="off"
                  />
                </MDBox>
                <MDBox mb={1} height="3.2rem">
                  <MDInput
                    error={Boolean(formik.touched.password && formik.errors.password)}
                    onBlur={formik.handleBlur}
                    helperText={formik.touched.password && formik.errors.password}
                    value={formik.values.password}
                    onChange={(e) => {
                      e.target.value = e.target.value.trim();
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
                    FormHelperTextProps={{
                      style: {
                        fontFamily: "Pretendard-Regular",
                        fontSize: "1.4vmin",
                        color: "red",
                        marginLeft: 0,
                      },
                    }}
                    inputRef={(el) => (textRef.current[1] = el)}
                    autoComplete="off"
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
                  <MDTypography
                    variant="button"
                    color="text"
                    sx={{
                      fontFamily: "'Pretendard-Light', sans-serif",
                    }}
                  >
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
      {popupProps.open && (
        <MDSnackbar
          color={popupProps.color}
          icon={popupProps.icon}
          title={popupProps.title}
          content={popupProps.content}
          open={popupProps.open}
          onClose={closePopUp}
          close={closePopUp}
          bgWhite
        />
      )}
    </>
  );
}

export default Basic;
