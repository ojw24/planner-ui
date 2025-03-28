import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";

import Card from "@mui/material/Card";
import { FormControlLabel, Checkbox, TextField } from "@mui/material";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import * as Yup from "yup";
import loading from "assets/images/loading.gif";
import MDButton from "components/MDButton";

import { createNotice, updateNotice } from "../function";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.state?.isAdmin;
  const noticeData = location.state?.notice;
  const [disabled, setDisabled] = useState(false);
  const [notice, setNotice] = useState({
    noticeId: noticeData ? noticeData.noticeId : null,
    title: noticeData ? noticeData.title : "",
    content: noticeData ? noticeData.content : "",
    isTop: noticeData ? noticeData.isTop : "",
  });

  const [popupProps, setPopUpProps] = useState({
    redirect: false,
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  const boxStyles = {
    mb: 2,
    height: "3.2rem",
    display: "flex",
    alignItems: "center",
    gap: 2,
  };

  const inputStyles = {
    variant: "standard",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "20rem",
        fontSize: "2rem",
      },
    },
    InputLabelProps: {
      sx: {
        fontFamily: "Pretendard-Light",
        fontSize: "2rem",
        "&.MuiInputLabel-shrink": {
          fontSize: "1.6rem",
        },
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

  const contentStyles = {
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        fontSize: "1.5rem",
      },
    },
    InputLabelProps: {
      sx: {
        fontFamily: "Pretendard-Light",
        fontSize: "1.5rem",
        "&.MuiInputLabel-shrink": {
          top: "-1% !important",
          left: "0.3% !important",
          fontSize: "1.5rem",
        },
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

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      title: noticeData ? noticeData.title : "",
      content: noticeData ? noticeData.content : "",
    },
    validationSchema: Yup.object({
      title: Yup.string().max(255).required("* 제목을 입력하세요"),
      content: Yup.string().required("* 내용을 입력하세요"),
    }),
    validateOnChange: false,
    onSubmit: () => {
      handleSubmit();
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!notice.title) {
      formik.setFieldTouched("title", true);
      textRef.current[0]?.focus();
    } else if (!notice.content) {
      formik.setFieldTouched("content", true);
      textRef.current[1]?.focus();
    } else {
      setDisabled(true);

      if (notice.noticeId) {
        updateNotice(notice)
          .then((res) => {
            setDisabled(false);
            setPopUpProps({
              ...popupProps,
              redirect: true,
              open: true,
              color: "success",
              icon: "check",
              title: "저장",
              content: "정보 저장에 성공했습니다.",
            });
          })
          .catch((rej) => {
            setDisabled(false);
            setPopUpProps({
              ...popupProps,
              redirect: true,
              open: true,
              icon: "warning",
              color: "warning",
              title: "공지사항",
              content: "존재하지 않는 공지사항입니다.",
            });
          });
      } else {
        createNotice(notice)
          .then((res) => {
            setDisabled(false);
            setPopUpProps({
              ...popupProps,
              redirect: true,
              open: true,
              color: "success",
              icon: "check",
              title: "저장",
              content: "정보 저장에 성공했습니다.",
            });
          })
          .catch((rej) => {
            setDisabled(false);
          });
      }
    }
  }

  function closePopUp(redirect) {
    setPopUpProps({ ...popupProps, open: false });
    if (redirect) {
      navigate("/notifications", {
        state: { isAdmin },
      });
    }
  }

  const inputCore = (formik, fieldName, setNotice) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName],
    onChange: (e) => {
      const value = e.target.value;
      const encoder = new TextEncoder();
      const byteLength = encoder.encode(value).length;
      const max = fieldName === "title" ? 255 : 0;

      if (fieldName !== "title" || byteLength <= max) {
        setNotice((prev) => ({ ...prev, [fieldName]: e.target.value }));
        formik.handleChange(e);
      }
    },
  });

  return (
    <>
      <MDBox mb={2} />
      <MDBox position="relative" mb={5} component="form" role="form" onSubmit={handleSubmit}>
        <Card
          sx={{
            position: "relative",
            mt: -1,
            mx: 3,
            py: 2,
            px: 2,
            height: "30.7231rem",
          }}
        >
          <MDBox
            mt={3}
            mb={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <MDBox {...boxStyles}>
              <MDInput
                {...inputCore(formik, "title", setNotice)}
                {...inputStyles}
                type="text"
                label="제목"
                name="title"
                id="title"
                value={notice.title}
                inputRef={(el) => (textRef.current[0] = el)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notice.isTop}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        borderRadius: "2px",
                      },
                      marginTop: "3px",
                    }}
                    onChange={(e) => {
                      setNotice({
                        ...notice,
                        isTop: e.target.checked,
                      });
                    }}
                  />
                }
                label="상단 고정 여부"
                componentsProps={{
                  typography: {
                    sx: {
                      fontFamily: "Pretendard-Regular",
                    },
                  },
                }}
              />
            </MDBox>
            <MDBox
              mt={1}
              sx={{
                width: "100%",
              }}
            >
              <TextField
                {...inputCore(formik, "content", setNotice)}
                {...contentStyles}
                label="내용"
                name="content"
                id="content"
                multiline
                rows={9}
                variant="outlined"
                fullWidth
                value={notice.content.replace(/\\n/g, "\n")}
                inputRef={(el) => (textRef.current[1] = el)}
              />
            </MDBox>
          </MDBox>
        </Card>
        <MDBox
          mt={1.5}
          mx={3}
          display="flex"
          sx={{
            justifyContent: "right",
          }}
        >
          <MDButton
            type="submit"
            variant="gradient"
            color="info"
            sx={{
              fontFamily: "'Pretendard-Bold', sans-serif",
              fontSize: "0.9rem",
              lineHeight: 1,
              width: "5rem",
            }}
            disabled={disabled}
          >
            {disabled ? <MDBox component="img" src={loading} alt="loading" width="1rem" /> : "저장"}
          </MDButton>
        </MDBox>
      </MDBox>
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

export default Register;
