import * as React from "react";
import { useEffect, useState } from "react";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";

import ClickAwayListener from "@mui/base/ClickAwayListener";

// @mui icons
import ListItemIcon from "@mui/material/ListItemIcon";
import Settings from "@mui/icons-material/Settings";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Custom styles for the Configurator
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";

// Material Dashboard 2 React context
import { setIgnore, setOpenConfigurator, useMaterialUIController } from "context";
import loading from "../../assets/images/loading.gif";

import { UpdateUser } from "../../layouts/profile/function";
import PropTypes from "prop-types";

function Configurator({ userId, settings, attcFileId }) {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, darkMode, ignore } = controller;
  const [disabled, setDisabled] = useState(false);
  const [setting, setSetting] = useState({
    isFriendReqNoti: settings.isFriendReqNoti,
    isSchShareReqNoti: settings.isSchShareReqNoti,
    isCommentNoti: settings.isCommentNoti,
  });

  const [popupProps, setPopUpProps] = useState({
    redirect: false,
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  useEffect(() => {
    setSetting({
      isFriendReqNoti: settings.isFriendReqNoti,
      isSchShareReqNoti: settings.isSchShareReqNoti,
      isCommentNoti: settings.isCommentNoti,
    });
  }, [settings]);

  useEffect(() => {
    if (!openConfigurator) {
      setSetting({
        isFriendReqNoti: settings.isFriendReqNoti,
        isSchShareReqNoti: settings.isSchShareReqNoti,
        isCommentNoti: settings.isCommentNoti,
      });
    }
  }, [openConfigurator]);

  const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false);
  const handleIgnore = () => setIgnore(dispatch, !ignore);

  const handleClickAway = () => {
    if (ignore) {
      handleIgnore();
    } else {
      if (openConfigurator) {
        handleCloseConfigurator();
      }
    }
  };

  const handleChange = (fieldName, e) => {
    setSetting((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  const handleClick = (e) => {
    e.preventDefault();
    setDisabled(true);

    UpdateUser({ userId, setting, attcFileId })
      .then((res) => {
        setDisabled(false);
        settings.isFriendReqNoti = setting.isFriendReqNoti;
        settings.isSchShareReqNoti = setting.isSchShareReqNoti;
        settings.isCommentNoti = setting.isCommentNoti;
        setPopUpProps({
          ...popupProps,
          open: true,
          color: "success",
          icon: "check",
          title: "설정",
          content: "저장되었습니다.",
        });
      })
      .catch((rej) => {
        setDisabled(false);
      });
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="baseline"
            pt={4}
            pb={0.5}
            px={3}
          >
            <MDBox display="flex">
              <ListItemIcon
                sx={{
                  minWidth: "0",
                  marginRight: "0.5rem",
                  alignItems: "center",
                }}
              >
                <Settings />
              </ListItemIcon>
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-Bold",
                  fontSize: "1.2rem",
                }}
              >
                설정
              </MDTypography>
            </MDBox>

            <Icon
              sx={({ typography: { size }, palette: { dark, white } }) => ({
                fontSize: `${size.lg} !important`,
                color: darkMode ? white.main : dark.main,
                stroke: "currentColor",
                strokeWidth: "2px",
                cursor: "pointer",
              })}
              onClick={handleCloseConfigurator}
            >
              close
            </Icon>
          </MDBox>

          <Divider />

          <MDBox pt={0.5} px={3}>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Regular",
                fontSize: "1rem",
              }}
            >
              알림 설정
            </MDTypography>

            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              lineHeight={1}
            >
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-light",
                  fontSize: "0.87rem",
                }}
              >
                친구 신청
              </MDTypography>
              <Switch
                checked={setting.isFriendReqNoti}
                onChange={(e) => handleChange("isFriendReqNoti", e)}
              />
            </MDBox>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              lineHeight={1}
            >
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-light",
                  fontSize: "0.87rem",
                }}
              >
                일정 공유
              </MDTypography>
              <Switch
                checked={setting.isSchShareReqNoti}
                onChange={(e) => handleChange("isSchShareReqNoti", e)}
              />
            </MDBox>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
              lineHeight={1}
            >
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-light",
                  fontSize: "0.87rem",
                }}
              >
                댓글
              </MDTypography>
              <Switch
                checked={setting.isCommentNoti}
                onChange={(e) => handleChange("isCommentNoti", e)}
              />
            </MDBox>
            <Divider />
          </MDBox>
          <MDBox px={3}>
            <MDButton
              type="button"
              variant="gradient"
              color="info"
              sx={{
                fontFamily: "'Pretendard-Bold', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1,
                width: "5rem",
                float: "right",
              }}
              disabled={disabled}
              onClick={handleClick}
            >
              {disabled ? (
                <MDBox component="img" src={loading} alt="loading" width="1rem" />
              ) : (
                "저장"
              )}
            </MDButton>
          </MDBox>
        </ConfiguratorRoot>
      </ClickAwayListener>
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

Configurator.defaultProps = {
  userId: "",
  settings: {
    isFriendReqNoti: false,
    isSchShareReqNoti: false,
    isCommentNoti: false,
  },
  attcFileId: null,
};

Configurator.propTypes = {
  userId: PropTypes.string.isRequired,
  settings: PropTypes.object,
  attcFileId: PropTypes.number,
};

export default Configurator;
