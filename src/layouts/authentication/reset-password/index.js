import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";

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

import { Link, useLocation } from "react-router-dom";

function Cover() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [disabled, setDisabled] = useState(false);

  const [passwordReset, setPasswordReset] = useState({
    id: "",
    password: "",
    password2: "",
    key: "",
  });

  useEffect(() => {
    const userId = queryParams.get("userId");
    const key = queryParams.get("key");

    if (userId && key) {
      setPasswordReset((prevState) => ({
        ...prevState,
        id: userId,
        key: key,
      }));
    }
  }, [location.search]);

  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      password: "",
      password2: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().max(255).required("* 비밀번호를 입력하세요"),
      password2: Yup.string()
        .max(255)
        .required("* 비밀번호 확인을 입력하세요")
        .oneOf([Yup.ref("password")], "* 비밀번호가 일치하지 않습니다"),
    }),
    onSubmit: () => {
      handleSubmit();
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!passwordReset.password) {
      formik.setFieldTouched("password", true);
      textRef.current[0]?.focus();
    } else if (!passwordReset.password2 || passwordReset.password !== passwordReset.password2) {
      formik.setFieldTouched("password2", true);
      textRef.current[1]?.focus();
    } else {
      setDisabled(true);
      func
        .ResetPassword(passwordReset)
        .then((res) => {
          setPopUpProps({
            ...popupProps,
            open: true,
            color: "success",
            icon: "check",
            title: "비밀번호 재설정",
            content: "비밀번호 재설정에 성공했습니다.",
          });
        })
        .catch((rej) => {
          if (rej.response.status !== 422 && rej.response.data.message) {
            setPopUpProps({
              ...popupProps,
              open: true,
              icon: "warning",
              color: "error",
              title: "비밀번호 재설정",
              content: rej.response.data.message,
            });
          }
        })
        .finally(() => {
          setDisabled(false);
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

  const inputCore = (formik, fieldName, setPasswordReset) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName],
    onChange: (e) => {
      e.target.value = e.target.value.trim();
      setPasswordReset((prev) => ({ ...prev, [fieldName]: e.target.value }));
      formik.handleChange(e);
    },
  });

  const boxStyles = {
    mb: 2,
    height: "3.2rem",
  };

  return (
    <>
      <BasicLayout image={bgImage}>
        <Card>
          <MDBox
            variant="gradient"
            bgColor="dark"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            py={2}
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
              아래 정보를 입력하여 비밀번호를 재설정해주세요
            </MDTypography>
          </MDBox>
          <MDBox pt={2} pb={3} px={3}>
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              <MDBox {...boxStyles}>
                <MDInput
                  {...inputCore(formik, "password", setPasswordReset)}
                  {...inputStyles}
                  type="password"
                  label="비밀번호"
                  name="password"
                  id="password"
                  fullWidth
                  inputRef={(el) => (textRef.current[0] = el)}
                />
              </MDBox>
              <MDBox {...boxStyles}>
                <MDInput
                  {...inputCore(formik, "password2", setPasswordReset)}
                  {...inputStyles}
                  type="password"
                  label="비밀번호 확인"
                  name="password2"
                  id="password2"
                  fullWidth
                  inputRef={(el) => (textRef.current[1] = el)}
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
                    "비밀번호 재설정"
                  )}
                </MDButton>
              </MDBox>
              <MDBox display="flex" justifyContent="space-between">
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="text"
                  textGradient
                  sx={{
                    fontFamily: "'Pretendard-Light', sans-serif",
                  }}
                >
                  &lt;&nbsp;로그인
                </MDTypography>
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="text"
                  textGradient
                  sx={{
                    fontFamily: "'Pretendard-Light', sans-serif",
                  }}
                >
                  &nbsp;
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </BasicLayout>
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

export default Cover;
