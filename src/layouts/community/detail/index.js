import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";

import MDBox from "components/MDBox";

import {
  deleteBoardMemo,
  findBoardMemo,
  findBoardMemoComments,
  findBoardCommentOrder,
  createBoardMemoComment,
  updateBoardMemoComment,
  deleteBoardMemoComment,
} from "../function";
import MDTypography from "components/MDTypography";
import Divider from "@mui/material/Divider";
import MDButton from "components/MDButton";
import loading from "assets/images/loading.gif";
import Confirm from "components/Confirm";
import MDSnackbar from "components/MDSnackbar";
import { FirstPage, LastPage } from "@mui/icons-material";
import { Menu, MenuItem, Pagination, PaginationItem } from "@mui/material";
import TextField from "@mui/material/TextField";
import * as commonFunc from "../../common/function";
import MDAvatar from "../../../components/MDAvatar";
import Icon from "@mui/material/Icon";
import ClickAwayListener from "@mui/base/ClickAwayListener";

function BoardMemo() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdmin = commonFunc.parseJwt("isAdmin");
  const myId = commonFunc.parseJwt("uuid");
  const [uuid, setUuid] = useState(null);
  const [render, setRender] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const boardId = 1;
  const { boardMemoId } = useParams();
  const [boardMemo, setBoardMemo] = useState({
    boardMemoId: boardMemoId,
    userId: "",
    userUuid: "",
    userName: "",
    profile: "",
    title: "",
    content: "",
    hit: 0,
    regDtm: "",
    updtDtm: "",
  });

  const [commentCreate, setCommentCreate] = useState({
    content: "",
    parentCommentId: null,
  });

  const [boardMemoComment, setBoardMemoComment] = useState([]);
  const [commentPages, setCommentPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10,
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

  const [cOpen, setCOpen] = useState({});

  const handleClickCOpen = (id) => {
    setCOpen((prev) => ({ ...prev, [id]: true }));
  };

  const handleCloseC = (id) => {
    setCOpen((prev) => ({ ...prev, [id]: false }));
  };

  const renderPage = () => {
    findBoardMemo(boardId, boardMemoId)
      .then((res) => {
        setBoardMemo({
          ...boardMemo,
          userId: res.data.userId,
          userUuid: res.data.userUuid,
          userName: res.data.userName,
          profile: res.data.profile,
          title: res.data.title,
          content: res.data.content,
          hit: res.data.hit,
          regDtm: res.data.regDtm.replace("T", " "),
          updtDtm: res.data.updtDtm ? res.data.updtDtm.replace("T", " ") : '"',
        });

        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
          setRender(!render);
        });
      })
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          redirect: true,
          open: true,
          icon: "warning",
          color: "warning",
          title: "커뮤니티",
          content: "존재하지 않는 게시글입니다.",
        });
      });
  };

  useEffect(() => {
    renderPage();
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // 첫 렌더링일 때는 무시
    }

    renderPage();
  }, [location.pathname]);

  const [findOrd, setFindOrd] = useState(true);

  const [highlightId, setHighlightId] = useState(null);
  useEffect(() => {
    const highlightElement = async () => {
      if (location.state?.boardCommentId) {
        await new Promise((resolve) => setTimeout(resolve, 250)); // 50ms 대기 (렌더링 보장)

        const targetElement = document.getElementById("comment" + location.state.boardCommentId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "instant", block: "center" });

          await new Promise((resolve) => setTimeout(resolve, 50));

          setHighlightId(location.state.boardCommentId);

          setTimeout(() => setHighlightId(null), 1000);
        } else if (findOrd) {
          findBoardCommentOrder(boardMemoId, location.state.boardCommentId)
            .then((res) => {
              const newPage = Math.floor(res.data / 10);
              const updateParams = {
                page: newPage,
                size: 10,
              };

              findBoardMemoComments(boardId, boardMemoId, updateParams).then((cRes) => {
                const mappedData = cRes.data.content.map((item) => ({
                  boardCommentId: item.boardCommentId,
                  userId: item.userId,
                  userUuid: item.userUuid,
                  userName: item.userName,
                  profile: item.profile,
                  content: item.content,
                  regDtm: item.regDtm.replace("T", " "),
                  updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
                  isDeleted: item.isDeleted,
                  children: item.children,
                }));
                setPageIndex(newPage);
                setBoardMemoComment(mappedData);
                setCommentPages(cRes.data.totalPages);
                setRender(!render);
              });
            })
            .catch((rej) => {})
            .finally(() => {
              setFindOrd(false); //무한루프 방지
            });
        }
      }
    };

    highlightElement();
  }, [render, location.state]);

  useEffect(() => {
    setFindOrd(true);
  }, [location.state]);

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
    navigate("/community/register", {
      state: { boardMemo },
    });
  };

  const handleClickDelete = (e) => {
    e.preventDefault();

    deleteBoardMemo(1, boardMemoId)
      .then((res) => {
        handleClose();
        navigate("/community");
      })
      .catch((rej) => {
        handleClose();
        setPopUpProps({
          ...popupProps,
          redirect: true,
          open: true,
          icon: "warning",
          color: "warning",
          title: "커뮤니티",
          content: "존재하지 않는 게시글입니다.",
        });
      });
  };

  const handleClickCDelete = (e, id) => {
    e.preventDefault();

    deleteBoardMemoComment(1, boardMemoId, id)
      .then((res) => {
        handleCloseC(id);
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
        });
      })
      .catch((rej) => {
        handleCloseC(id);
        setPopUpProps({
          ...popupProps,
          redirect: false,
          open: true,
          icon: "warning",
          color: "warning",
          title: "커뮤니티",
          content: "존재하지 않는 댓글입니다.",
        });
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
        });
      });
  };

  function closePopUp(redirect) {
    setPopUpProps({ ...popupProps, open: false });
    if (redirect) {
      window.history.back();
    }
  }

  const inputStyles = {
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "100%",
        paddingRight: "2rem",
      },
      endAdornment: (
        <InputAdornment
          position="end"
          style={{
            position: "absolute",
            bottom: 22,
            right: 0,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "1rem",
            }}
            onClick={() => {
              if (!disabled) register();
            }}
          >
            등록
          </span>
        </InputAdornment>
      ),
    },
    autoComplete: "off",
  };

  const editInputStyles = (comment) => ({
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "100%",
        paddingRight: "2rem",
      },
      endAdornment: (
        <InputAdornment
          position="end"
          style={{
            position: "absolute",
            bottom: 22,
            right: 0,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "0.5rem",
            }}
            onClick={() => handleCancel(comment.boardCommentId)}
          >
            취소
          </span>
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "1rem",
            }}
            onClick={() => update(comment.boardCommentId)}
          >
            저장
          </span>
        </InputAdornment>
      ),
    },
    autoComplete: "off",
  });

  const rInputStyles = (comment) => ({
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "100%",
        paddingRight: "2rem",
      },
      endAdornment: (
        <InputAdornment
          position="end"
          style={{
            position: "absolute",
            bottom: 22,
            right: 0,
          }}
        >
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "0.5rem",
            }}
            onClick={() => handleRCancel(comment.boardCommentId)}
          >
            취소
          </span>
          <span
            style={{
              cursor: "pointer",
              color: "#979797",
              marginRight: "1rem",
            }}
            onClick={() => {
              reply(rTempTexts[comment.boardCommentId], comment.boardCommentId);
            }}
          >
            저장
          </span>
        </InputAdornment>
      ),
    },
    autoComplete: "off",
  });

  const register = (parentCommendId) => {
    setDisabled(true);
    const updateCreate = {
      ...commentCreate,
      parentCommentId: parentCommendId,
    };
    createBoardMemoComment(boardId, boardMemoId, updateCreate)
      .then((res) => {
        setDisabled(false);
        setCommentCreate({
          content: "",
          parentCommentId: null,
        });
        const updateParams = {
          page: 0,
          size: 10,
        };
        setSearchParams(updateParams);
        findBoardMemoComments(boardId, boardMemoId, updateParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
          setPageIndex(0);
        });
      })
      .catch((rej) => {
        setDisabled(false);
      });
  };

  const reply = (content, parentCommendId) => {
    setDisabled(true);
    const updateCreate = {
      content: content,
      parentCommentId: parentCommendId,
    };
    createBoardMemoComment(boardId, boardMemoId, updateCreate)
      .then((res) => {
        setDisabled(false);
        handleRCancel(parentCommendId);
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
        });
      })
      .catch((rej) => {
        setDisabled(false);
        handleRCancel(parentCommendId);
        setPopUpProps({
          ...popupProps,
          redirect: false,
          open: true,
          icon: "warning",
          color: "warning",
          title: "커뮤니티",
          content: "존재하지 않는 댓글입니다.",
        });
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
        });
      });
  };

  const update = (id) => {
    setDisabled(true);
    updateBoardMemoComment(boardId, boardMemoId, id, tempTexts[id])
      .then((res) => {
        setDisabled(false);
        handleCancel(id);
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
          setPageIndex(0);
        });
      })
      .catch((rej) => {
        setDisabled(false);
        handleCancel(id);
        setPopUpProps({
          ...popupProps,
          redirect: false,
          open: true,
          icon: "warning",
          color: "warning",
          title: "커뮤니티",
          content: "존재하지 않는 댓글입니다.",
        });
        findBoardMemoComments(boardId, boardMemoId, searchParams).then((cRes) => {
          const mappedData = cRes.data.content.map((item) => ({
            boardCommentId: item.boardCommentId,
            userId: item.userId,
            userUuid: item.userUuid,
            userName: item.userName,
            profile: item.profile,
            content: item.content,
            regDtm: item.regDtm.replace("T", " "),
            updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
            isDeleted: item.isDeleted,
            children: item.children,
          }));
          setBoardMemoComment(mappedData);
          setCommentPages(cRes.data.totalPages);
        });
      });
  };

  const spanStyle = {
    style: {
      fontSize: "0.85rem",
      color: "#979797",
      cursor: "pointer",
    },
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map((comment, idx) => (
      <div
        id={"comment" + comment.boardCommentId}
        key={comment.boardCommentId}
        style={{
          width: "100%",
          paddingLeft: `${depth > 0 ? 1 : 0}%`,
          backgroundColor: highlightId === comment.boardCommentId ? "#FFF3CD" : "transparent",
          transition: "background-color 0.5s ease-in-out",
        }}
      >
        {editingStates[comment.boardCommentId] ? (
          <MDBox mt={1} mb={1}>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Light",
                fontSize: "1rem",
                marginBottom: 0.5,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={(e) => {
                handleContextMenu(e, "profile");
                setUuid(comment.userUuid);
              }}
            >
              {comment.profile ? (
                <MDAvatar
                  id="profile"
                  src={"/images/" + comment.profile}
                  alt="profile-image"
                  sx={{
                    width: "1.4rem",
                    height: "1.4rem",
                  }}
                  shadow="sm"
                />
              ) : (
                <Icon
                  sx={{
                    fontSize: "1.4rem !important",
                    color: "#7B809A",
                  }}
                >
                  account_circle
                </Icon>
              )}
              &nbsp;
              <b>{comment.userName + "(" + comment.userId + ")"}</b>
            </MDTypography>
            <TextField
              {...editInputStyles(comment)}
              fullWidth
              name={"comment" + comment.boardCommentId}
              id={"comment" + comment.boardCommentId}
              onChange={(e) => {
                setTempTexts((prev) => ({ ...prev, [comment.boardCommentId]: e.target.value }));
              }}
              multiline
              value={tempTexts[comment.boardCommentId]}
              placeholder="내용을 입력하세요"
            />
          </MDBox>
        ) : (
          <>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Light",
                fontSize: "1rem",
                whiteSpace: "pre-wrap",
              }}
            >
              <MDBox
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <MDBox
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    handleContextMenu(e, "profile");
                    setUuid(comment.userUuid);
                  }}
                >
                  {comment.profile ? (
                    <MDAvatar
                      id="profile"
                      src={"/images/" + comment.profile}
                      alt="profile-image"
                      sx={{
                        width: "1.4rem",
                        height: "1.4rem",
                      }}
                      shadow="sm"
                    />
                  ) : (
                    <Icon
                      sx={{
                        fontSize: "1.4rem !important",
                        color: "#7B809A",
                      }}
                    >
                      account_circle
                    </Icon>
                  )}
                  &nbsp;
                  <b>{comment.userName + "(" + comment.userId + ")"}</b>
                </MDBox>
                <MDBox>
                  {(isAdmin || myId === comment.userUuid) && !comment.isDeleted ? (
                    <>
                      <span {...spanStyle} onClick={() => handleEdit(comment)}>
                        수정
                      </span>
                      &nbsp;&nbsp;
                      <span {...spanStyle} onClick={() => handleClickCOpen(comment.boardCommentId)}>
                        삭제
                      </span>
                      <Confirm
                        title="정말 삭제하시겠습니까?"
                        open={cOpen[comment.boardCommentId]}
                        onClose={() => handleCloseC(comment.boardCommentId)}
                        agreeFunc={(e) => handleClickCDelete(e, comment.boardCommentId)}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </MDBox>
              </MDBox>
              {comment.isDeleted ? <b>-삭제된 댓글입니다-</b> : comment.content + "\n"}
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "#979797",
                }}
              >
                {comment.regDtm.replace("T", " ")}
                <span style={{ cursor: "pointer" }} onClick={() => handleREdit(comment)}>
                  &nbsp;&nbsp;답글 달기
                </span>
              </p>
            </MDTypography>
            {rEditingStates[comment.boardCommentId] ? (
              <MDBox mt={1} mb={1}>
                <TextField
                  {...rInputStyles(comment)}
                  fullWidth
                  name={"rcomment" + comment.boardCommentId}
                  id={"rcomment" + comment.boardCommentId}
                  onChange={(e) => {
                    setRTempTexts((prev) => ({
                      ...prev,
                      [comment.boardCommentId]: e.target.value,
                    }));
                  }}
                  multiline
                  value={rTempTexts[comment.boardCommentId]}
                  placeholder="내용을 입력하세요"
                />
              </MDBox>
            ) : (
              <></>
            )}
          </>
        )}
        <Divider
          variant="fullWidth"
          sx={{
            width: "100%",
            paddingLeft: -1,
            marginY: 1,
            backgroundColor: "rgba(0, 0, 0, 1)",
            transform: "scaleY(0.99)",
          }}
        />
        {comment.children &&
          comment.children.length > 0 &&
          renderComments(comment.children, depth + 1)}
      </div>
    ));
  };

  const [editingStates, setEditingStates] = useState({});

  const [tempTexts, setTempTexts] = useState({});

  const handleEdit = (comment) => {
    setEditingStates((prev) => ({ ...prev, [comment.boardCommentId]: true }));
    setTempTexts((prev) => ({ ...prev, [comment.boardCommentId]: comment.content }));
  };

  const handleCancel = (id) => {
    setEditingStates((prev) => ({ ...prev, [id]: false }));
  };

  const [rEditingStates, setREditingStates] = useState({});

  const [rTempTexts, setRTempTexts] = useState({});

  const handleREdit = (comment) => {
    setREditingStates((prev) => ({ ...prev, [comment.boardCommentId]: true }));
    setRTempTexts((prev) => ({ ...prev, [comment.boardCommentId]: "" }));
  };

  const handleRCancel = (id) => {
    setREditingStates((prev) => ({ ...prev, [id]: false }));
  };

  const gotoPage = (page) => {
    setPageIndex(page);
    const updatedParams = { ...searchParams, page };
    setSearchParams(updatedParams);
    handlePage(updatedParams);
  };

  function handlePage(updatedParams) {
    findBoardMemoComments(boardId, boardMemoId, updatedParams).then((cRes) => {
      const mappedData = cRes.data.content.map((item) => ({
        boardCommentId: item.boardCommentId,
        userId: item.userId,
        userUuid: item.userUuid,
        userName: item.userName,
        profile: item.profile,
        content: item.content,
        regDtm: item.regDtm.replace("T", " "),
        updtDtm: item.updtDtm ? item.updtDtm.replace("T", " ") : '"',
        isDeleted: item.isDeleted,
        children: item.children,
      }));
      setBoardMemoComment(mappedData);
      setCommentPages(cRes.data.totalPages);
    });
  }

  const gotoFirst = () => {
    setPageIndex(0);
    gotoPage(0);
  };

  const gotoLast = () => {
    setPageIndex(commentPages - 1);
    gotoPage(commentPages - 1);
  };

  const handlePageChange = (newPage) => {
    gotoPage(newPage);
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

  const handleClickAwayContext = (e) => {
    if (contextMenu?.open) {
      handleRightMenuClose();
    }
  };

  const handleRightMenuClose = () => {
    setContextMenu(null);
  };

  const itemStyle = {
    sx: {
      fontFamily: "Pretendard-Light",
      fontSize: "0.9rem",
      width: "4.5rem !important",
      maxWidth: "4.5rem !important",
      minWidth: "4.5rem !important",
      display: "flex",
      justifyContent: "center",
      paddingX: "0.5rem",
      paddingY: "0",
    },
  };

  const searchWrittens = () => {
    const queryObj = new URLSearchParams();

    queryObj.append("searchType", "uuid");
    queryObj.append("searchValue", uuid);

    const url = queryObj.toString() ? `/community?${queryObj.toString()}` : "/community";

    navigate(url);
  };

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
            height: "100%",
          }}
        >
          <MDBox mx={2} mt={2}>
            <MDTypography sx={{ fontFamily: "Pretendard-Bold", fontSize: "2rem" }}>
              {boardMemo.title}
            </MDTypography>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Light",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              {boardMemo.regDtm}
              &nbsp;&nbsp;
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  handleContextMenu(e, "profile");
                  setUuid(boardMemo.userUuid);
                }}
              >
                {boardMemo.profile ? (
                  <MDAvatar
                    id="profile"
                    src={"/images/" + boardMemo.profile}
                    alt="profile-image"
                    sx={{
                      width: "1.4rem",
                      height: "1.4rem",
                    }}
                    shadow="sm"
                  />
                ) : (
                  <Icon
                    sx={{
                      fontSize: "1.4rem !important",
                      color: "#7B809A",
                    }}
                  >
                    account_circle
                  </Icon>
                )}
                &nbsp;
                <b>{boardMemo.userName + "(" + boardMemo.userId + ")"}</b>
              </MDBox>
              &nbsp;&nbsp;조회수&nbsp;<b>{boardMemo.hit}</b>
            </MDTypography>
            <Divider sx={dividerStyles} />
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Regular",
                fontSize: "1.5rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {boardMemo.content + "\n"}
            </MDTypography>
            <MDBox mt={4}>
              <MDBox mt={1} mb={1}>
                <TextField
                  {...inputStyles}
                  fullWidth
                  type="text"
                  name="content"
                  id="content"
                  onChange={(e) => {
                    setCommentCreate({
                      ...commentCreate,
                      content: e.target.value,
                    });
                  }}
                  value={commentCreate.content}
                  placeholder="댓글을 남겨보세요"
                  multiline
                />
              </MDBox>
              {boardMemoComment && boardMemoComment.length > 0 ? (
                <>
                  {renderComments(boardMemoComment)}
                  {commentPages && commentPages > 1 ? (
                    <MDBox
                      display="flex"
                      mt={1.5}
                      mb={1.5}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <FirstPage
                        onClick={pageIndex === 0 ? undefined : gotoFirst}
                        sx={{
                          borderRadius: "100%", // 동그라미 효과
                          padding: "8px", // 크기 조정
                          marginTop: "2px",
                          transition: "background-color 0.2s ease-in-out", // 부드러운 전환 효과
                          "&:hover": {
                            backgroundColor: pageIndex === 0 ? "inherit" : "rgba(0, 0, 0, 0.03)", // 회색 반투명 배경 (MUI 기본값)
                          },
                          cursor: pageIndex === 0 ? "default" : "pointer",
                          backgroundColor: pageIndex === 0 ? "transparent" : "inherit",
                          opacity: pageIndex === 0 ? 0.4 : 1,
                          width: "2rem",
                          height: "2rem",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      />
                      <Pagination
                        count={commentPages}
                        siblingCount={2}
                        boundaryCount={0}
                        page={pageIndex + 1}
                        onChange={(_, value) => handlePageChange(value - 1)}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "#495057", // 기본 텍스트 색상
                          },
                          "& .MuiPaginationItem-root.Mui-selected": {
                            backgroundColor: "#1A73E8", // 선택된 페이지 색상
                            color: "white !important", // 선택된 텍스트 색상
                          },
                          "& .MuiPaginationItem-root.Mui-selected:hover": {
                            backgroundColor: "#1765C3", // 선택된 페이지 호버 시 색상 (조금 더 어둡게)
                          },
                        }}
                        renderItem={(item) => {
                          if (item.type === "start-ellipsis" || item.type === "end-ellipsis") {
                            return null;
                          }

                          if (commentPages > 4) {
                            if (
                              pageIndex > 1 &&
                              ((pageIndex < commentPages - 2 && item.page - 1 < pageIndex - 2) ||
                                (pageIndex >= commentPages - 2 && item.page - 1 < commentPages - 5))
                            ) {
                              return null;
                            }

                            if (pageIndex <= 2) {
                              if (item.page > 5) return null;
                            } else {
                              if (item.page - 1 > pageIndex + 2) return null;
                            }
                          }

                          return (
                            <PaginationItem
                              sx={{
                                transition: "none",
                                fontFamily: "Pretendard-Light",
                                fontSize: "0.9rem",
                              }}
                              {...item}
                            />
                          );
                        }}
                      />
                      <LastPage
                        onClick={pageIndex === commentPages - 1 ? undefined : gotoLast}
                        sx={{
                          borderRadius: "100%", // 동그라미 효과
                          padding: "8px", // 크기 조정
                          marginTop: "2px",
                          transition: "background-color 0.2s ease-in-out", // 부드러운 전환 효과
                          "&:hover": {
                            backgroundColor:
                              pageIndex === commentPages - 1 ? "inherit" : "rgba(0, 0, 0, 0.03)",
                          },
                          cursor: pageIndex === commentPages - 1 ? "default" : "pointer",
                          backgroundColor:
                            pageIndex === commentPages - 1 ? "transparent" : "inherit",
                          opacity: pageIndex === commentPages - 1 ? 0.4 : 1,
                          width: "2rem",
                          height: "2rem",
                          color: "rgba(0, 0, 0, 0.87)",
                        }}
                      />
                    </MDBox>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </MDBox>
          </MDBox>
        </Card>
        <MDBox mt={1.5} mx={3} display="flex" gap="0.5rem">
          <MDTypography
            variant="button"
            color="text"
            textGradient
            onClick={() => {
              const page = queryParams.get("page");
              const searchType = queryParams.get("searchType");
              const searchValue = queryParams.get("searchValue");

              const queryObj = new URLSearchParams();

              if (page) queryObj.append("page", page);
              if (searchType) queryObj.append("searchType", searchType);
              if (searchValue) queryObj.append("searchValue", searchValue);

              const url = queryObj.toString() ? `/community?${queryObj.toString()}` : "/community";

              navigate(url);
            }}
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
          {isAdmin || myId === boardMemo.userUuid ? (
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
                minWidth: "5.5rem",
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
                case "profile":
                  return [
                    <MenuItem
                      {...itemStyle}
                      key="profile"
                      onClick={() => {
                        handleRightMenuClose();
                        searchWrittens();
                      }}
                    >
                      작성글 보기
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

export default BoardMemo;
