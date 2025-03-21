import React, { useState, useRef } from "react";
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
import MDSnackbar from "components/MDSnackbar";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-basic.jpeg";
import brandWhite from "assets/images/logo-ct.png";
import loading from "assets/images/loading.gif";

import * as Yup from "yup";
import * as func from "./function";

function Cover() {
  let isLogin = false;

  if (localStorage.getItem("jwt")) {
    isLogin = true;
  }

  const [disabled, setDisabled] = useState(false);

  const [dup, setDup] = useState(true);

  const [checkId, setCheckId] = useState("");

  const [signUp, setSignUp] = useState({
    id: "",
    password: "",
    password2: "",
    name: "",
    email: "",
  });

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

  function dupCheck() {
    if (signUp.id) {
      if (signUp.id !== checkId) {
        setCheckId(signUp.id);
        func
          .DupCheck(signUp.id)
          .then((res) => {
            setDup(false);
            return true;
          })
          .catch((rej) => {
            formik.setFieldError("id", "* 이미 사용 중인 아이디입니다");
            setDup(true);
            return false;
          });
      } else {
        if (!dup) {
          return true;
        } else {
          return false;
        }
      }
    }

    return true;
  }

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      id: "",
      password: "",
      password2: "",
      name: "",
      email: "",
    },
    validationSchema: Yup.object({
      id: Yup.string()
        .min(4, "아아디는 4글자 이상이어야 합니다.")
        .max(255)
        .required("* 아이디를 입력하세요")
        .test("dupCheck", "* 이미 사용 중인 아이디입니다", function (v) {
          if (!v) return true;
          return dupCheck();
        }),
      password: Yup.string().max(255).required("* 비밀번호를 입력하세요"),
      password2: Yup.string()
        .max(255)
        .required("* 비밀번호 확인을 입력하세요")
        .oneOf([Yup.ref("password")], "* 비밀번호가 일치하지 않습니다"),
      name: Yup.string().max(50).required("* 이름을 입력하세요"),
      email: Yup.string()
        .max(255)
        .required("* 이메일을 입력하세요")
        .email("* 올바른 이메일 형식이 아닙니다"),
    }),
    validateOnChange: false,
    onSubmit: () => {
      handleSubmit();
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!signUp.id || !dupCheck() || signUp.id.length < 4) {
      formik.setFieldTouched("id", true);
      textRef.current[0]?.focus();
    } else if (!signUp.password) {
      formik.setFieldTouched("password", true);
      textRef.current[1]?.focus();
    } else if (!signUp.password2 || signUp.password !== signUp.password2) {
      formik.setFieldTouched("password2", true);
      textRef.current[2]?.focus();
    } else if (!signUp.name) {
      formik.setFieldTouched("name", true);
      textRef.current[3]?.focus();
    } else if (!signUp.email) {
      formik.setFieldTouched("email", true);
      textRef.current[4]?.focus();
    } else {
      setDisabled(true);
      func
        .SignUp(signUp)
        .then((res) => {
          setDisabled(false);
          setPopUpProps({
            ...popupProps,
            redirect: true,
            open: true,
            color: "success",
            icon: "check",
            title: "회원가입 성공",
            content: "회원가입에 성공했습니다.",
          });
        })
        .catch((rej) => {
          setDisabled(false);
          if (rej.response.data.message) {
            setPopUpProps({
              ...popupProps,
              redirect: false,
              open: true,
              icon: "warning",
              color: "error",
              title: "회원가입 실패",
              content: rej.response.data.message,
            });
          }
        });
    }
  }

  const inputStyles = {
    variant: "standard",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
      },
    },
    InputLabelProps: {
      style: {
        fontFamily: "Pretendard-Light",
      },
    },
    FormHelperTextProps: {
      style: {
        fontFamily: "Pretendard-Regular",
        fontSize: "0.625rem",
        color: "red",
        marginLeft: 0,
      },
    },
    autoComplete: "off",
  };

  const inputCore = (formik, fieldName, setSignUp) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName],
    onChange: (e) => {
      e.target.value = e.target.value.trim();
      setSignUp((prev) => ({ ...prev, [fieldName]: e.target.value }));
      formik.handleChange(e);
    },
  });

  const boxStyles = {
    mb: 2,
    height: "3.2rem",
  };

  return (
    <>
      {isLogin ? (
        <Routes>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <BasicLayout image={bgImage}>
          <Card>
            <MDBox
              variant="gradient"
              bgColor="dark"
              borderRadius="lg"
              coloredShadow="success"
              mx={2}
              mt={-3}
              p={3}
              mb={1}
              textAlign="center"
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
              <MDTypography
                display="block"
                variant="button"
                color="white"
                my={1}
                sx={{
                  fontFamily: "'Pretendard-Regular', sans-serif",
                }}
              >
                회원가입을 위해 아래 정보를 입력해주세요
              </MDTypography>
            </MDBox>
            <MDBox pt={2} pb={3} px={3}>
              <MDBox component="form" role="form" onSubmit={handleSubmit}>
                <MDBox {...boxStyles}>
                  <MDInput
                    {...inputCore(formik, "id", setSignUp)}
                    {...inputStyles}
                    type="text"
                    label="아이디"
                    name="id"
                    id="id"
                    fullWidth
                    inputRef={(el) => (textRef.current[0] = el)}
                  />
                </MDBox>
                <MDBox {...boxStyles}>
                  <MDInput
                    {...inputCore(formik, "password", setSignUp)}
                    {...inputStyles}
                    type="password"
                    label="비밀번호"
                    name="password"
                    id="password"
                    fullWidth
                    inputRef={(el) => (textRef.current[1] = el)}
                  />
                </MDBox>
                <MDBox {...boxStyles}>
                  <MDInput
                    {...inputCore(formik, "password2", setSignUp)}
                    {...inputStyles}
                    type="password"
                    label="비밀번호 확인"
                    name="password2"
                    id="password2"
                    fullWidth
                    inputRef={(el) => (textRef.current[2] = el)}
                  />
                </MDBox>
                <MDBox {...boxStyles}>
                  <MDInput
                    {...inputCore(formik, "name", setSignUp)}
                    {...inputStyles}
                    type="text"
                    label="이름"
                    name="name"
                    id="name"
                    fullWidth
                    inputRef={(el) => (textRef.current[3] = el)}
                  />
                </MDBox>
                <MDBox {...boxStyles}>
                  <MDInput
                    {...inputCore(formik, "email", setSignUp)}
                    {...inputStyles}
                    type="email"
                    label="이메일"
                    name="email"
                    id="email"
                    fullWidth
                    inputRef={(el) => (textRef.current[4] = el)}
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
                      fontSize: "0.9rem",
                      lineHeight: 1,
                    }}
                    disabled={disabled}
                  >
                    {disabled ? (
                      <MDBox component="img" src={loading} alt="loading" width="1rem" />
                    ) : (
                      "회원가입"
                    )}
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
                    이미 계정이 있다면?&nbsp;{" "}
                    <MDTypography
                      component={Link}
                      to="/authentication/sign-in"
                      variant="button"
                      color="info"
                      fontWeight="medium"
                      textGradient
                    >
                      로그인
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
          onClose={() => closePopUp(popupProps.redirect)}
          close={() => closePopUp(popupProps.redirect)}
          bgWhite
        />
      )}
    </>
  );
}

export default Cover;
