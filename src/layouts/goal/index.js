import React, { useState, useEffect, useRef } from "react";

import { Grid, Card, CardContent, Typography, Tooltip } from "@mui/material";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import Wave from "components/Wave";

import { ReactComponent as Star } from "assets/images/icons/star.svg";
import { ReactComponent as EmptyStar } from "assets/images/icons/emptyStar.svg";
import { ReactComponent as Target } from "assets/images/icons/target.svg";
import { ReactComponent as Check } from "assets/images/icons/check.svg";

import * as func from "./function";

function Goal() {
  const [yearGoal, setYearGoal] = useState({
    goalId: null,
    name: "",
    isAchieve: false,
    achieve: 0,
    goalType: "",
    startDate: "",
    endDate: "",
    children: [],
  });
  const [monthGoal, setMonthGoal] = useState(
    Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: null, target: 0, ac: 0 }))
  );
  const [searchParams, setSearchParams] = useState({
    goalType: "goal_type_001",
    searchDate: new Date().toISOString().split("T")[0],
    detail: true,
  });

  const [edit, setEdit] = useState(false);
  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  const typoRefs = useRef(new Map());
  const [overflowStates, setOverflowStates] = useState({});
  const [grpOpens, setGrpOpens] = useState([]);
  const [overflowState, setOverflowState] = useState(false);

  useEffect(() => {
    func.findGoalBy(searchParams).then((res) => {
      setYearGoal({
        yearGoal,
        ...res.data,
      });

      if (res.data && res.data.children) {
        const updatedMonths = [...monthGoal];

        res.data.children.forEach((child) => {
          if (child.startDate) {
            const monthIndex = parseInt(child.startDate.split("-")[1], 10) - 1; // 월(1~12) 추출
            updatedMonths[monthIndex] = {
              month: monthIndex + 1,
              value: child,
              target: child.children ? child.children.length : 0,
              ac: child.children ? child.children.filter((c) => c.isAchieve).length : 0,
            };
          }
        });

        setMonthGoal(updatedMonths);
      }
    });
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      const newStates = {};
      typoRefs.current.forEach((el, key) => {
        if (el) {
          newStates[key] = el.scrollWidth > el.clientWidth;
        }
      });
      setOverflowStates(newStates);
    };

    checkOverflow(); // 초기 체크
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [monthGoal, grpOpens]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      saveGoal();
    }
  };

  const saveGoal = () => {
    if (!yearGoal.name) {
      setEdit(false);
      return;
    } else {
      if (yearGoal.goalId) {
        func
          .updateGoal(yearGoal)
          .then((res) => {
            setEdit(false);
            func.findGoalBy(searchParams).then((res) => {
              setYearGoal({
                yearGoal,
                ...res.data,
              });
            });
          })
          .catch((rej) => {
            if (rej.response.data.message) {
              setPopUpProps({
                ...popupProps,
                open: true,
                icon: "warning",
                color: "error",
                title: "목표설정",
                content: rej.response.data.message,
              });
            }
          });
      } else {
        const currentYear = new Date().getFullYear();

        const create = {
          ...yearGoal,
          goalType: "goal_type_001",
          startDate: new Date(currentYear, 1, 1).toISOString().split("T")[0],
          endDate: new Date(currentYear, 12, 31).toISOString().split("T")[0],
        };
        func
          .createGoal(create)
          .then((res) => {
            func.findGoalBy(searchParams).then((res) => {
              setYearGoal({
                yearGoal,
                ...res.data,
              });
            });
            setEdit(false);
          })
          .catch((rej) => {
            if (rej.response.data.message) {
              setPopUpProps({
                ...popupProps,
                open: true,
                icon: "warning",
                color: "error",
                title: "목표설정",
                content: rej.response.data.message,
              });
            }
          });
      }
    }
  };

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  const iconStyle = {
    style: {
      width: "1.4rem",
      height: "1.4rem",
      display: "inline-flex", // 텍스트와 같은 라인에 배치
      alignItems: "center", // 수직 정렬
      verticalAlign: "middle",
    },
  };

  return (
    <>
      <MDBox position="relative" height="100%">
        <Wave width={window.innerWidth - 322} progress={yearGoal.achieve} />
        <MDBox
          sx={{
            display: "flex",
            fontFamily: "Pretendard-Bold",
            fontSize: "2rem",
            justifyContent: "center",
            color: yearGoal.name ? "black" : "#d3d3d3",
            cursor: "pointer",
            letterSpacing: "0.1rem",
          }}
        >
          {edit ? (
            <MDInput
              value={yearGoal.name}
              placeholder="올해 목표를 설정해주세요"
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
                  fontFamily: "Pretendard-Bold",
                  fontSize: "2rem",
                  letterSpacing: "0.1rem",
                  color: "#d3d3d3",
                  textAlign: "center", // 텍스트 가운데 정렬
                  padding: "0 0.5rem", // 좌우 여백 추가 (글자가 가운데 보이도록)
                  background: "transparent", // 배경 제거
                  zIndex: 1100,
                  "& .MuiInputBase-input": {
                    padding: 0, // 입력 필드의 패딩 제거
                    paddingTop: "0.185rem",
                    textAlign: "center", // 입력 텍스트 가운데 정렬
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
                  setYearGoal((prev) => ({ ...prev, name: e.target.value }));
                }
              }}
            />
          ) : (
            <Tooltip
              title={overflowState ? yearGoal?.name : null}
              arrow
              sx={{
                maxWidth: "100%",
              }}
              componentsProps={{
                tooltip: {
                  sx: { fontFamily: "Pretendard-Bold" },
                },
              }}
            >
              <span
                ref={(el) => {
                  if (el) {
                    setOverflowState(el.scrollWidth > el.clientWidth);
                  }
                }}
                style={{
                  zIndex: 1100,
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  cursor: "pointer",
                }}
                onClick={() => setEdit(true)}
              >
                {yearGoal.name || "올해 목표를 설정해주세요"}
              </span>
            </Tooltip>
          )}
        </MDBox>
        <Grid mt={1} container spacing={2}>
          {monthGoal.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent
                  sx={{
                    padding: "1rem !important",
                    height: "10.225rem",
                  }}
                >
                  <MDBox
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Target {...iconStyle} />
                    {"\u00A0"}
                    <Typography
                      sx={{
                        fontFamily: "Pretendard-Bold",
                      }}
                    >
                      {`${item.month}월`}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamliy: "Pretendard-Light",
                        fontSize: "1rem",
                        color: "#555",
                      }}
                    >
                      {"\u00A0"}
                      {`(${item.ac}/${item.target})`}
                      {" - " + (item.value ? item.value.achieve + "%" : "0%")}
                    </Typography>
                    <MDBox
                      sx={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item.value ? (
                        item.value.isAchieve ? (
                          <Star {...iconStyle} />
                        ) : item.value.achieve >= 50 ? (
                          <EmptyStar {...iconStyle} />
                        ) : null
                      ) : null}
                    </MDBox>
                  </MDBox>
                  <MDBox
                    sx={{
                      height: "6rem",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        display: "none", // 크롬, 사파리 스크롤바 숨김
                      },
                    }}
                  >
                    {item.value ? (
                      <MDBox>
                        <Tooltip
                          title={
                            overflowStates["month" + item.value.goalId] ? item.value.name : null
                          }
                          arrow
                          sx={{
                            maxWidth: "100%",
                          }}
                          componentsProps={{
                            tooltip: {
                              sx: { fontFamily: "Pretendard-Bold" },
                            },
                          }}
                        >
                          <Typography
                            ref={(el) => {
                              if (el) typoRefs.current.set("month" + item.value.goalId, el);
                            }}
                            sx={{
                              fontFamily: "Pretendard-Regular",
                              fontSize: "1.1rem",
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setGrpOpens((prev) => ({
                                ...prev,
                                [item.value.goalId]: !prev[item.value.goalId],
                              }));
                            }}
                          >
                            <span style={{ display: "inline-block", width: "1rem" }}>
                              {grpOpens && grpOpens[item.value.goalId] ? "▼ " : "▶ "}
                            </span>
                            {"\u00A0"}
                            {item.value.name}
                          </Typography>
                        </Tooltip>
                        {item.value.children && item.value.children.length > 0 ? (
                          <>
                            {item.value.children.map((g, idx) => {
                              return grpOpens && grpOpens[item.value.goalId] ? (
                                <React.Fragment key={"day" + g.goalId}>
                                  <Tooltip
                                    title={
                                      overflowStates["day" + g.goalId] ? (
                                        <>
                                          {g.name}
                                          {g.isAchieve && (
                                            <Check
                                              style={{
                                                width: "1.4rem",
                                                height: "1.4rem",
                                                display: "inline-flex", // 텍스트와 같은 라인에 배치
                                                alignItems: "center", // 수직 정렬
                                                verticalAlign: "middle", // 텍스트와 정확히 수직 정렬
                                              }}
                                            />
                                          )}
                                        </>
                                      ) : null
                                    }
                                    arrow
                                    sx={{
                                      maxWidth: "100%",
                                    }}
                                    componentsProps={{
                                      tooltip: {
                                        sx: { fontFamily: "Pretendard-Bold" },
                                      },
                                    }}
                                  >
                                    <p
                                      ref={(el) => {
                                        if (el) typoRefs.current.set("day" + g.goalId, el);
                                      }}
                                      style={{
                                        fontFamily: "Pretendard-Light",
                                        fontSize: "1rem",
                                        paddingLeft: "1.25rem",
                                        width: "fit-content",
                                        maxWidth: "100%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "block",
                                      }}
                                    >
                                      {g.name}
                                      {g.isAchieve ? <Check {...iconStyle} /> : null}
                                    </p>
                                  </Tooltip>
                                </React.Fragment>
                              ) : null;
                            })}
                          </>
                        ) : null}
                      </MDBox>
                    ) : (
                      <MDBox
                        sx={{
                          height: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "Pretendard-Regular",
                            fontSize: "1.1rem",
                            color: "#D3D3D3",
                          }}
                        >
                          목표를 설정해주세요
                        </Typography>
                      </MDBox>
                    )}
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    </>
  );
}

export default Goal;
