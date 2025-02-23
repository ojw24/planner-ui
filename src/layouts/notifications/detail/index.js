import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import Card from "@mui/material/Card";

import MDBox from "../../../components/MDBox";

import { deleteNotice, findNotice } from "../function";
import MDTypography from "../../../components/MDTypography";
import Divider from "@mui/material/Divider";
import MDButton from "../../../components/MDButton";
import loading from "../../../assets/images/loading.gif";
import Confirm from "components/Confirm";
import MDSnackbar from "../../../components/MDSnackbar";

function Notification() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.state?.isAdmin;
  const [disabled, setDisabled] = useState(false);
  const { noticeId } = useParams();
  const [notice, setNotice] = useState({
    noticeId: noticeId,
    title: "",
    content: "",
    isTop: false,
    regDtm: "",
    updtDtm: "",
  });

  const [popupProps, setPopUpProps] = useState({
    redirect: false,
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    findNotice(noticeId)
      .then((res) => {
        setNotice({
          ...notice,
          title: res.data.title,
          content: res.data.content,
          isTop: res.data.isTop,
          regDtm: res.data.regDtm.replace("T", " "),
          updtDtm: res.data.updtDtm ? res.data.updtDtm.replace("T", " ") : '"',
        });
      })
      .catch((rej) => {
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
  }, []);

  const dividerStyles = {
    marginY: 1,
    marginX: "auto",
    backgroundColor: "rgba(0, 0, 0, 1)",
    maskImage:
      "linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.1))",
    WebkitMaskImage:
      "linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.1))",
  };

  const handleClickUpdate = () => {
    setDisabled(true);
    navigate("/notifications/register", {
      state: { isAdmin, notice },
    });
  };

  const handleClickDelete = (e) => {
    e.preventDefault();

    deleteNotice(noticeId)
      .then((res) => {
        handleClose();
        navigate("/notifications", {
          state: { isAdmin },
        });
      })
      .catch((rej) => {
        handleClose();
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
  };

  function closePopUp(redirect) {
    setPopUpProps({ ...popupProps, open: false });
    if (redirect) {
      window.history.back();
    }
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
            minHeight: "30.7231rem",
            height: "auto",
          }}
        >
          <MDBox mx={2} mt={2}>
            <MDTypography sx={{ fontFamily: "Pretendard-Bold", fontSize: "2rem" }}>
              {notice.title}
            </MDTypography>
            {/*<Divider sx={dividerStyles} />*/}
            <MDTypography sx={{ fontFamily: "Pretendard-Light", fontSize: "1rem" }}>
              {notice.regDtm}
            </MDTypography>
            <Divider sx={dividerStyles} />
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Regular",
                fontSize: "1.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {notice.content.replace(/\\n/g, "\n")}
            </MDTypography>
          </MDBox>
        </Card>
        <MDBox mt={1.5} mx={3} display="flex" gap="0.5rem">
          <MDTypography
            variant="button"
            color="text"
            textGradient
            onClick={() => window.history.back()} // 뒤로 가기
            sx={{
              fontFamily: "'Pretendard-Light', sans-serif",
              cursor: "pointer", // 마우스 호버 시 커서 변경
              "&:hover": {
                opacity: 0.8, // 호버 시 약간 투명하게
              },
            }}
          >
            &lt;&nbsp;목록으로
          </MDTypography>
          {isAdmin ? (
            <>
              <MDButton
                type="button"
                variant="gradient"
                color="info"
                sx={{
                  fontFamily: "'Pretendard-Bold', sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  width: "5rem",
                  marginLeft: "auto",
                }}
                disabled={disabled}
                onClick={handleClickUpdate}
              >
                {disabled ? (
                  <MDBox component="img" src={loading} alt="loading" width="1rem" />
                ) : (
                  "수정"
                )}
              </MDButton>
              <MDButton
                type="button"
                variant="gradient"
                color="info"
                sx={{
                  fontFamily: "'Pretendard-Bold', sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  width: "5rem",
                }}
                disabled={disabled}
                onClick={handleClickOpen}
              >
                {disabled ? (
                  <MDBox component="img" src={loading} alt="loading" width="1rem" />
                ) : (
                  "삭제"
                )}
              </MDButton>
            </>
          ) : (
            <></>
          )}
        </MDBox>
      </MDBox>
      <Confirm
        title="정말 삭제하시겠습니까?"
        open={open}
        onClose={handleClose}
        agreeFunc={handleClickDelete}
      />
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

export default Notification;
