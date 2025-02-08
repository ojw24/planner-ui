import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import MDSnackbar from "components/MDSnackbar";

import * as func from "./function";
import MDInput from "../../components/MDInput";
import * as Yup from "yup";
import MDButton from "../../components/MDButton";
import loading from "../../assets/images/loading.gif";

import { FindPassword } from "../authentication/find-password/function";

function Overview() {
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState({
    userId: "",
    name: "",
    email: "",
    fileId: "",
    file: "",
  });

  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  useEffect(() => {
    func.FindMe().then((res) => {
      setUser({
        userId: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        fileId: res.data.file ? res.data.file.attcFileId : null,
        file: res.data.file ? res.data.file.path : "",
      });
    });
  }, []);

  const boxStyles = {
    mb: 2,
    height: "3.2rem",
  };

  const inputStyles = {
    variant: "standard",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "20rem",
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
        fontSize: "1.4vmin",
        color: "red",
        marginLeft: 0,
      },
    },
    autoComplete: "off",
  };

  const inputCore = (formik, fieldName, setUser) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName],
    onChange: (e) => {
      e.target.value = e.target.value.trim();
      setUser((prev) => ({ ...prev, [fieldName]: e.target.value }));
      formik.handleChange(e);
    },
  });

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      name: "init",
      email: "init@test.com",
    },
    validationSchema: Yup.object({
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

    if (!user.name) {
      formik.setFieldTouched("name", true);
      textRef.current[0]?.focus();
    } else if (!user.email) {
      formik.setFieldTouched("email", true);
      textRef.current[1]?.focus();
    } else {
      setDisabled(true);
      func
        .UpdateUser(user)
        .then((res) => {
          setDisabled(false);
          setPopUpProps({
            ...popupProps,
            open: true,
            color: "success",
            icon: "check",
            title: "저장",
            content: "정보 저장에 성공했습니다.",
          });
        })
        .catch((rej) => {
          setDisabled(false);
          if (rej.response.data.message) {
            setPopUpProps({
              ...popupProps,
              open: true,
              icon: "warning",
              color: "error",
              title: "저장",
              content: rej.response.data.message,
            });
          }
        });
    }
  }

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  function handleResetPwdClick(e) {
    e.preventDefault();
    setDisabled(true);

    FindPassword(user.userId)
      .then((res) => {
        setDisabled(false);
        setPopUpProps({
          ...popupProps,
          open: true,
          color: "success",
          icon: "check",
          title: "비밀번호 변경",
          content: "가입하신 이메일로 비밀번호 재설정 링크를 전송했습니다.",
        });
      })
      .catch((rej) => {
        setDisabled(false);
        if (rej.response.data.message) {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "warning",
            color: "error",
            title: "비밀번호 변경",
            content: rej.response.data.message,
          });
        }
      });
  }

  const fileInputRef = useRef(null);

  function handleClickImage(e) {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 파일 입력 요소 클릭 이벤트 실행
    }
  }

  const [imageSrc, setImageSrc] = useState("");

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file); // Blob URL 생성
    setImageSrc(fileUrl);

    setUser({
      ...user,
      file: file.name,
    });

    func
      .UploadFile({ name: file.name, file })
      .then((res) => {
        setUser({
          ...user,
          file: "uploaded file",
          fileId: res.data,
        });
      })
      .catch((rej) => {
        if (rej.response.data.message) {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "warning",
            color: "error",
            title: "프로필 사진 등록",
            content: "프로필 사진 등록을 실패했습니다.",
          });
        }
      });
  }

  return (
    <>
      <MDBox mb={2} />
      <MDBox position="relative" mb={5}>
        <Card
          sx={{
            position: "relative",
            mt: -1,
            mx: 3,
            py: 2,
            px: 2,
          }}
        >
          <Grid container mt={2} alignItems="center" justifyContent="center">
            <Grid
              item
              sx={{
                cursor: "pointer",
              }}
              onClick={handleClickImage}
            >
              {user.file ? (
                <MDAvatar
                  id="profile"
                  src={imageSrc || "/image" + user.file}
                  alt="profile-image"
                  sx={{
                    width: "10vw",
                    height: "10vw",
                  }}
                  shadow="sm"
                />
              ) : (
                <AccountCircleIcon
                  sx={{
                    fontSize: "10vw !important",
                    "& path": {
                      transform: "scale(1.2)", // 내부 path 확대
                      transformOrigin: "center", // 확대 기준을 중앙으로 설정
                    },
                    display: "block",
                  }}
                />
              )}
            </Grid>
          </Grid>
          <MDBox
            mt={3}
            mb={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            component="form"
            role="form"
            onSubmit={handleSubmit}
          >
            <MDBox {...boxStyles}>
              <MDInput
                {...inputStyles}
                type="text"
                label="아이디"
                name="id"
                id="id"
                value={user.userId}
                fullWidth
                InputProps={{
                  ...inputStyles?.InputProps,
                  readOnly: true,
                }}
              />
            </MDBox>
            <MDBox {...boxStyles}>
              <MDInput
                {...inputCore(formik, "name", setUser)}
                {...inputStyles}
                type="text"
                label="이름"
                name="name"
                id="name"
                value={user.name}
                fullWidth
                inputRef={(el) => (textRef.current[0] = el)}
              />
            </MDBox>
            <MDBox {...boxStyles}>
              <MDInput
                {...inputCore(formik, "email", setUser)}
                {...inputStyles}
                type="email"
                label="이메일"
                name="email"
                id="email"
                value={user.email}
                fullWidth
                inputRef={(el) => (textRef.current[1] = el)}
              />
            </MDBox>
            <MDBox
              mb={1}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "20rem",
              }}
            >
              <MDButton
                type="button"
                variant="gradient"
                color="info"
                sx={{
                  fontFamily: "'Pretendard-Bold', sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  width: "8.5rem",
                }}
                disabled={disabled}
                onClick={handleResetPwdClick}
              >
                {disabled ? (
                  <MDBox component="img" src={loading} alt="loading" width="1rem" />
                ) : (
                  "비밀번호 변경"
                )}
              </MDButton>
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
                {disabled ? (
                  <MDBox component="img" src={loading} alt="loading" width="1rem" />
                ) : (
                  "저장"
                )}
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
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
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }} // UI에서 숨김
        onChange={handleFileChange}
      />
    </>
  );
}

export default Overview;
