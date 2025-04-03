import { useState, useEffect } from "react";
import Stomp from "stompjs";
import { v4 as uuidv4 } from "uuid";

// react-router components
import { useNavigate, useLocation, Link, matchPath } from "react-router-dom";
import routes from "routes";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import NotificationsPausedIcon from "@mui/icons-material/NotificationsPaused";
import ClickAwayListener from "@mui/base/ClickAwayListener";

import MDTypography from "components/MDTypography";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setOpenConfigurator,
  setOpenFriend,
  setIgnore,
  setIgnoreF,
} from "context";
import MenuItem from "@mui/material/MenuItem";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import ListItemIcon from "@mui/material/ListItemIcon";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import * as React from "react";

import * as func from "./functions";

import MDAvatar from "components/MDAvatar";

function DashboardNavbar({ absolute, light, isMini, image, settings }) {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const {
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    openFriend,
    darkMode,
    ignore,
    ignoreF,
  } = controller;
  const route = useLocation().pathname;
  const [profile, setProfile] = useState(image);

  const [messages, setMessages] = useState([]);
  const [notiCount, setNotiCount] = useState(0);

  useEffect(() => {
    let connection = null;

    async function connectMq() {
      const uuid = uuidv4();
      const res = await func.getMqConfig();
      const wsUrl = `ws://${res.data.host}:${res.data.port}/ws`;
      const ws = new WebSocket(wsUrl);
      const client = Stomp.over(ws);

      if (client.debug) client.debug = null;
      try {
        client.connect(
          res.data.user,
          res.data.password,
          () => {
            on_connect();
          },
          () => {
            ws.close();
          },
          "/"
        );
      } catch (error) {}

      const on_connect = function () {
        subscribeToExchange(client, "board" + uuid);
        subscribeToExchange(client, "freind" + uuid);
        subscribeToExchange(client, "schedule" + uuid);
        func.createBoardMQ("board" + uuid);
        func.createFriendMQ("freind" + uuid);
        func.createScheduleMQ("schedule" + uuid);
      };
    }

    connectMq();

    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, []);

  // 구독을 위한 함수 호출
  const subscribeToExchange = async (client, uuid) => {
    try {
      // uuid를 사용하여 큐 이름 동적으로 생성
      const destination = `/queue/${uuid}`; // uuid를 큐 이름으로 사용

      // 클라이언트가 해당 큐를 구독하도록 설정
      client.subscribe(destination, (message) => {
        if (message.body) {
          // 수신한 메시지 처리
          const parsedMessage = JSON.parse(message.body); // 문자열을 JSON 객체로 변환
          // regDtm이 배열이라면 날짜 문자열로 변환
          if (Array.isArray(parsedMessage.regDtm) && parsedMessage.regDtm.length === 6) {
            const [year, month, day, hour, minute, second] = parsedMessage.regDtm;
            parsedMessage.regDtm = `${year}-${String(month).padStart(2, "0")}-${String(
              day
            ).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}:${String(second).padStart(2, "0")}`;
          }

          setMessages((prev) =>
            [...prev, parsedMessage].sort((a, b) => new Date(b.regDtm) - new Date(a.regDtm))
          ); // 메시지 상태에 추가
        }
      });

      window.addEventListener("beforeunload", async () => {
        try {
          await func.deleteQueue(uuid); // 큐 삭제 요청
        } catch (error) {}
      });
    } catch (error) {}
  };

  useEffect(() => {
    setNotiCount(messages.filter((m) => !m.isChecked).length);
  }, [messages]);

  useEffect(() => {
    setProfile(image);
  }, [image]);

  useEffect(() => {
    if (settings.isFriendReqNoti) {
      func.findFriendRequestNotifications().then((res) => {
        if (res.data) {
          setMessages((prevMessages) =>
            [...prevMessages, ...res.data.flat()].sort(
              (a, b) => new Date(b.regDtm) - new Date(a.regDtm)
            )
          );
        }
      });
    }

    if (settings.isSchShareReqNoti) {
      func.findScheduleShareRequestNotifications().then((res) => {
        if (res.data) {
          setMessages((prevMessages) =>
            [...prevMessages, ...res.data.flat()].sort(
              (a, b) => new Date(b.regDtm) - new Date(a.regDtm)
            )
          );
        }
      });
    }

    if (settings.isCommentNoti) {
      func.findBoardCommentNotifications().then((res) => {
        if (res.data) {
          setMessages((prevMessages) =>
            [...prevMessages, ...res.data.flat()].sort(
              (a, b) => new Date(b.regDtm) - new Date(a.regDtm)
            )
          );
        }
      });
    }
  }, [settings]);

  useEffect(() => {
    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /**
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleFriendOpen = (data) => setOpenFriend(dispatch, !openFriend, data);

  const notiCore = {
    sx: {
      width: "100%",
      marginLeft: "0.5rem",
      fontFamily: "Pretendard-light",
      fontSize: "0.9rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };

  // Render the notifications menu
  const renderMenu = () => (
    <ClickAwayListener onClickAway={handleClickAway2}>
      <Menu
        anchorEl={anchorEl2}
        id="notifications"
        open={open2}
        onClose={handleClose2}
        disableScrollLock
        position="fixed"
        sx={{
          width: "0",
        }}
        PaperProps={{
          style: {
            transform: open2 ? "translateY(0)" : "translateY(-20px)",
            width: "auto", // Menu width
            maxWidth: "50rem", // Set maximum width
            maxHeight: "25rem", // Set maximum height
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              width: "0",
            },
          },
        }}
      >
        <MDBox
          sx={{
            width: "25rem !important",
            minWidth: "25rem !important",
            maxWidth: "25rem !important",
            minHeight: "1rem !important",
            maxHeight: "19.5rem !important",
          }}
        >
          {messages && messages.length > 0 ? (
            <>
              {messages.map((m, idx) => (
                <MDBox
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "& a": {
                      color: m.isChecked ? "#D3D3D3" : "black",
                    },
                    "& span": {
                      color: m.isChecked ? "#D3D3D3" : "black",
                    },
                    "& svg": {
                      color: m.isChecked ? "#D3D3D3" : "black",
                    },
                  }}
                >
                  {m.notiType ? (
                    m.notification === "SCHEDULE_SHARE_REQUEST" ? (
                      m.notiType.description === "request" ? (
                        <MenuItem
                          onClick={() => handleClose2(m.notiId, m.notification)}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Icon fontSize="small">edit_calendar</Icon>
                          <MDTypography
                            {...notiCore}
                            onClick={() => {
                              navigate(`/schedule`, {
                                state: {
                                  isShare: true,
                                  reqId: m.reqId,
                                },
                              });
                            }}
                            variant="button"
                          >
                            {"공유 : " +
                              m.requesterName +
                              "님으로부터 '" +
                              m.schedule.name +
                              "' 일정이 공유 신청되었습니다."}
                          </MDTypography>
                        </MenuItem>
                      ) : (
                        <MenuItem
                          onClick={() => checkNotification(m.notiId, m.notification)}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Icon fontSize="small">
                            {m.notiType.description === "approve"
                              ? "event_available"
                              : "event_busy"}
                          </Icon>
                          <MDTypography {...notiCore} variant="button">
                            {(m.notiType.description === "approve" ? "승인" : "거절") +
                              " : " +
                              m.targetName +
                              "님으로부터 '" +
                              m.schedule.name +
                              "' 일정 공유 신청이 " +
                              (m.notiType.description === "approve" ? "승인" : "거절") +
                              "되었습니다."}
                          </MDTypography>
                        </MenuItem>
                      )
                    ) : m.notiType.description === "request" ? (
                      <MenuItem
                        onClick={() => handleClose2(m.notiId, m.notification)}
                        sx={{
                          width: "100%",
                        }}
                      >
                        <GroupIcon fontSize="small" />
                        <MDTypography
                          {...notiCore}
                          variant="button"
                          onClick={() => {
                            handleIgnoreF();
                            handleFriendOpen({
                              reqId: m.friendReqId,
                            });
                          }}
                        >
                          {"신청 : " + m.requesterName + "님으로부터 친구 신청이 도착했습니다."}
                        </MDTypography>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => checkNotification(m.notiId, m.notification)}
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Icon fontSize="small">
                          {m.notiType.description === "approve" ? "group_add" : "group_off"}
                        </Icon>
                        <MDTypography {...notiCore} variant="button">
                          {(m.notiType.description === "approve" ? "승인" : "거절") +
                            " : " +
                            m.targetName +
                            "님으로부터 친구 신청이 " +
                            (m.notiType.description === "approve" ? "승인" : "거절") +
                            "되었습니다."}
                        </MDTypography>
                      </MenuItem>
                    )
                  ) : (
                    <MenuItem
                      onClick={() => handleClose2(m.notiId, m.notification)}
                      sx={{
                        width: "100%",
                      }}
                    >
                      <Icon fontSize="small">forum</Icon>
                      <MDTypography
                        {...notiCore}
                        onClick={() => {
                          navigate(`community/detail/${m.boardMemoId}`, {
                            state: {
                              boardCommentId: m.boardCommentId,
                            },
                          });
                        }}
                        variant="button"
                      >
                        {"댓글 : " + m.content}
                      </MDTypography>
                    </MenuItem>
                  )}
                  <Icon
                    sx={{
                      marginLeft: "auto",
                      fontSize: "1rem !important",
                      color: "black",
                      stroke: "currentColor",
                      strokeWidth: "2px",
                      cursor: "pointer",
                    }}
                    onClick={() => deleteNotification(m.notiId, m.notification)}
                  >
                    close
                  </Icon>
                </MDBox>
              ))}
            </>
          ) : (
            <MDBox
              sx={{
                display: "inline-block",
                textAlign: "center",
                width: "100%",
              }}
            >
              <NotificationsPausedIcon fontSize="medium" />
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-Bold",
                  fontSize: "1rem",
                }}
              >
                알림이 없습니다.
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </Menu>
    </ClickAwayListener>
  );

  const checkNotification = (notiId, notification) => {
    switch (notification) {
      case "COMMENT":
        func
          .checkBoardCommentNotification(notiId)
          .then((res) => {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.notiId === notiId && msg.notification === "COMMENT"
                  ? { ...msg, isChecked: true }
                  : msg
              )
            );
          })
          .catch((rej) => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "COMMENT")
              )
            );
          });
        break;
      case "SCHEDULE_SHARE_REQUEST":
        func
          .checkScheduleShareRequestNotification(notiId)
          .then((res) => {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.notiId === notiId && msg.notification === "SCHEDULE_SHARE_REQUEST"
                  ? { ...msg, isChecked: true }
                  : msg
              )
            );
          })
          .catch((rej) => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "SCHEDULE_SHARE_REQUEST")
              )
            );
          });
        break;
      case "FRIEND_REQUEST":
        func
          .checkFriendRequestNotification(notiId)
          .then((res) => {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.notiId === notiId && msg.notification === "FRIEND_REQUEST"
                  ? { ...msg, isChecked: true }
                  : msg
              )
            );
          })
          .catch((rej) => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "FRIEND_REQUEST")
              )
            );
          });
        break;
      default:
        break;
    }
  };

  const deleteNotification = (notiId, notification) => {
    switch (notification) {
      case "COMMENT":
        func
          .deleteBoardCommentNotification(notiId)
          .catch((rej) => {})
          .finally(() => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "COMMENT")
              )
            );
          });
        break;
      case "SCHEDULE_SHARE_REQUEST":
        func
          .deleteScheduleShareRequestNotification(notiId)
          .catch((rej) => {})
          .finally(() => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "SCHEDULE_SHARE_REQUEST")
              )
            );
          });
        break;
      case "FRIEND_REQUEST":
        func
          .deleteFriendRequestNotification(notiId)
          .catch((rej) => {})
          .finally(() => {
            setMessages((prevMessages) =>
              prevMessages.filter(
                (msg) => !(msg.notiId === notiId && msg.notification === "FRIEND_REQUEST")
              )
            );
          });
        break;
      default:
        break;
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickAway = (e) => {
    if (anchorEl && !anchorEl.contains(e.target)) {
      handleClose();
    }
  };

  const handleIgnore = () => setIgnore(dispatch, !ignore);
  const handleIgnoreF = () => setIgnoreF(dispatch, !ignoreF);

  const [anchorEl2, setAnchorEl2] = useState(null);
  const open2 = Boolean(anchorEl2);
  const handleClick2 = (event) => {
    if (anchorEl2) {
      setAnchorEl2(null);
    } else {
      setAnchorEl2(event.currentTarget);
    }
  };

  const handleClose2 = (notiId, notification) => {
    if (notiId && notification) {
      checkNotification(notiId, notification);
    }
    setAnchorEl2(null);
  };

  const handleClickAway2 = (e) => {
    if (anchorEl2 && !anchorEl2.contains(e.target)) {
      handleClose2();
    }
  };

  const getName = (allRoutes, key) => {
    return key === "" ? "Dashboard" : allRoutes.find((route) => matchPath(route.route, key))?.name;
  };

  const renderAccountMenu = () => (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        disableScrollLock
        position="fixed"
        sx={{
          width: "0",
        }}
        PaperProps={{
          style: {
            transform: open ? "translateY(0)" : "translateY(-20px)",
            width: "auto", // Menu width
            maxWidth: "300px", // Set maximum width
            maxHeight: "300px", // Set maximum height
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              width: "0",
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <MDTypography
            component={Link}
            to="/profile"
            variant="button"
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            마이 페이지
          </MDTypography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleIgnoreF();
            handleFriendOpen();
          }}
        >
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            친구
          </MDTypography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleIgnore();
            handleConfiguratorOpen();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            설정
          </MDTypography>
        </MenuItem>
        <MenuItem onClick={func.LogOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            로그아웃
          </MDTypography>
        </MenuItem>
      </Menu>
    </ClickAwayListener>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const [isHalf, setIsHalf] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMaximized(window.innerWidth === window.screen.availWidth);
      setIsHalf(window.innerWidth <= window.screen.availWidth / 2);
    };

    handleResize(); // 마운트 시 실행
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={(theme) => ({
        ...navbar(theme, { transparentNavbar, absolute, light, darkMode }),
        width: isMaximized ? "77rem" : isHalf ? "0" : "inherit",
        mx: "1rem",
        mt: "0.25rem",
      })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs
            icon="home"
            title={getName(routes, route)}
            route={route}
            light={light}
            sx={iconsStyle}
          />
        </MDBox>
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <MDBox color={light ? "white" : "inherit"}>
            <IconButton
              size="large"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="notification-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={handleClick2}
            >
              <Icon sx={iconsStyle}>notifications</Icon>
              {notiCount > 0 && (
                <MDBox
                  sx={{
                    position: "absolute",
                    top: "4px",
                    right: notiCount >= 10 ? (notiCount > 99 ? "-0.5rem" : "-0.1rem") : "0.3rem",
                    backgroundColor: "#FF3D00",
                    color: "white !important",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    borderRadius: "0.4rem",
                    width: "auto",
                    height: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingX: "0.3rem",
                  }}
                >
                  {notiCount > 0 ? (notiCount > 99 ? "99+" : notiCount) : ""}
                </MDBox>
              )}
            </IconButton>
            <IconButton
              size="large"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="notification-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={handleClick}
            >
              {profile ? (
                <MDAvatar
                  id="profile"
                  src={"/image" + profile}
                  alt="profile-image"
                  sx={{
                    width: "1.75rem",
                    height: "1.75rem",
                  }}
                  shadow="sm"
                />
              ) : (
                <Icon sx={iconsStyle}>account_circle</Icon>
              )}
            </IconButton>
            {renderMenu()}
            {renderAccountMenu()}
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  image: "",
  settings: {
    isFriendReqNoti: false,
    isSchShareReqNoti: false,
    isCommentNoti: false,
  },
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  image: PropTypes.string,
  settings: PropTypes.object,
};

export default DashboardNavbar;
