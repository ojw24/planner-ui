import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { setIgnoreF, setOpenFriend, useMaterialUIController } from "context";

import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import Icon from "@mui/material/Icon";
import ListItemIcon from "@mui/material/ListItemIcon";
import GroupIcon from "@mui/icons-material/Group";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import { Tabs, Tab, Menu, MenuList, MenuItem } from "@mui/material";
import Divider from "@mui/material/Divider";

import * as func from "./function";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MDSnackbar from "../../components/MDSnackbar";
import Confirm from "../../components/Confirm";
import MDInput from "../../components/MDInput";
import MDButton from "../../components/MDButton";
import loading from "../../assets/images/loading.gif";
import ga_cursor from "assets/images/ga_cursor.png";

function Friend() {
  const [controller, dispatch] = useMaterialUIController();
  const { openFriend, darkMode, ignoreF } = controller;
  const [activeTab, setActiveTab] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [friendGrps, setFriendGrps] = useState([]);
  const [friendGrp, setFriendGrp] = useState();
  const [friends, setFriends] = useState([]);
  const [friend, setFriend] = useState();
  const [friendRequests, setFriendRequests] = useState([]);
  const [targetId, setTargetId] = useState();
  const [friendIds, setFriendIds] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState();
  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  const handleCloseFriend = () => {
    setOpenFriend(dispatch, false);
  };
  const handleIgnore = () => setIgnoreF(dispatch, !ignoreF);
  const handleTabChange = (_, newValue) => setActiveTab(newValue);
  const handleClickAway = () => {
    if (ignoreF) {
      handleIgnore();
    } else {
      if (openFriend && !isMouseDownInside) {
        handleCloseFriend();
      }
    }
  };

  useEffect(() => {
    func.findFriendGroups().then((res) => {
      setFriendGrps(res.data);
      setFriendIds((prev) => [
        ...prev,
        ...res.data.flatMap((item) =>
          item.friends ? item.friends.map((f) => f.friendUserId) : []
        ),
      ]);
    });

    func.findFriends().then((res) => {
      setFriends(res.data);
      setFriendIds((prev) => [...prev, ...res.data.map((item) => item.friendUserId)]);
    });

    func.findFriendRequests().then((res) => {
      setFriendRequests(res.data);
    });
  }, []);

  useEffect(() => {
    if (openFriend) {
      setGrpOpens([]);
      setGrpReg(false);
      setGrpName("");
      setEditingStates({});
      setTempTexts({});
      setActiveTab(0);
      setTargetId();
      setSearchValue("");
      setSearchResult();
    }
  }, [openFriend]);

  const tabStyle = {
    sx: {
      "& .MuiTabs-indicator": {
        backgroundColor: "black", // 선택된 탭의 언더라인 색상
        height: "3px", // 언더라인 두께 조정
        borderRadius: 0,
        transition: "none",
        boxShadow: "none",
      },
      "& .MuiTab-root": {
        minWidth: "auto", // 버튼 같은 고정 너비 제거
        padding: "8px 16px", // 내부 여백 조정
        fontFamily: "Pretendard-Regular",
        fontSize: "16px",
        fontWeight: "normal", // 기본 글자 두께
        color: "rgba(0, 0, 0, 0.6)", // 비활성화 탭 글자 색상
        backgroundColor: "transparent !important",
        boxShadow: "none !important",
        border: "none",
        outline: "none",
        borderRadius: 1,
        "&.Mui-selected": {
          color: "white !important", // 선택된 탭의 글자 색상
          boxShadow: "none !important",
          background: "linear-gradient(195deg, #42424a, #191919) !important",
        },
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04) !important", // 호버 시 배경색 변화 없음
        },
      },
      "& .MuiTouchRipple-root": { display: "none" }, // 리플 효과 제거
      // backgroundColor: "rgba(0, 0, 0, 0.04) !important",
      backgroundColor: "transparent !important",
      borderRadius: 0,
      height: "2.75rem",
    },
  };

  const handleContextMenu = (event, type) => {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      open: true,
      type, // 우클릭한 요소의 타입 저장
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleClickAwayContext = (e) => {
    if (contextMenu?.open) {
      handleClose();
    }
  };

  const itemStyle = {
    sx: {
      fontFamily: "Pretendard-Light",
      fontSize: "0.9rem",
      width: "5rem !important",
      maxWidth: "5rem !important",
      minWidth: "5rem !important",
      display: "flex",
      justifyContent: "center",
      paddingX: "0.5rem",
      paddingY: "0",
    },
  };

  const [grpOpens, setGrpOpens] = useState([]);

  const [grpReg, setGrpReg] = useState(false);
  const [grpName, setGrpName] = useState("");

  const handleEnterRegister = (e) => {
    if (e.key === "Enter") {
      grpRegister();
    }
  };

  const grpRegister = () => {
    if (!grpName) {
      setPopUpProps({
        ...popupProps,
        redirect: false,
        open: true,
        icon: "warning",
        color: "warning",
        title: "친구",
        content: "그룹명을 입력해주세요.",
      });
    } else {
      func
        .createFriendGroup(grpName)
        .then((res) => {
          func.findFriendGroups().then((res2) => {
            setFriendGrps(res2.data);
            setFriendIds((prev) => [
              ...prev,
              ...res2.data.flatMap((item) =>
                item.friends ? item.friends.map((f) => f.friendUserId) : []
              ),
            ]);
          });
        })
        .finally(() => {
          setGrpReg(false);
          setGrpName("");
        });
    }
  };

  const inputStyles = () => ({
    sx: {
      margin: 0,
      paddingX: "0.05rem",
      paddingY: 0,
      height: "1.5rem",
      "& .MuiInputBase-input": {
        padding: "0", // 기존 패딩 제거
        paddingLeft: "1rem",
      },
    },
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "100%",
        height: "1.5rem",
        paddingRight: "2rem",
        paddingY: 0,
        borderRadius: 5,
      },
      endAdornment: (
        <InputAdornment
          position="end"
          style={{
            position: "absolute",
            bottom: 12,
            right: 0,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "0.5rem",
            }}
            onClick={() => {
              setGrpReg(false);
              setGrpName("");
            }}
          >
            취소
          </span>
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "1rem",
            }}
            onClick={grpRegister}
          >
            저장
          </span>
        </InputAdornment>
      ),
    },
    autoComplete: "off",
  });

  const editInputStyles = (grp) => ({
    width: "0%",
    sx: {
      margin: 0,
      paddingX: "0.05rem",
      paddingY: 0,
      height: "1.5rem",
      "& .MuiInputBase-input": {
        padding: "0", // 기존 패딩 제거
        paddingLeft: "1rem",
      },
    },
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "100%",
        height: "1.5rem",
        paddingRight: "2rem",
        paddingY: 0,
        borderRadius: 5,
      },
      endAdornment: (
        <InputAdornment
          position="end"
          style={{
            position: "absolute",
            bottom: 12,
            right: 0,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "0.5rem",
            }}
            onClick={() => handleCancelEdit(grp)}
          >
            취소
          </span>
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "1rem",
            }}
            onClick={() => updateGrp(grp)}
          >
            저장
          </span>
        </InputAdornment>
      ),
    },
    autoComplete: "off",
  });

  const searchStyles = {
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "15rem",
        height: "2.4rem",
      },
    },
    autoComplete: "off",
  };

  const btnStyles = {
    sx: {
      fontFamily: "'Pretendard-Bold', sans-serif",
      fontSize: "0.9rem",
      lineHeight: 1,
      width: "3rem",
      minHeight: "1rem",
      height: "2rem",
    },
  };

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  const [grpCOpen, setGrpCOpen] = useState({});

  const handleCloseGrpC = () => {
    setGrpCOpen((prev) => ({ ...prev, [friendGrp.friendGrpId]: false }));
    setFriendGrp();
  };

  const handleClickDeleteGrp = (e, id) => {
    handleCloseGrpC();
    e.preventDefault();

    func
      .deleteFriendGroup(id)
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "친구",
          content: "존재하지 않는 그룹입니다.",
        });
      })
      .finally(() => {
        func.findFriendGroups().then((res) => {
          setFriendGrps(res.data);
          setFriendIds((prev) => [
            ...prev,
            ...res.data.flatMap((item) =>
              item.friends ? item.friends.map((f) => f.friendUserId) : []
            ),
          ]);
        });
        func.findFriends().then((res) => {
          setFriends(res.data);
          setFriendIds((prev) => [...prev, ...res.data.map((item) => item.friendUserId)]);
        });
      });
  };

  const [friendCOpen, setFriendCOpen] = useState({});

  const handleCloseFriendC = () => {
    setFriendCOpen((prev) => ({ ...prev, [friend.friendId]: false }));
    setFriend();
  };

  const handleClickDeleteFriend = (e, f) => {
    handleCloseFriendC();
    e.preventDefault();

    func
      .deleteFriend(f.friendId)
      .then((res) => {
        setFriendIds((prev) => prev.filter((friendId) => friendId !== f.friendUserId));
      })
      .finally(() => {
        func.findFriendGroups().then((res) => {
          setFriendGrps(res.data);
          setFriendIds((prev) => [
            ...prev,
            ...res.data.flatMap((item) =>
              item.friends ? item.friends.map((f) => f.friendUserId) : []
            ),
          ]);
        });
        func.findFriends().then((res) => {
          setFriends(res.data);
          setFriendIds((prev) => [...prev, ...res.data.map((item) => item.friendUserId)]);
        });
      });
  };

  const [editingStates, setEditingStates] = useState({});

  const [tempTexts, setTempTexts] = useState({});

  const handleEdit = () => {
    setEditingStates((prev) => ({ ...prev, [friendGrp.friendGrpId]: true }));
    setTempTexts((prev) => ({ ...prev, [friendGrp.friendGrpId]: friendGrp.name }));
  };

  const handleCancelEdit = (grp) => {
    setEditingStates((prev) => ({ ...prev, [grp.friendGrpId]: false }));
  };

  const handleEnterUpdate = (e, grp) => {
    if (e.key === "Enter") {
      updateGrp(grp);
    }
  };

  const updateGrp = (grp) => {
    const updateProps = {
      name: tempTexts[grp.friendGrpId],
      ord: grp.ord,
    };
    func
      .updateFriendGroup(grp.friendGrpId, updateProps)
      .then((rss) => {
        handleCancelEdit(grp);
      })
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "친구",
          content: "존재하지 않는 그룹입니다.",
        });
      })
      .finally(() => {
        func.findFriendGroups().then((res) => {
          setFriendGrps(res.data);
          setFriendIds((prev) => [
            ...prev,
            ...res.data.flatMap((item) =>
              item.friends ? item.friends.map((f) => f.friendUserId) : []
            ),
          ]);
        });
      });
  };

  const updateFriend = (id, props) => {
    func
      .updateFriend(id, props)
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "친구",
          content: "존재하지 않는 친구입니다.",
        });
      })
      .finally(() => {
        func.findFriendGroups().then((res) => {
          setFriendGrps(res.data);
          setFriendIds((prev) => [
            ...prev,
            ...res.data.flatMap((item) =>
              item.friends ? item.friends.map((f) => f.friendUserId) : []
            ),
          ]);
        });

        func.findFriends().then((res) => {
          setFriends(res.data);
          setFriendIds((prev) => [...prev, ...res.data.map((item) => item.friendUserId)]);
        });
      });
  };

  const [isMouseDownInside, setIsMouseDownInside] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => setIsMouseDownInside(false), 0); // 이벤트 순서 보장
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseDown = (event) => {
    if (ref.current?.contains(event.target)) {
      setIsMouseDownInside(true);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const search = () => {
    if (!searchValue) {
      setPopUpProps({
        ...popupProps,
        redirect: false,
        open: true,
        icon: "warning",
        color: "warning",
        title: "친구",
        content: "이름을 입력해주세요.",
      });
    } else {
      setDisabled(true);
      func.findSimpleUsers(searchValue).then((res) => {
        setDisabled(false);
        setSearchResult(res.data);
      });
    }
  };

  const request = () => {
    func
      .createFriendRequest(targetId)
      .then((res) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          color: "success",
          icon: "check",
          title: "친구",
          content: "신청이 완료되었습니다.",
        });
      })
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          redirect: false,
          open: true,
          icon: "warning",
          color: "warning",
          title: "친구",
          content: rej.response.data.message,
        });
      })
      .finally(() => {
        setTargetId();
        func.findFriendRequests().then((res) => {
          setFriendRequests(res.data);
        });
      });
  };

  const approveFriendRequest = (id, approve) => {
    setDisabled(true);
    func
      .approveFriendRequest(id, approve)
      .catch((rej) => {
        const status = rej.response.status;
        setPopUpProps({
          ...popupProps,
          redirect: false,
          open: true,
          icon: status === 400 ? "error" : "warning",
          color: status === 400 ? "error" : "warning",
          title: "친구",
          content: status === 400 ? rej.response.data.message : "존재하지 않는 신청입니다.",
        });
      })
      .finally(() => {
        setDisabled(false);
        func.findFriendRequests().then((res) => {
          setFriendRequests(res.data);
        });
        func.findFriends().then((res) => {
          setFriends(res.data);
          setFriendIds((prev) => [...prev, ...res.data.map((item) => item.friendUserId)]);
        });
      });
  };

  const [isDragging, setIsDragging] = useState(false);
  const [draggingFrom, setDraggingFrom] = useState(null);

  const handleDragStart = (start) => {
    console.log(draggingFrom);
    document.body.style.cursor = "not-allowed";
    setIsDragging(true);
    setDraggingFrom(start.source.droppableId);
  };

  const handleDragEnd = (result) => {
    document.body.style.cursor = "auto";
    setIsDragging(false);
    setDraggingFrom(null);

    if (!result.destination) return; // 드래그가 취소된 경우 처리 안 함

    if (result.source.droppableId === "friendGroups") {
      const update = {
        friendGrpId: friendGrps[result.source.index].friendGrpId,
        ord: calculateOrder(result.destination.index, result.source.index),
      };

      updateGrp(update);

      const newItems = Array.from(friendGrps);
      const [movedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, movedItem);

      setFriendGrps(newItems); // 변경된 순서 업데이트
    } else {
      if (
        result.destination.droppableId === "friendGroups" &&
        result.destination.index < friendGrps.length
      ) {
        const id = friends[result.source.index].friendId;
        const update = {
          friendGrpId: friendGrps[result.destination.index].friendGrpId,
        };

        updateFriend(id, update);
      }
    }
  };

  const calculateOrder = (index, source) => {
    if (index === 0) {
      return friendGrps[0].ord / 2;
    } else if (index === friendGrps.length - 1) {
      return friendGrps[friendGrps.length - 1].ord + 1;
    } else {
      if (index < source) {
        return (friendGrps[index - 1].ord + friendGrps[index].ord) / 2;
      } else {
        return (friendGrps[index].ord + friendGrps[index + 1].ord) / 2;
      }
    }
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <ConfiguratorRoot
          ref={ref}
          variant="permanent"
          ownerState={{ openFriend }}
          onMouseDown={handleMouseDown}
        >
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="baseline"
            pt={4}
            pb={0.5}
            px={3}
            mb={2}
          >
            <MDBox display="flex">
              <ListItemIcon
                sx={{
                  minWidth: "0",
                  marginRight: "0.5rem",
                  alignItems: "center",
                }}
              >
                <GroupIcon />
              </ListItemIcon>
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-Bold",
                  fontSize: "1.2rem",
                }}
              >
                친구
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
              onClick={handleCloseFriend}
            >
              close
            </Icon>
          </MDBox>

          <Tabs value={activeTab} onChange={handleTabChange} centered {...tabStyle}>
            <Tab label="친구" />
            <Tab label="찾기" />
            <Tab label="신청" />
          </Tabs>

          <Divider sx={{ margin: 0 }} />

          <MDBox
            p={1}
            sx={{
              flex: 1, // 남은 공간 자동으로 채우기
              overflow: "hidden", // 부모 영역 스크롤 방지
              display: "flex",
              flexDirection: "column",
            }}
          >
            {activeTab === 0 && (
              <MDBox
                sx={{
                  flex: 1, // 높이 자동 확장
                  overflowY: "auto", // 내부 스크롤 활성화
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none", // 크롬, 사파리 스크롤바 숨김
                  },
                }}
                onContextMenu={(event) => {
                  event.preventDefault(); // 기본 우클릭 메뉴 방지
                  event.stopPropagation();
                  if (!grpReg) handleContextMenu(event, "back");
                }}
              >
                <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <Droppable droppableId="friendGroups" type="GROUP">
                    {(provided) => (
                      <MDBox
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          cursor: isDragging
                            ? draggingFrom !== "friendGroups" && draggingFrom !== null
                              ? `url(${ga_cursor}) 12 12, pointer`
                              : "default"
                            : "auto",
                          width: "auto",
                        }}
                      >
                        {friendGrps.map((g, idx) => (
                          <Draggable
                            key={"grp" + g.friendGrpId}
                            draggableId={"grp" + String(g.friendGrpId)}
                            index={idx}
                          >
                            {(provided, snapshot) => {
                              const transform = provided.draggableProps?.style?.transform;
                              let newStyle = provided.draggableProps.style;

                              if (transform) {
                                const match = transform.match(/translate\((.*?),\s*(.*?)\)/);
                                if (match) {
                                  newStyle = {
                                    ...provided.draggableProps.style,
                                    transform:
                                      draggingFrom === "friendGroups" || draggingFrom === null
                                        ? `translate(0px, ${match[2]}) !important`
                                        : "none !important",
                                    opacity: snapshot.isDragging ? 0.5 : 1,
                                  };
                                }
                              }

                              return (
                                <MDBox
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onMouseDown={handleMouseDown}
                                  sx={{
                                    ...newStyle,
                                  }}
                                >
                                  {editingStates[g.friendGrpId] ? (
                                    <MDBox sx={{ height: "1.625rem" }}>
                                      <TextField
                                        {...editInputStyles(g)}
                                        fullWidth
                                        onChange={(e) =>
                                          setTempTexts((prev) => ({
                                            ...prev,
                                            [g.friendGrpId]: e.target.value,
                                          }))
                                        }
                                        value={tempTexts[g.friendGrpId]}
                                        placeholder="내용을 입력하세요"
                                        onKeyDown={(e) => handleEnterUpdate(e, g)}
                                      />
                                    </MDBox>
                                  ) : (
                                    <p
                                      onContextMenu={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setFriendGrp(g);
                                        handleContextMenu(event, "grp");
                                      }}
                                      style={{
                                        fontFamily: "Pretendard-Bold",
                                        fontSize: "1rem",
                                        cursor: "grab", // 드래그 가능한 상태 표시
                                        width: "fit-content",
                                      }}
                                      onClick={() => {
                                        setGrpOpens((prev) => ({
                                          ...prev,
                                          [g.friendGrpId]: !prev[g.friendGrpId],
                                        }));
                                      }}
                                    >
                                      <span style={{ display: "inline-block", width: "1rem" }}>
                                        {grpOpens && grpOpens[g.friendGrpId] ? "▼ " : "▶ "}
                                      </span>
                                      {"\u00A0"}
                                      {g.name}
                                    </p>
                                  )}
                                  <Confirm
                                    title={g.name + "을(를) 삭제하시겠습니가?"}
                                    open={grpCOpen[g.friendGrpId]}
                                    onClose={() => handleCloseGrpC(g.friendGrpId)}
                                    agreeFunc={(e) => handleClickDeleteGrp(e, g.friendGrpId)}
                                  />
                                  {g.friends && g.friends.length > 0 ? (
                                    <>
                                      {g.friends.map((f, idx) => {
                                        return grpOpens && grpOpens[g.friendGrpId] ? (
                                          <React.Fragment key={f.friendId}>
                                            <p
                                              style={{
                                                fontFamily: "Pretendard-Light",
                                                fontSize: "1rem",
                                                paddingLeft: "1.25rem",
                                                width: "fit-content",
                                              }}
                                              onContextMenu={(event) => {
                                                event.preventDefault(); // 기본 우클릭 메뉴 방지
                                                event.stopPropagation();
                                                setFriend(f);
                                                handleContextMenu(event, "friend");
                                              }}
                                            >
                                              {f.friendUserName +
                                                "(" +
                                                f.friendUserId.slice(0, -3) +
                                                "***" +
                                                ")"}
                                            </p>
                                            <Confirm
                                              title={f.friendUserName + "을(를) 삭제하시겠습니가?"}
                                              open={friendCOpen[f.friendId]}
                                              onClose={() => handleCloseFriendC(f.friendId)}
                                              agreeFunc={(e) => handleClickDeleteFriend(e, f)}
                                            />
                                          </React.Fragment>
                                        ) : null;
                                      })}
                                    </>
                                  ) : null}
                                </MDBox>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </MDBox>
                    )}
                  </Droppable>
                  <Droppable droppableId="friends" type="GROUP">
                    {(provided) => (
                      <MDBox
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          cursor: isDragging ? "default" : "auto",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.cursor = "not-allowed";
                        }}
                      >
                        {friends.map((f, idx) => (
                          <Draggable
                            key={"friend" + f.friendId}
                            draggableId={"friend" + f.friendId}
                            index={idx}
                          >
                            {(provided, snapshot) => {
                              const transform = provided.draggableProps?.style?.transform;
                              let newStyle = provided.draggableProps.style;

                              if (transform) {
                                const match = transform.match(/translate\((.*?),\s*(.*?)\)/);
                                if (match) {
                                  newStyle = {
                                    ...provided.draggableProps.style,
                                    transform:
                                      draggingFrom === "friends" || draggingFrom === null
                                        ? `translate(0px, ${match[2]}) !important`
                                        : "none !important",
                                    opacity: snapshot.isDragging ? 0.5 : 1,
                                  };
                                }
                              }

                              return (
                                <MDBox
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onMouseDown={handleMouseDown}
                                  sx={{
                                    ...newStyle,
                                  }}
                                >
                                  <p
                                    key={f.friendId}
                                    style={{
                                      fontFamily: "Pretendard-Light",
                                      fontSize: "1rem",
                                      width: "fit-content",
                                    }}
                                    onContextMenu={(event) => {
                                      event.preventDefault(); // 기본 우클릭 메뉴 방지
                                      event.stopPropagation();
                                      setFriend(f);
                                      handleContextMenu(event, "friend");
                                    }}
                                  >
                                    {f.friendUserName +
                                      "(" +
                                      f.friendUserId.slice(0, -3) +
                                      "***" +
                                      ")"}
                                  </p>
                                  <Confirm
                                    title={f.friendUserName + "을(를) 삭제하시겠습니가?"}
                                    open={friendCOpen[f.friendId]}
                                    onClose={() => handleCloseFriendC(f.friendId)}
                                    agreeFunc={(e) => handleClickDeleteFriend(e, f)}
                                  />
                                </MDBox>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </MDBox>
                    )}
                  </Droppable>
                </DragDropContext>
                {grpReg ? (
                  <MDBox
                    sx={{
                      height: "1.625rem",
                    }}
                  >
                    <TextField
                      {...inputStyles()}
                      fullWidth
                      onChange={(e) => {
                        setGrpName(e.target.value);
                      }}
                      value={grpName}
                      placeholder="그룹명을 입력하세요"
                      onKeyDown={handleEnterRegister}
                    />
                  </MDBox>
                ) : (
                  <></>
                )}
                {(!friendGrps || friendGrps.length <= 0) && (!friends || friends.length <= 0) ? (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="30.2575rem"
                  >
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                        fontSize: "1rem",
                      }}
                    >
                      친구가 없습니다.
                    </MDTypography>
                  </MDBox>
                ) : null}
              </MDBox>
            )}
            {activeTab === 1 && (
              <MDBox>
                <MDBox display="flex" gap="1rem" mb={1}>
                  <MDInput
                    {...searchStyles}
                    type="text"
                    name="searchValue"
                    id="searchValue"
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                    placeholder="이름을 입력해주세요"
                    onKeyDown={handleSearch}
                  />
                  <MDButton
                    type="button"
                    variant="gradient"
                    color="info"
                    sx={{
                      fontFamily: "'Pretendard-Bold', sans-serif",
                      fontSize: "0.9rem",
                      lineHeight: 1,
                      width: "5rem",
                      minHeight: "1rem",
                    }}
                    disabled={disabled}
                    onClick={search}
                  >
                    {disabled ? (
                      <MDBox component="img" src={loading} alt="loading" width="1rem" />
                    ) : (
                      "검색"
                    )}
                  </MDButton>
                </MDBox>
                {searchResult && searchResult.length > 0 ? (
                  <>
                    {searchResult.map((f, idx) => (
                      <p
                        key={"searchResult" + idx}
                        style={{
                          fontFamily: "Pretendard-Light",
                          fontSize: "1rem",
                          width: "fit-content",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          if (!friendIds.includes(f.userId)) {
                            event.stopPropagation();
                            setTargetId(f.userId);
                            handleContextMenu(event, "search");
                          }
                        }}
                      >
                        {f.name + "(" + f.userId.slice(0, -3) + "***" + ")"}
                        {"\u00A0"}
                        {friendIds.includes(f.userId) ? (
                          <ListItemIcon
                            sx={{
                              minWidth: "0",
                              marginRight: "0.5rem",
                              alignItems: "center",
                            }}
                          >
                            <GroupIcon />
                          </ListItemIcon>
                        ) : null}
                      </p>
                    ))}
                  </>
                ) : (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="30.2575rem"
                  >
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                        fontSize: "1rem",
                      }}
                    >
                      {searchResult !== undefined ? "검색 결과가 없습니다." : ""}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            )}
            {activeTab === 2 && (
              <MDBox>
                {friendRequests && friendRequests.length > 0 ? (
                  <>
                    {friendRequests.map((f, idx) => (
                      <p
                        key={"friendRequest" + idx}
                        style={{
                          fontFamily: "Pretendard-Light",
                          fontSize: "1rem",
                          //width: "fit-content",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {f.targetName + "(" + f.targetId.slice(0, -3) + "***" + ")"}
                        {f.inbound ? (
                          <MDBox display="flex" gap="0.25rem">
                            <MDButton
                              {...btnStyles}
                              type="button"
                              variant="gradient"
                              color="info"
                              disabled={disabled}
                              onClick={() => approveFriendRequest(f.friendReqId, true)}
                            >
                              {disabled ? (
                                <MDBox component="img" src={loading} alt="loading" width="1rem" />
                              ) : (
                                "승인"
                              )}
                            </MDButton>
                            <MDButton
                              {...btnStyles}
                              type="button"
                              variant="gradient"
                              color="info"
                              disabled={disabled}
                              onClick={() => approveFriendRequest(f.friendReqId, false)}
                            >
                              {disabled ? (
                                <MDBox component="img" src={loading} alt="loading" width="1rem" />
                              ) : (
                                "거절"
                              )}
                            </MDButton>
                          </MDBox>
                        ) : (
                          <span style={{ color: "rgba(0, 0, 0, 0.5)" }}>승인 대기중</span>
                        )}
                      </p>
                    ))}
                  </>
                ) : (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="30.2575rem"
                  >
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                        fontSize: "1rem",
                      }}
                    >
                      친구 신청이 없습니다.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            )}
            {/* 우클릭 메뉴 */}
            {contextMenu?.open ? (
              <ClickAwayListener onClickAway={handleClickAwayContext}>
                <Menu
                  open={contextMenu?.open}
                  onClose={handleClose}
                  anchorReference="anchorPosition"
                  anchorPosition={{ top: contextMenu.y, left: contextMenu.x }}
                  onContextMenu={(event) => {
                    event.preventDefault(); // `Menu` 내부에서 기본 우클릭 방지
                    event.stopPropagation();
                  }}
                  sx={{
                    width: "0",
                  }}
                  PaperProps={{
                    style: {
                      transform: contextMenu?.open ? "translateY(0)" : "translateY(-20px)",
                      width: "auto", // Menu width
                      minWidth: "6rem", // Set maximum width
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
                  {(() => {
                    switch (contextMenu.type) {
                      case "back":
                        return [
                          <MenuItem
                            {...itemStyle}
                            key="grp"
                            onClick={() => {
                              handleClose();
                              setGrpReg(true);
                            }}
                          >
                            그룹 추가
                          </MenuItem>,
                        ];
                      case "friend":
                        return [
                          <MenuItem {...itemStyle} key="friend-block" onClick={handleClose}>
                            친구 홈
                          </MenuItem>,
                          <MenuItem
                            {...itemStyle}
                            key="friend-delete"
                            onClick={() => {
                              handleClose();
                              setFriendCOpen({
                                ...friendCOpen,
                                [friend.friendId]: true,
                              });
                            }}
                          >
                            친구 삭제
                          </MenuItem>,
                        ];
                      case "grp":
                        return [
                          <MenuItem
                            {...itemStyle}
                            key="friend-block"
                            onClick={() => {
                              handleClose();
                              handleEdit();
                            }}
                          >
                            그룹명 변경
                          </MenuItem>,
                          <MenuItem
                            {...itemStyle}
                            key="friend-delete"
                            onClick={() => {
                              handleClose();
                              setGrpCOpen({
                                ...grpCOpen,
                                [friendGrp.friendGrpId]: true,
                              });
                            }}
                          >
                            그룹 삭제
                          </MenuItem>,
                        ];
                      case "search":
                        return [
                          <MenuItem
                            {...itemStyle}
                            key="grp"
                            onClick={() => {
                              handleClose();
                              request();
                            }}
                          >
                            친구 신청
                          </MenuItem>,
                        ];
                      default:
                        return [
                          <MenuItem key="default-item" onClick={handleClose}>
                            none
                          </MenuItem>,
                        ];
                    }
                  })()}
                </Menu>
              </ClickAwayListener>
            ) : (
              <></>
            )}
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
        </ConfiguratorRoot>
      </ClickAwayListener>
    </>
  );
}

export default Friend;
