import React, { useState, useEffect } from "react";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";

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
  });
  const [searchParams, setSearchParams] = useState({
    goalType: "goal_type_001",
    searchDate: new Date().toISOString().split("T")[0],
    detail: false,
  });

  const [edit, setEdit] = useState(false);
  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  useEffect(() => {
    func.findGoalBy(searchParams).then((res) => {
      setYearGoal({
        yearGoal,
        ...res.data,
      });
    });
  }, []);

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
            setYearGoal(res.data);
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

  return (
    <>
      <MDBox mb={2} />
      <MDBox position="relative" mb={5}>
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
                  "& .MuiInputBase-input": {
                    padding: 0, // 입력 필드의 패딩 제거
                    paddingTop: "0.185rem",
                    textAlign: "center", // 입력 텍스트 가운데 정렬
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
                e.target.value = e.target.value.trim();
                setYearGoal((prev) => ({ ...prev, name: e.target.value }));
              }}
            />
          ) : (
            <span onClick={() => setEdit(true)}>{yearGoal.name || "올해 목표를 설정해주세요"}</span>
          )}
        </MDBox>
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
