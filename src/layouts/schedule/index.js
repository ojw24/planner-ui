import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { flushSync } from "react-dom";
import { useFormik } from "formik";

import {
  Menu,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { DesktopTimePicker } from "@mui/x-date-pickers";
import SendIcon from "@mui/icons-material/Send";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./style.css";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Modal from "components/Modal";
import MDInput from "components/MDInput";
import loading from "assets/images/loading.gif";
import MDSnackbar from "components/MDSnackbar";
import Confirm from "components/Confirm";

import * as func from "./function";
import * as freindFunc from "examples/Friend/function";
import * as goalFunc from "layouts/goal/function";
import * as Yup from "yup";

dayjs.locale("ko");

function Schedule() {
  const today = new Date();
  const location = useLocation();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(dayjs(today).format("YYYY-MM-DD"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElYear, setAnchorElYear] = useState(null);
  const [yearRange, setYearRange] = useState(year - 2);
  const [contextMenu, setContextMenu] = useState(null);
  const [scheduleReg, setScheduleReg] = useState(false);
  const [scheduleShare, setScheduleShare] = useState(false);
  const [scheduleShareReq, setScheduleShareReq] = useState(false);
  const [isGoal, setIsGoal] = useState(false);
  const [create, setCreate] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [schedule, setSchedule] = useState({
    name: "",
  });
  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });
  const [open, setOpen] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [shareReqs, setShareReqs] = useState([]);
  const calendarRef = useRef(null);

  const [query, setQuery] = useState("");

  const [edit, setEdit] = useState(false);
  const [yearGoal, setYearGoal] = useState(null);
  const [monthGoal, setMonthGoal] = useState({});
  const [searchParams, setSearchParams] = useState({
    goalType: "goal_type_002",
    searchDate: new Date().toISOString().split("T")[0],
    detail: true,
  });

  // friendUserName 기준으로 필터링
  const filteredFriends = friends.filter((friend) => friend.friendUserName.includes(query));

  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const [checkedEvents, setCheckedEvents] = useState({});

  useEffect(() => {
    func.findScheduleShareRequests().then((res) => {
      setShareReqs(res.data);
    });
  }, []);

  useEffect(() => {
    const searchParams = {
      goalType: "goal_type_001",
      searchDate: new Date().toISOString().split("T")[0],
      detail: false,
    };
    goalFunc.findGoalBy(searchParams).then((res) => {
      setYearGoal(res.data);
    });
  }, []);

  useEffect(() => {
    const searchParams = {
      goalType: "goal_type_002",
      searchDate: new Date().toISOString().split("T")[0],
      detail: true,
    };
    goalFunc.findGoalBy(searchParams).then((res) => {
      setMonthGoal(res.data);
      goalToEvents(res.data?.children);
    });
  }, []);

  // 바깥 클릭 감지 → 선택 해제
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) // 공유 버튼 클릭 예외 처리
      ) {
        setSelectedFriends([]); // 선택 해제
        setLastSelectedIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [highlightId, setHighlightId] = useState(null);
  useEffect(() => {
    if (location.state?.reqId) {
      setScheduleShareReq(true);
      const highlightElement = async () => {
        const targetElement = document.getElementById("friendRequest" + location.state.reqId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "instant", block: "center" });

          await new Promise((resolve) => setTimeout(resolve, 50));

          setHighlightId(location.state.reqId);

          setTimeout(() => setHighlightId(null), 1000);
        }
      };

      const delayThenHighlight = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 200ms 대기
        highlightElement();
      };

      delayThenHighlight();

      const { reqId, ...newState } = location.state || {};
      window.history.replaceState({ ...newState }, "");
    }
  }, [location.state]);

  const handleSelectFriend = (event, friend, index) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift + 클릭: 범위 선택
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeSelection = filteredFriends.slice(start, end + 1); // 전체 객체 저장

      setSelectedFriends((prev) => {
        const newSelection = [
          ...new Map([...prev, ...rangeSelection].map((f) => [f.friendUserId, f])).values(),
        ];
        return newSelection;
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl + 클릭 (Mac에선 metaKey)
      setSelectedFriends((prev) =>
        prev.some((f) => f.friendUserId === friend.friendUserId)
          ? prev.filter((f) => f.friendUserId !== friend.friendUserId)
          : [...prev, friend]
      );
    } else {
      // 일반 클릭: 단일 선택
      setSelectedFriends([friend]);
    }
    setLastSelectedIndex(index);
  };

  const handleClickCOpen = () => {
    setOpen(true);
  };

  const handleCClose = () => {
    setOpen(false);
  };

  const handleClickSCOpen = () => {
    setSOpen(true);
  };

  const handleSCClose = () => {
    setSOpen(false);
  };

  const prevMonth = () => {
    setEvents([]);
    if (month === 0) {
      setYear((prev) => prev - 1);
      setMonth(11);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    setEvents([]);
    if (month === 11) {
      setYear((prev) => prev + 1);
      setMonth(0);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (selectedMonth) => {
    setAnchorEl(null);
    if (selectedMonth != null) {
      setMonth(selectedMonth);
    }
    setSchedule({
      name: "",
    });
  };

  const handleModalClose = () => {
    setScheduleShareReq(false);
    setScheduleShare(false);
    setScheduleReg(false);
    setTimeout(() => {
      setSelectedFriends([]);
      setLastSelectedIndex(null);
      setSchedule({});
      const formattedDate =
        today && dayjs(today).isValid() ? dayjs(today).format("YYYY-MM-DD") : "";
      setDay(formattedDate);
      formik.resetForm();
    }, 300);
    formik.resetForm();
  };

  const handleYearClick = (event) => {
    setYearRange(year - 2);
    setAnchorElYear(event.currentTarget);
  };

  const handleYearClose = (selectedYear) => {
    if (selectedYear != null) {
      setYear(selectedYear);
    }
    setAnchorElYear(null);
  };

  const shiftYearRange = (direction) => {
    setYearRange((prev) => prev + direction * 5);
  };

  const handleScroll = (event) => {
    if (event.deltaY > 0) {
      setYearRange((prev) => prev + 1);
    } else {
      setYearRange((prev) => prev - 1);
    }
  };

  const changeToSpecificDate = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(new Date(year, month, 1));
  };

  useEffect(() => {
    changeToSpecificDate();
    const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
    setSearchParams({
      ...searchParams,
      searchDate: searchDate,
    });

    const yearParams = {
      goalType: "goal_type_001",
      searchDate: searchDate,
      detail: false,
    };
    goalFunc.findGoalBy(yearParams).then((res) => {
      setYearGoal(res.data);
    });

    const monthParams = {
      goalType: "goal_type_002",
      searchDate: searchDate,
      detail: true,
    };
    goalFunc.findGoalBy(monthParams).then((res) => {
      setMonthGoal(res.data);
      goalToEvents(res.data?.children);
    });

    func.findSchedules(searchDate).then((res) => {
      dataToEvents(res.data);
    });
  }, [year, month]);

  const dataToEvents = (data) => {
    if (data && data.length > 0) {
      const newEvents = [];
      data.forEach((item) => {
        newEvents.push({
          id: String(item.scheduleId),
          title: item.name,
          start: item.startDtm,
          end: item.endDtm,
          extendedProps: {
            userId: item.userId,
            userName: item.userName,
            location: item.location,
            shared: item.shared,
          },
        });
      });

      setEvents(newEvents);
    }
  };

  const goalToEvents = (children) => {
    if (children && children.length > 0) {
      const newEvents = [];
      children.forEach((child) => {
        if (child.schedule) {
          newEvents.push({
            id: String(child.schedule.scheduleId),
            title: child.schedule.name,
            start: child.schedule.startDtm,
            end: child.schedule.endDtm,
            extendedProps: {
              goalId: child.goalId,
              userId: child.schedule.userId,
              userName: child.schedule.userName,
              location: child.schedule.location,
              shared: child.schedule.shared,
            },
          });
          setCheckedEvents((prevState) => ({
            ...prevState,
            [child.goalId]: child.isAchieve,
          }));
        }
      });

      setGoalEvents(newEvents);
    }
  };

  useEffect(() => {
    func.findSchedules(today.toISOString().split("T")[0]).then((res) => {
      dataToEvents(res.data);
    });
  }, []);

  const [events, setEvents] = useState([]);
  const [goalEvents, setGoalEvents] = useState([]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentDate = calendarApi.getDate(); // 현재 날짜 가져오기

      //calendarApi.refetchEvents(); // 새 이벤트 데이터 반영
      calendarApi.removeAllEvents(); // 기존 이벤트 삭제
      calendarApi.addEventSource(events); // 새로운 이벤트 추가
      calendarApi.addEventSource(goalEvents);
      calendarApi.gotoDate(currentDate); // 기존 날짜 유지
    }
  }, [events, goalEvents]);

  const handleClickAway = (e) => {
    if (anchorEl && !anchorEl.contains(e.target)) {
      handleClose();
    }
  };

  const handleYearClickAway = (e) => {
    if (anchorElYear && !anchorElYear.contains(e.target)) {
      handleYearClose();
    }
  };

  const handleContextMenu = (event, type, isGoal) => {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      open: true,
      isGoal: isGoal ? isGoal : false,
      type, // 우클릭한 요소의 타입 저장
    });
  };

  const handleRightMenuClose = () => {
    setContextMenu(null);
    if (create) {
      setSchedule({
        name: "",
      });
    }
  };

  const handleClickAwayContext = (e) => {
    if (contextMenu?.open) {
      handleRightMenuClose();
    }
  };

  const btnStyle = {
    sx: {
      color: "#344767",
      width: "1rem !important",
      minWidth: "1rem !important",
      fontSize: "1rem",
      background: "none !important",
      border: "none ",
      padding: 0,
      textDecoration: "none",
      boxShadow: "none !important",
      "&:hover": {
        background: "none !important",
        border: "none !important",
        boxShadow: "none !important",
      },
      "&:focus": {
        backgroundColor: "transparent !important",
        background: "transparent !important",
        color: "none !important",
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
      },
      "&:active": {
        backgroundColor: "transparent !important",
        background: "transparent !important",
        color: "none !important",
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
      },
      "& span": {
        background: "transparent !important",
        boxShadow: "none !important",
      },
    },
  };

  const itemStyle = {
    sx: {
      fontFamily: "Pretendard-Light",
      fontSize: "0.9rem",
      width: "4rem !important",
      maxWidth: "4rem !important",
      minWidth: "4rem !important",
      display: "flex",
      justifyContent: "center",
      paddingX: "0.5rem",
      paddingY: "0",
    },
  };

  const handleDayCellMount = (info) => {
    info.el.addEventListener("contextmenu", (e) => {
      const formattedDate =
        info.date && dayjs(info.date).isValid() ? dayjs(info.date).format("YYYY-MM-DD") : "";
      setDay(formattedDate);
      e.preventDefault(); // 기본 우클릭 메뉴 방지
      setCreate(true);
      handleContextMenu(e, "day");
    });
  };

  const handleCheckboxChange = (goalId, e) => {
    setCheckedEvents((prevState) => ({
      ...prevState,
      [goalId]: e.target.checked,
    }));
    const updateProps = {
      goalId: goalId,
      isArchive: e.target.checked,
    };
    goalFunc.updateGoal(updateProps).catch((rej) => {
      setPopUpProps({
        ...popupProps,
        open: true,
        icon: "warning",
        color: "warning",
        title: "일정관리",
        content: "존재하지 않는 목표입니다.",
      });
      const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
      const monthParams = {
        goalType: "goal_type_002",
        searchDate: searchDate,
        detail: true,
      };

      goalFunc.findGoalBy(monthParams).then((res) => {
        setMonthGoal(res.data);
        goalToEvents(res.data?.children);
      });
    });
  };

  const handleEventCellMount = (info) => {
    info.el.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // 기본 우클릭 메뉴 방지
      e.stopPropagation();
      setIsGoal(info.event.extendedProps.goalId);
      setCreate(false);
      setSchedule({
        goalId: info.event.extendedProps.goalId,
        scheduleId: info.event.id,
        name: info.event.title,
        startDate: info.event.startStr.split("T")[0],
        startTime: info.event.startStr.split("T")[1].slice(0, 5),
        endDate: info.event.endStr
          ? info.event.endStr.split("T")[0]
          : info.event.startStr.split("T")[0],
        endTime: info.event.endStr
          ? info.event.endStr.split("T")[1].slice(0, 5)
          : info.event.startStr.split("T")[1].slice(0, 5),
        location: info.event.extendedProps.location,
        shared: info.event.extendedProps.shared,
        userId: info.event.extendedProps.userId,
        userName: info.event.extendedProps.userName,
      });
      handleContextMenu(e, "edit", info.event.extendedProps.goalId);
    });
  };

  const inputStyles = {
    variant: "standard",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "20rem",
      },
      readOnly: schedule.shared,
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

  const datePickerStyles = {
    textField: {
      sx: {
        fontFamily: "Pretendard-Light",
        width: "9.1rem",
        "& .MuiInputBase-input::placeholder": {
          fontSize: "0.8rem", // placeholder 폰트 크기 조절
          fontFamily: "Pretendard-Light", // 원하는 폰트 적용
          color: "#999", // placeholder 색상 변경 가능
        },
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": { borderColor: "#0d47a1" },
        },
        "& .MuiInputBase-input": {
          fontSize: "0.8rem", // 원하는 폰트 크기로 설정
          fontFamily: "Pretendard-Light",
          paddingRight: 0,
        },
      },
    },
    day: {
      sx: {
        fontFamily: "Pretendard-Light",
        "&[aria-current='date']:focus": {
          backgroundColor: "white !important",
        },
        "&.Mui-selected:focus, &[aria-current='date'].Mui-selected:focus": {
          backgroundColor: "#1976d2 !important",
          color: "#fff !important",
        },
      },
    },
    desktopPaper: {
      sx: {
        height: "21rem",
        "& .MuiDayCalendar-weekDayLabel": {
          fontFamily: "Pretendard-Bold",
          color: "black",
        },
        "& .MuiPickersCalendarHeader-label": {
          fontFamily: "Pretendard-Bold",
        },
        "& .MuiPickersMonth-monthButton": {
          fontFamily: "Pretendard-Bold",
          fontSize: "1rem",
          borderRadius: 0,
          margin: 0,
          height: "4rem",
          backgroundColor: "transparent !important",
          "&:hover": {
            backgroundColor: "transparent !important",
            fontSize: "1.1rem",
          },
        },
        "& .MuiPickersMonth-monthButton.Mui-selected": {
          backgroundColor: "transparent !important", // 선택된 월 배경색
          fontSize: "1.1rem",
          color: "black !important",
        },
        "& .MuiPickersMonth-root[aria-current='true']": {
          backgroundColor: "transparent !important",
        },
        "& .MuiPickersYear-yearButton": {
          fontFamily: "Pretendard-Bold",
          fontSize: "1rem",
          "&:hover": {
            backgroundColor: "transparent !important", // 마우스 오버 시 배경색
            fontSize: "1.1rem",
          },
          "&.Mui-selected": {
            backgroundColor: "transparent !important", // 선택된 월 배경색
            fontSize: "1.1rem",
            color: "black !important",
          },
        },
        "& .MuiPickersYear-yearButton[aria-current='date']": {
          backgroundColor: "transparent !important",
        },
        "& .Mui-selected": {
          backgroundColor: "#1976d2 !important", // 선택된 날짜 배경색
          color: "#fff", // 글자색
        },
        "& .Mui-selected:hover, & .Mui-selected.MuiPickersDay-root:hover": {
          backgroundColor: "#1976d2 !important", // 선택된 날짜 배경색
          color: "#fff !important", // 글자색
        },
        "& .MuiPickersDay-root:hover": {
          backgroundColor: "inherit !important",
          color: "inherit !important",
          fontWeight: 600,
        },
      },
    },
  };

  const boxStyles = {
    mb: 2,
    height: "3.2rem",
  };

  const btnStyles = {
    sx: {
      fontFamily: "'Pretendard-Bold', sans-serif",
      fontSize: "0.9rem",
      lineHeight: 1,
      width: "4rem",
      minHeight: "1rem",
      height: "2rem",
      padding: 0,
    },
  };

  const sBtnStyles = {
    sx: {
      fontFamily: "'Pretendard-Bold', sans-serif",
      fontSize: "0.8rem",
      lineHeight: 1,
      width: "3rem",
      minWidth: "3rem",
      minHeight: "1rem",
      height: "1.5rem",
      padding: 0,
    },
  };

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  const inputCore = (formik, fieldName, setSchedule) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: (e) => {
      if (fieldName === "name" && schedule.name) {
        flushSync(() => {
          formik.setFieldValue(fieldName, schedule.name); // 동기적으로 값 설정
        });
        formik.handleBlur(e);
      } else {
        formik.handleBlur(e);
      }
    },
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName],
    onChange: (e) => {
      const value = e.target.value;
      const encoder = new TextEncoder();
      const byteLength = encoder.encode(value).length;
      const max = 255;

      if (byteLength <= max) {
        setSchedule((prev) => ({ ...prev, [fieldName]: e.target.value }));
        formik.handleChange(e);
      }
    },
  });

  const dateCore = (formik, fieldName, setSchedule) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    value: dayjs(formik.values[fieldName]),
    onChange: (e) => {
      const formattedDate = e && dayjs(e).isValid() ? dayjs(e).format("YYYY-MM-DD") : "";
      setSchedule((prev) => ({ ...prev, [fieldName]: formattedDate }));
      formik.setFieldValue(fieldName, formattedDate);
    },
  });

  const timeCore = (formik, fieldName, setSchedule) => ({
    error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
    onBlur: formik.handleBlur,
    helperText: formik.touched[fieldName] && formik.errors[fieldName],
    value: formik.values[fieldName] ? dayjs(formik.values[fieldName], "HH:mm") : null,
    onChange: (e) => {
      const formattedTime = e && dayjs(e).isValid() ? dayjs(e).format("HH:mm") : "";
      setSchedule((prev) => ({ ...prev, [fieldName]: formattedTime }));
      formik.setFieldValue(fieldName, formattedTime);
    },
  });

  const timePickerProps = {
    disableOpenPicker: true,
    ampm: false,
    sx: {
      width: "9.1rem",
      "& .MuiInputBase-input": {
        fontFamily: "Pretendard-Light",
        fontSize: "0.8rem",
      },
    },
  };

  const textRef = useRef([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      startDate: "",
      startTime: "",
      endTime: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(255)
        .required("* " + (isGoal ? "목표" : "일정") + "명을 입력하세요"),
      startDate: Yup.string().required("* 시작일을 선택하세요"),
      startTime: Yup.string().required("* 시작 시간을 선택하세요"),
      endTime: Yup.string().required("* 종료 시간을 선택하세요"),
    }),
    validateOnChange: false,
    onSubmit: () => {
      handleSubmit();
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!schedule.name) {
      formik.setFieldTouched("name", true);
      textRef.current[0]?.focus();
    } else if (!schedule.startDate) {
      formik.setFieldTouched("startDate", true);
      textRef.current[1]?.focus();
    } else if (!schedule.startTime) {
      formik.setFieldTouched("startTime", true);
      textRef.current[2]?.focus();
    } else if (!schedule.endTime) {
      formik.setFieldTouched("endTime", true);
      textRef.current[3]?.focus();
    } else if (schedule.startDate && schedule.endDate) {
      if (dayjs(schedule.startDate).isAfter(dayjs(schedule.endDate))) {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "일정관리",
          content: "시작일은 종료일 이전이어야 합니다.",
        });
      } else {
        if (schedule.startTime && schedule.endTime) {
          const startTime = dayjs(
            `${schedule.startDate} ${schedule.startTime}`,
            "YYYY-MM-DD HH:mm"
          );
          const endTime = dayjs(`${schedule.endDate} ${schedule.endTime}`, "YYYY-MM-DD HH:mm");
          if (startTime.isAfter(endTime)) {
            setPopUpProps({
              ...popupProps,
              open: true,
              icon: "warning",
              color: "warning",
              title: "일정관리",
              content: "시작 시간은 종료 시간 이전이어야 합니다.",
            });
          } else {
            register();
          }
        }
      }
    } else if (schedule.startTime && schedule.endTime) {
      const startTime = dayjs(`${schedule.startDate} ${schedule.startTime}`, "YYYY-MM-DD HH:mm");
      const endTime = dayjs(
        `${schedule.endDate || schedule.startDate} ${schedule.endTime}`,
        "YYYY-MM-DD HH:mm"
      );
      if (startTime.isAfter(endTime)) {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "일정관리",
          content: "시작 시간은 종료 시간 이전이어야 합니다.",
        });
      } else {
        register();
      }
    }
  }

  const register = () => {
    if (create) {
      setDisabled(true);
      const createProps = {
        name: schedule.name,
        startDtm: `${schedule.startDate}T${schedule.startTime}`,
        endDtm: schedule.endDate
          ? `${schedule.endDate}T${schedule.endTime}`
          : `${schedule.startDate}T${schedule.endTime}`,
        location: schedule.location,
      };
      if (isGoal) {
        const create = {
          parentGoalId: monthGoal.goalId,
          name: schedule.name,
          goalType: "goal_type_003",
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          schedule: createProps,
        };
        goalFunc
          .createGoal(create)
          .then((res) => {
            setDisabled(false);
            handleModalClose();
            const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
            const monthParams = {
              goalType: "goal_type_002",
              searchDate: searchDate,
              detail: true,
            };
            goalFunc.findGoalBy(monthParams).then((res) => {
              setMonthGoal(res.data);
              goalToEvents(res.data?.children);
            });
          })
          .catch((rej) => {
            if (rej.response.data.message) {
              setPopUpProps({
                ...popupProps,
                open: true,
                icon: "warning",
                color: "error",
                title: "일정관리",
                content: rej.response.data.message,
              });
            }
          });
      } else {
        func.createSchedule(createProps).then((res) => {
          setDisabled(false);
          handleModalClose();
          const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
          func.findSchedules(searchDate).then((res) => {
            if (res.data && res.data.length > 0) {
              dataToEvents(res.data);
            }
          });
        });
      }
    } else {
      setDisabled(true);
      const updateProps = {
        name: schedule.name,
        startDtm: `${schedule.startDate}T${schedule.startTime}`,
        endDtm: schedule.endDate
          ? `${schedule.endDate}T${schedule.endTime}`
          : `${schedule.startDate}T${schedule.endTime}`,
        location: schedule.location,
      };

      if (isGoal) {
        const update = {
          goalId: schedule.goalId,
          name: schedule.name,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          schedule: updateProps,
        };
        goalFunc
          .updateGoal(update)
          .then((res) => {
            setGoalEvents((prevEvents) =>
              prevEvents.map((event) =>
                event.goalId === update.goalId ? { ...event, schedule: update.schedule } : event
              )
            );
          })
          .catch((rej) => {
            setPopUpProps({
              ...popupProps,
              open: true,
              icon: "warning",
              color: "warning",
              title: "일정관리",
              content: "존재하지 않는 목표입니다.",
            });
          })
          .finally(() => {
            setDisabled(false);
            handleModalClose();
            const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
            const monthParams = {
              goalType: "goal_type_002",
              searchDate: searchDate,
              detail: true,
            };
            goalFunc.findGoalBy(monthParams).then((res) => {
              setMonthGoal(res.data);
              goalToEvents(res.data?.children);
            });
          });
      } else {
        func
          .updateSchedule(schedule.scheduleId, updateProps)
          .then((res) => {
            setEvents((prevEvents) =>
              prevEvents.map((event) =>
                event.scheduleId === schedule.scheduleId ? { updateProps } : event
              )
            );
          })
          .catch((rej) => {
            setPopUpProps({
              ...popupProps,
              open: true,
              icon: "warning",
              color: "warning",
              title: "일정관리",
              content: "존재하지 않는 일정입니다.",
            });
          })
          .finally(() => {
            setDisabled(false);
            handleModalClose();
            const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
            func.findSchedules(searchDate).then((res) => {
              if (res.data && res.data.length > 0) {
                dataToEvents(res.data);
              }
            });
          });
      }
    }
  };

  const handleClickDelete = (e) => {
    e.preventDefault();

    if (isGoal) {
      goalFunc
        .deleteGoal(schedule.goalId)
        .catch((rej) => {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "warning",
            color: "warning",
            title: "일정관리",
            content: "존재하지 않는 목표입니다.",
          });
        })
        .finally(() => {
          setDisabled(false);
          handleCClose();
          handleModalClose();
          const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
          const monthParams = {
            goalType: "goal_type_002",
            searchDate: searchDate,
            detail: true,
          };
          goalFunc.findGoalBy(monthParams).then((res) => {
            setMonthGoal(res.data);
            goalToEvents(res.data?.children);
          });
        });
    } else {
      func
        .deleteSchedule(schedule.scheduleId)
        .catch((rej) => {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "warning",
            color: "warning",
            title: "일정관리",
            content: "존재하지 않는 일정입니다.",
          });
        })
        .finally(() => {
          setDisabled(false);
          handleCClose();
          handleModalClose();
          const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
          func.findSchedules(searchDate).then((res) => {
            if (res.data && res.data.length > 0) {
              dataToEvents(res.data);
            }
          });
        });
    }
  };

  const handleClickSDelete = (e) => {
    e.preventDefault();

    func
      .deleteScheduleShare(schedule.scheduleId)
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "일정관리",
          content: "존재하지 않는 일정입니다.",
        });
      })
      .finally(() => {
        setDisabled(false);
        handleSCClose();
        handleModalClose();
        const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
        func.findSchedules(searchDate).then((res) => {
          if (res.data && res.data.length > 0) {
            dataToEvents(res.data);
          }
        });
      });
  };

  const handleClickShare = () => {
    freindFunc.findFriendGroups().then((res) => {
      setFriends(res.data.filter((item) => item.friends !== null).flatMap((item) => item.friends));
      freindFunc.findFriends().then((res2) => {
        setFriends((prev) => [...prev, ...res2.data]);
      });
    });
  };

  const shareRequest = () => {
    if (!selectedFriends || selectedFriends.length === 0) {
      setPopUpProps({
        ...popupProps,
        open: true,
        icon: "warning",
        color: "warning",
        title: "일정관리",
        content: "공유 대상을 선택해주세요.",
      });
    } else {
      setDisabled(true);
      const props = {
        targetIds: selectedFriends.map((friend) => friend.friendUserId),
      };
      func
        .createScheduleShareRequest(schedule.scheduleId, props)
        .then((res) => {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "check",
            color: "success",
            title: "일정관리",
            content: "일정 공유를 신청하였습니다.",
          });
        })
        .catch((rej) => {
          setPopUpProps({
            ...popupProps,
            open: true,
            icon: "warning",
            color: "warning",
            title: "일정관리",
            content: "존재하지 않는 일정입니다.",
          });
        })
        .finally(() => {
          setDisabled(false);
          handleModalClose();
          const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
          func.findSchedules(searchDate).then((res) => {
            if (res.data && res.data.length > 0) {
              dataToEvents(res.data);
            }
          });
        });
    }
  };

  const approveShareReq = (scheduleId, reqId, approve) => {
    setDisabled(true);
    func
      .approveScheduleShareRequest(scheduleId, reqId, approve)
      .catch((rej) => {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "일정관리",
          content: "존재하지 않는 일정입니다.",
        });
      })
      .finally(() => {
        setDisabled(false);
        handleModalClose();
        const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
        func.findSchedules(searchDate).then((res) => {
          if (res.data && res.data.length > 0) {
            dataToEvents(res.data);
          }
        });
        func.findScheduleShareRequests().then((res) => {
          setShareReqs(res.data);
        });
      });
  };

  const [overflowState, setOverflowState] = useState(false);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      saveGoal();
    }
  };

  const saveGoal = () => {
    if (!monthGoal || !monthGoal.name) {
      setEdit(false);
      return;
    } else {
      if (monthGoal.goalId) {
        goalFunc
          .updateGoal(monthGoal)
          .then((res) => {
            setEdit(false);

            const searchDate = year + "-" + String(month + 1).padStart(2, "0") + "-" + "01";
            const monthParams = {
              goalType: "goal_type_002",
              searchDate: searchDate,
              detail: true,
            };
            goalFunc.findGoalBy(monthParams).then((res) => {
              setMonthGoal(res.data);
              goalToEvents(res.data?.children);
            });
          })
          .catch((rej) => {
            if (rej.response.data.message) {
              setPopUpProps({
                ...popupProps,
                open: true,
                icon: "warning",
                color: "error",
                title: "일정관리",
                content: rej.response.data.message,
              });
            }
          });
      } else {
        const end = month === 11 ? new Date(year, month + 1, 31) : new Date(year, month + 2, 0);
        const create = {
          ...monthGoal,
          parentGoalId: yearGoal.goalId,
          goalType: "goal_type_002",
          startDate: new Date(year, month + 1, 1).toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
        goalFunc
          .createGoal(create)
          .then((res) => {
            setMonthGoal(res.data);
            setEdit(false);
          })
          .catch((rej) => {
            if (rej.response.data.message) {
              setPopUpProps({
                ...popupProps,
                open: true,
                icon: "warning",
                color: "error",
                title: "일정관리",
                content: rej.response.data.message,
              });
            }
          });
      }
    }
  };

  return (
    <>
      <MDBox
        sx={{
          height: "33.05rem",
        }}
      >
        <MDBox
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <MDTypography
            sx={{
              fontFamily: "Pretendard-Light",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            onClick={handleYearClick}
          >
            {year}
          </MDTypography>
          <MDBox
            sx={{
              position: "relative", // 상대 위치 설정
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // 기본적으로 가운데 정렬
              height: "2.75rem",
              width: "100%",
            }}
          >
            <MDBox
              sx={{
                position: "absolute",
                left: 0, // 왼쪽에 배치
                cursor: "pointer",
                height: "1rem",
              }}
              onClick={() => setScheduleShareReq(true)}
            >
              <SendIcon
                sx={{
                  fontSize: "1rem",
                }}
              />
              {shareReqs.length > 0 && (
                <MDBox
                  sx={{
                    position: "absolute",
                    top: "-5px",
                    right:
                      shareReqs.length >= 10
                        ? shareReqs.length >= 100
                          ? shareReqs.length > 999
                            ? "-1.75rem"
                            : "-1.35rem"
                          : "-0.95rem"
                        : "-0.55rem",
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
                  {shareReqs.length > 0 ? (shareReqs.length > 999 ? "999+" : shareReqs.length) : ""}
                </MDBox>
              )}
            </MDBox>
            {/* 가운데 정렬 */}
            <MDBox
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MDButton {...btnStyle} onClick={prevMonth}>
                &lt;
              </MDButton>
              <MDTypography
                sx={{
                  fontFamily: "Pretendard-Bold",
                  fontSize: "2.25rem",
                  cursor: "pointer",
                }}
                onClick={handleClick}
              >
                {"\u00A0"}
                {month + 1}
                {"\u00A0"}
              </MDTypography>
              <MDButton {...btnStyle} onClick={nextMonth}>
                &gt;
              </MDButton>
            </MDBox>
            {yearGoal ? (
              <MDBox
                className="testMD"
                sx={{
                  position: "absolute",
                  right: 0,
                  cursor: "pointer",
                  height: "2.5rem",
                  fontFamily: "Pretendard-Bold",
                  fontSize: "1.5rem",
                  justifyContent: "right",
                  color: monthGoal?.name ? "black" : "#d3d3d3",
                  letterSpacing: "0.1rem",
                  width: `${window.innerWidth * 0.364583}px`,
                  textAlign: "right",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {edit ? (
                  <MDInput
                    value={monthGoal?.name}
                    placeholder="이번 달 목표를 설정해주세요"
                    onBlur={() => {
                      setEdit(false);
                      saveGoal();
                    }} // 포커스를 잃으면 편집 모드 해제
                    onKeyDown={handleEnter}
                    autoFocus // 자동 포커스
                    autoComplete="off"
                    fullWidth
                    InputProps={{
                      disableUnderline: true, // 기본 MUI 밑줄 제거
                      sx: {
                        width: "35rem",
                        fontFamily: "Pretendard-Bold",
                        fontSize: "1.5rem",
                        letterSpacing: "0.1rem",
                        color: "#d3d3d3",
                        textAlign: "right",
                        background: "transparent", // 배경 제거
                        zIndex: 1100,
                        "& .MuiInputBase-input": {
                          padding: 0, // 입력 필드의 패딩 제거
                          paddingTop: "0.145rem",
                          textAlign: "right", // 입력 텍스트 가운데 정렬
                          marginBottom: "0.195rem",
                          color: "#344747",
                        },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none", // fieldset의 border 제거
                        outline: "none", // fieldset의 outline 제거
                      },
                      autoComplete: "off",
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      const encoder = new TextEncoder();
                      const byteLength = encoder.encode(value).length;
                      const max = 255;

                      if (byteLength <= max) {
                        setMonthGoal((prev) => ({ ...prev, name: e.target.value }));
                      }
                    }}
                  />
                ) : (
                  <Tooltip
                    title={overflowState ? monthGoal?.name : null}
                    arrow
                    placement="bottom-start"
                    sx={{
                      maxWidth: "100%",
                    }}
                    componentsProps={{
                      tooltip: {
                        sx: { fontFamily: "Pretendard-Bold" },
                      },
                      arrow: {
                        sx: {
                          left: "-5.5rem !important",
                        },
                      },
                    }}
                  >
                    <span
                      ref={(el) => {
                        if (el) {
                          const mdBoxWidth = window.innerWidth * 0.364583;
                          setOverflowState(el.offsetWidth > mdBoxWidth);
                        }
                      }}
                      style={{
                        zIndex: 1100,
                      }}
                      onClick={() => setEdit(true)}
                    >
                      {monthGoal?.name || "이번 달 목표를 설정해주세요"}
                    </span>
                  </Tooltip>
                )}
              </MDBox>
            ) : null}
          </MDBox>
        </MDBox>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          editable={false}
          selectable={false}
          events={[...events, ...goalEvents]}
          eventDidMount={handleEventCellMount}
          height="100%"
          locale="ko"
          displayEventTime={false}
          weekends
          dayCellDidMount={handleDayCellMount}
          dayCellContent={(info) => (
            <div>{info.dayNumberText.replace(/[^0-9]/g, "")}</div> // 숫자만 표시
          )}
          dayCellClassNames={(date) => {
            let classNames = "custom-day-cell"; // 모든 날짜 셀에 공통적으로 'custom-day-cell' 클래스 추가

            // 일요일 (0)에는 'weekend-day' 클래스 추가
            if (date.dow === 0) {
              return classNames + " weekend-day"; // 일요일
            } else if (date.dow === 6) {
              return classNames + " saturday";
            } else {
              return classNames;
            }
          }}
          eventClassNames={(eventInfo) => {
            return eventInfo.event.extendedProps.shared ? "shared-event" : "";
          }}
          headerToolbar={null}
          eventContent={(info) => {
            console.log(info);
            const start = info.event.startStr.split("T")[0];
            const end = info.event.endStr.split("T")[0];
            const isMultiDay = end && start !== end;
            const isContinuedFromPreviousWeek = !info.isStart;

            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                {isMultiDay ? null : <div className="fc-daygrid-event-dot" />}
                <div
                  className={`fc-event-title ${isContinuedFromPreviousWeek ? "fc-sticky" : ""}`}
                  style={{
                    //width: "10rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {info.event.title}
                </div>
                {info.event.extendedProps.goalId ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        icon={<RadioButtonUncheckedIcon style={{ fill: "#d3d3d3" }} />}
                        checkedIcon={<TaskAltIcon style={{ fill: "green" }} />}
                        checked={checkedEvents[info.event.extendedProps.goalId]}
                        sx={{
                          "& .MuiSvgIcon-root": {
                            background: "transparent",
                            backgroundImage: "none !important",
                            border: "none",
                            width: "1rem",
                            height: "1rem",
                            fontSize: "unset",
                          },
                          marginLeft: "0.75rem",
                          width: "1rem",
                          height: "1rem",
                          marginTop: "2px",
                        }}
                        onChange={(e) => handleCheckboxChange(info.event.extendedProps.goalId, e)}
                      />
                    }
                  />
                ) : null}
              </div>
            );
          }}
        />
      </MDBox>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleClose(null)}
          sx={{
            width: "0",
          }}
          PaperProps={{
            style: {
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
          <Grid container spacing={1} width={200}>
            {[...Array(12)].map((_, i) => (
              <Grid item xs={3} key={i}>
                <MenuItem
                  onClick={() => handleClose(i)}
                  sx={{
                    minWidth: "2rem",
                    background:
                      month === i ? "linear-gradient(195deg, #42424a, #191919)" : "inherit",
                    fontFamily: month === i ? "Pretendard-Bold" : "Pretendard-Light",
                    color: month === i ? "white !important" : "",
                    transform: "translateY(0)",
                    paddingX: "0",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </MenuItem>
              </Grid>
            ))}
          </Grid>
        </Menu>
      </ClickAwayListener>
      <ClickAwayListener onClickAway={handleYearClickAway}>
        <Menu
          anchorEl={anchorElYear}
          open={Boolean(anchorElYear)}
          onClose={() => handleYearClose(null)}
          sx={{
            width: "0",
            display: "flex",
            justifyContent: "center",
            marginRight: "2rem",
          }}
          PaperProps={{
            style: {
              width: "auto", // Menu width
              maxWidth: "4rem", // Set maximum width
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
          <IconButton
            onClick={() => shiftYearRange(-1)}
            sx={{
              padding: "0",
              marginLeft: "0.75rem",
            }}
          >
            <ExpandLessIcon />
          </IconButton>

          <MDBox
            onWheel={handleScroll}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <MenuItem
                key={i}
                onClick={() => handleYearClose(yearRange + i)}
                sx={{
                  fontFamily: i === 2 ? "Pretendard-Bold" : "Pretendard-Light",
                  fontSize: i === 2 ? "0.86rem" : i === 0 || i === 4 ? "0.75rem" : "0.85rem",
                  display: "flex",
                  transform: "translateY(0)",
                  justifyContent: "center",
                  "&:hover": {
                    background: "none !important",
                  },
                }}
              >
                {yearRange + i}
              </MenuItem>
            ))}
          </MDBox>

          <IconButton
            onClick={() => shiftYearRange(1)}
            sx={{
              padding: "0",
              marginLeft: "0.75rem",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Menu>
      </ClickAwayListener>
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
                minWidth: "5rem",
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
                case "day":
                  return [
                    monthGoal && monthGoal.goalId ? (
                      <MenuItem
                        {...itemStyle}
                        key="add-goal"
                        onClick={() => {
                          handleRightMenuClose();
                          setIsGoal(true);
                          setScheduleReg(true);
                          setSchedule({
                            ...schedule,
                            startDate: day,
                            endDate: day,
                          });
                        }}
                      >
                        목표 등록
                      </MenuItem>
                    ) : null,
                    <MenuItem
                      {...itemStyle}
                      key="add-schedule"
                      onClick={() => {
                        handleRightMenuClose();
                        setIsGoal(false);
                        setScheduleReg(true);
                        setSchedule({
                          ...schedule,
                          startDate: day,
                          endDate: day,
                        });
                      }}
                    >
                      일정 등록
                    </MenuItem>,
                  ];
                case "edit":
                  return [
                    <MenuItem
                      {...itemStyle}
                      key="edit"
                      onClick={() => {
                        handleRightMenuClose();
                        setScheduleReg(true);
                      }}
                    >
                      상세 보기
                    </MenuItem>,
                    !schedule.shared && !schedule.goalId ? (
                      <MenuItem
                        {...itemStyle}
                        key="share"
                        onClick={() => {
                          handleClickShare();
                          handleRightMenuClose();
                          setScheduleShare(true);
                        }}
                      >
                        공유하기
                      </MenuItem>
                    ) : null,
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
      <Modal
        open={scheduleReg}
        content={
          <>
            <MDBox {...boxStyles}>
              <MDInput
                {...inputCore(formik, "name", setSchedule)}
                {...inputStyles}
                type="text"
                label={(isGoal ? "목표" : "일정") + "명" + (schedule.shared ? "" : " *")}
                name="name"
                id="name"
                key="name"
                value={schedule.name ?? ""}
                fullWidth
                inputRef={(el) => (textRef.current[0] = el)}
              />
            </MDBox>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Light",
                fontSize: "0.75rem",
                color: "inherit",
              }}
            >
              기간 {schedule.shared ? "" : "*"}
            </MDTypography>
            <MDBox
              mb={3}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                <DatePicker
                  {...dateCore(formik, "startDate", setSchedule)}
                  disableOpenPicker={schedule.shared}
                  readOnly={schedule.shared}
                  views={["year", "month", "day"]}
                  format="YYYY-MM-DD"
                  value={schedule.startDate ? dayjs(schedule.startDate) : null}
                  //defaultValue={dayjs(day)}
                  slotProps={datePickerStyles}
                  sx={{
                    width: "7rem",
                  }}
                  inputRef={(el) => (textRef.current[1] = el)}
                />
                <MDBox mx={1.5}>-</MDBox>
                <DatePicker
                  disableOpenPicker={schedule.shared}
                  readOnly={schedule.shared}
                  views={["year", "month", "day"]}
                  format="YYYY-MM-DD"
                  value={schedule.endDate ? dayjs(schedule.endDate) : null}
                  //defaultValue={dayjs(day)}
                  slotProps={datePickerStyles}
                  sx={{
                    width: "7rem",
                  }}
                  onChange={(e) => {
                    const formattedDate =
                      e && dayjs(e).isValid() ? dayjs(e).format("YYYY-MM-DD") : "";
                    setSchedule((prev) => ({ ...prev, endDate: formattedDate }));
                  }}
                />
              </LocalizationProvider>
            </MDBox>
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Light",
                fontSize: "0.75rem",
                color: "inherit",
              }}
            >
              시간 {schedule.shared ? "" : "*"}
            </MDTypography>
            <MDBox
              mb={3}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                <DesktopTimePicker
                  {...timeCore(formik, "startTime", setSchedule)}
                  {...timePickerProps}
                  readOnly={schedule.shared}
                  value={
                    schedule.startTime
                      ? dayjs()
                          .set("hour", Number(schedule.startTime.split(":")[0]))
                          .set("minute", Number(schedule.startTime.split(":")[1]))
                      : null
                  }
                  inputRef={(el) => (textRef.current[2] = el)}
                />
                <MDBox mx={1.5}>-</MDBox>
                <DesktopTimePicker
                  {...timeCore(formik, "endTime", setSchedule)}
                  {...timePickerProps}
                  readOnly={schedule.shared}
                  value={
                    schedule.endTime
                      ? dayjs()
                          .set("hour", Number(schedule.endTime.split(":")[0]))
                          .set("minute", Number(schedule.endTime.split(":")[1]))
                      : null
                  }
                  inputRef={(el) => (textRef.current[3] = el)}
                />
              </LocalizationProvider>
            </MDBox>
            <MDBox {...boxStyles}>
              <MDInput
                {...inputStyles}
                type="text"
                label="장소"
                name="location"
                id="location"
                value={schedule.location || ""}
                fullWidth
                onChange={(e) => {
                  const value = e.target.value;
                  const encoder = new TextEncoder();
                  const byteLength = encoder.encode(value).length;
                  const max = 255;

                  if (byteLength <= max) {
                    setSchedule((prev) => ({ ...prev, location: e.target.value }));
                  }
                }}
              />
            </MDBox>
            {schedule.shared ? (
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MDTypography
                  sx={{
                    display: "inline-block",
                    fontFamily: "Pretendard-Light",
                    fontSize: "0.8rem",
                  }}
                >
                  {"공유자 : " +
                    schedule.userName +
                    "(" +
                    schedule.userId.slice(0, -3) +
                    "***" +
                    ")"}
                </MDTypography>
                <MDButton
                  {...btnStyles}
                  type="button"
                  variant="gradient"
                  color="info"
                  disabled={disabled}
                  onClick={handleClickSCOpen}
                >
                  {disabled ? (
                    <MDBox component="img" src={loading} alt="loading" width="1rem" />
                  ) : (
                    "삭제"
                  )}
                </MDButton>
              </MDBox>
            ) : (
              <MDBox
                display="flex"
                gap="0.5rem"
                sx={{
                  justifyContent: "center",
                }}
              >
                <MDButton
                  {...btnStyles}
                  type="button"
                  variant="gradient"
                  color="info"
                  disabled={disabled}
                  onClick={handleSubmit}
                >
                  {disabled ? (
                    <MDBox component="img" src={loading} alt="loading" width="1rem" />
                  ) : create ? (
                    "등록"
                  ) : (
                    "수정"
                  )}
                </MDButton>
                {!create ? (
                  <MDButton
                    {...btnStyles}
                    type="button"
                    variant="gradient"
                    color="info"
                    disabled={disabled}
                    onClick={handleClickCOpen}
                  >
                    {disabled ? (
                      <MDBox component="img" src={loading} alt="loading" width="1rem" />
                    ) : (
                      "삭제"
                    )}
                  </MDButton>
                ) : (
                  <></>
                )}
              </MDBox>
            )}
          </>
        }
        onClose={handleModalClose}
      />
      <Modal
        open={scheduleShare}
        content={
          <MDBox
            sx={{
              height: "21.3rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MDInput
              {...inputStyles}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름을 입력해주세요"
            />
            <MDBox
              ref={containerRef}
              mt={1}
              sx={{
                overflowY: "auto",
                fontFamily: "Pretendard-Light",
                fontSize: "0.9rem",
              }}
            >
              {filteredFriends.map((f, idx) => {
                return (
                  <MDBox
                    key={"freindBox" + f.friendId}
                    sx={{
                      marginY: "0.1rem",
                      cursor: "pointer",
                      backgroundColor: selectedFriends.some(
                        (selected) => selected.friendUserId === f.friendUserId
                      )
                        ? "#DCDCDC"
                        : "transparent",
                      userSelect: "none",
                    }}
                    onClick={(e) => handleSelectFriend(e, f, idx)}
                  >
                    <p key={"freindP" + f.friendId}>
                      {f.friendUserName + "(" + f.friendUserId.slice(0, -3) + "***" + ")"}
                    </p>
                  </MDBox>
                );
              })}
            </MDBox>
            <MDBox
              ref={buttonRef}
              sx={{
                display: "flex",
                justifyContent: "center", // 수평 중앙 정렬
                mt: "auto", // 하단 정렬
              }}
            >
              <MDButton
                {...btnStyles}
                type="button"
                variant="gradient"
                color="info"
                disabled={disabled}
                onClick={shareRequest}
              >
                {disabled ? (
                  <MDBox component="img" src={loading} alt="loading" width="1rem" />
                ) : (
                  "공유"
                )}
              </MDButton>
            </MDBox>
          </MDBox>
        }
        onClose={handleModalClose}
      />
      <Modal
        open={scheduleShareReq}
        content={
          <MDBox
            sx={{
              minWidth: "5rem",
              maxHeight: "16rem",
            }}
          >
            <MDTypography
              sx={{
                fontFamily: "Pretendard-Bold",
                fontSize: "1rem",
                position: "absolute",
                top: "0.5rem",
                width: "auto",
              }}
            >
              공유 신청
            </MDTypography>
            <MDBox>
              {shareReqs && shareReqs.length > 0 ? (
                <>
                  {shareReqs.map((s, idx) => (
                    <p
                      id={"friendRequest" + s.reqId}
                      key={"friendRequest" + idx}
                      style={{
                        fontFamily: "Pretendard-Light",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.3rem",
                        backgroundColor: highlightId === s.reqId ? "#FFF3CD" : "transparent",
                        transition: "background-color 0.5s ease-in-out",
                      }}
                    >
                      <span
                        style={{
                          width: "80%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.requesterName + "(" + s.requesterId.slice(0, -3) + "***" + ")"}
                        {"님이 '" + s.schedule.name + "' 일정을 공유하였습니다."}
                      </span>
                      <span>{"\u00A0\u00A0"}</span>
                      <MDBox display="flex" gap="0.25rem">
                        <MDButton
                          {...sBtnStyles}
                          type="button"
                          variant="gradient"
                          color="info"
                          disabled={disabled}
                          onClick={() => approveShareReq(s.schedule.scheduleId, s.reqId, true)}
                        >
                          {disabled ? (
                            <MDBox component="img" src={loading} alt="loading" width="1rem" />
                          ) : (
                            "승인"
                          )}
                        </MDButton>
                        <MDButton
                          {...sBtnStyles}
                          type="button"
                          variant="gradient"
                          color="info"
                          disabled={disabled}
                          onClick={() => approveShareReq(s.schedule.scheduleId, s.reqId, false)}
                        >
                          {disabled ? (
                            <MDBox component="img" src={loading} alt="loading" width="1rem" />
                          ) : (
                            "거절"
                          )}
                        </MDButton>
                      </MDBox>
                    </p>
                  ))}
                </>
              ) : (
                <MDBox
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="16rem"
                  width="20rem"
                >
                  <MDTypography
                    sx={{
                      fontFamily: "Pretendard-Light",
                      fontSize: "1rem",
                    }}
                  >
                    공유 신청이 없습니다.
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </MDBox>
        }
        onClose={handleModalClose}
      />
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
      <Confirm
        title="정말 삭제하시겠습니까?"
        open={open}
        onClose={handleCClose}
        agreeFunc={handleClickDelete}
      />
      <Confirm
        title="정말 삭제하시겠습니까?"
        open={sOpen}
        onClose={handleSCClose}
        agreeFunc={handleClickSDelete}
      />
    </>
  );
}

export default Schedule;
