import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as commonFunc from "layouts/common/function";
import MDBox from "../../components/MDBox";
import {
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  Pagination,
  PaginationItem,
  Skeleton,
} from "@mui/material";
import DataTable from "../../examples/Tables/DataTable";
import Icon from "@mui/material/Icon";
import MDTypography from "../../components/MDTypography";
import { FirstPage, LastPage } from "@mui/icons-material";
import MDInput from "../../components/MDInput";
import MDButton from "../../components/MDButton";
import loading from "../../assets/images/loading.gif";
import * as func from "./function";
import MDSnackbar from "../../components/MDSnackbar";

function UserManage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = commonFunc.parseJwt("isAdmin");
  const getPageFromURL = () => {
    const queryParams = new URLSearchParams(location.search);
    return Number(queryParams.get("page")) || 0;
  };

  const effectRan = useRef(false);
  const [rendering, setRendering] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchValue: new URLSearchParams(location.search).get("searchValue") || "",
    page: new URLSearchParams(location.search).get("page") || 0,
    size: 9,
  });
  const [searchValue, setSearchValue] = useState(
    new URLSearchParams(location.search).get("searchValue") || ""
  );
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(getPageFromURL());
  const [popupProps, setPopUpProps] = useState({
    open: false,
    icon: "warning",
    color: "error",
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    } else {
      const handlePopState = handleBack();

      func.findUsers(searchParams).then((res) => {
        const mappedData = res.data.content.map((item) => {
          return {
            userId: item.userId,
            uuid: item.uuid,
            name: item.name,
            email: item.email,
            regDate: item.regDtm.split("T")[0],
            isBanned: (
              <FormControlLabel
                control={
                  <Checkbox
                    key={item.uuid}
                    defaultChecked={item.isBanned}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        borderRadius: "2px",
                        fontSize: "1rem",
                      },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    onChange={(e) => {
                      banUser(item.uuid);
                    }}
                  />
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  m: 0,
                  height: "1rem",
                }}
              />
            ),
          };
        });
        setRows(mappedData);
        setPages(res.data.totalPages);
        setRendering(false);
      });

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  const banUser = (uuid) => {
    func.banUser(uuid).catch((rej) => {
      if (rej.response.status !== 404) {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "warning",
          color: "warning",
          title: "사용자관리",
          content: "존재하지 않는 사용자입니다.",
        });
        func.findUsers(searchParams).then((res) => {
          const mappedData = res.data.content.map((item) => {
            return {
              userId: item.userId,
              uuid: item.uuid,
              name: item.name,
              email: item.email,
              regDate: item.regDtm.split("T")[0],
              isBanned: (
                <FormControlLabel
                  control={
                    <Checkbox
                      key={item.uuid}
                      defaultChecked={item.isBanned}
                      sx={{
                        "& .MuiSvgIcon-root": {
                          borderRadius: "2px",
                          fontSize: "1rem",
                        },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 0,
                      }}
                      onChange={(e) => {
                        banUser(item.uuid);
                      }}
                    />
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    m: 0,
                    height: "1rem",
                  }}
                />
              ),
            };
          });
          setRows(mappedData);
          setPages(res.data.totalPages);
        });
      } else {
        setPopUpProps({
          ...popupProps,
          open: true,
          icon: "error",
          color: "error",
          title: "사용자관리",
          content: "사용자 정지를 실패했습니다.",
        });
      }
    });
  };

  function handleBack() {
    const handlePopState = () => {
      const queryStr = window.location.href
        .replace(window.location.origin, "")
        .replace(window.location.pathname, "");

      if (queryStr === null || queryStr === "") {
        const updatedParams = { ...searchParams, page: 0, searchValue: "" };
        setSearchParams(updatedParams);
        setSearchValue("");
        setPageIndex(0);
        handlePage(updatedParams);
        effectRan.current = true;
      } else {
        const params = new URLSearchParams(queryStr);
        const page = params.get("page");
        const searchValue = params.get("searchValue");

        const updatedParams = { ...searchParams, page: page, searchValue: searchValue };
        setSearchParams(updatedParams);
        setSearchValue(searchValue);
        setPageIndex(Number(params.get("page")) || 0);
        handlePage(updatedParams);
        effectRan.current = true;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return handlePopState;
  }

  function handlePage(updatedParams) {
    func.findUsers(updatedParams).then((res) => {
      const mappedData = res.data.content.map((item) => {
        return {
          userId: item.userId,
          uuid: item.uuid,
          name: item.name,
          email: item.email,
          regDate: item.regDtm.split("T")[0],
          isBanned: (
            <FormControlLabel
              control={
                <Checkbox
                  key={item.uuid}
                  defaultChecked={item.isBanned}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      borderRadius: "2px",
                      fontSize: "1rem",
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0,
                  }}
                  onChange={(e) => {
                    banUser(item.uuid);
                  }}
                />
              }
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                m: 0,
                height: "1rem",
              }}
            />
          ),
        };
      });
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
  }

  const updateURL = (newPage) => {
    window.history.pushState(
      { page: pageIndex, searchValue: searchValue },
      "",
      `?page=${pageIndex}${searchValue ? `&searchValue=${searchValue}` : ""}`
    );
    const newUrl = `/user-manage?page=${newPage}${
      searchValue ? `&searchValue=${searchValue}` : ""
    }`;
    window.history.replaceState(null, "", newUrl);
  };

  const gotoPage = (page) => {
    setPageIndex(page);
    const updatedParams = { ...searchParams, page };
    setSearchParams(updatedParams);
    handlePage(updatedParams);
  };

  const gotoFirst = () => {
    setPageIndex(0);
    gotoPage(0);
    updateURL(0);
  };

  const gotoLast = () => {
    setPageIndex(pages - 1);
    gotoPage(pages - 1);
    updateURL(pages - 1);
  };

  const search = () => {
    setDisabled(true);
    const updatedParams = { ...searchParams, page: 0, searchValue: searchValue };
    setSearchParams(updatedParams);
    func.findUsers(updatedParams).then((res) => {
      setDisabled(false);
      const mappedData = res.data.content.map((item) => {
        return {
          userId: item.userId,
          uuid: item.uuid,
          name: item.name,
          email: item.email,
          regDate: item.regDtm.split("T")[0],
          isBanned: (
            <FormControlLabel
              control={
                <Checkbox
                  key={item.uuid}
                  defaultChecked={item.isBanned}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      borderRadius: "2px",
                      fontSize: "1rem",
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0,
                  }}
                  onChange={(e) => {
                    banUser(item.uuid);
                  }}
                />
              }
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                m: 0,
                height: "1rem",
              }}
            />
          ),
        };
      });
      setRows(mappedData);
      setPages(res.data.totalPages);
      updateURL(0);
      setPageIndex(0);
    });
  };

  const handlePageChange = (newPage) => {
    updateURL(newPage);
    gotoPage(newPage);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const columns = [
    { Header: "아이디", accessor: "userId", width: "22%", align: "center" },
    { Header: "이름", accessor: "name", width: "22%", align: "center" },
    { Header: "이메일", accessor: "email", width: "34%", align: "center" },
    { Header: "가입일", accessor: "regDate", width: "12%", align: "center" },
    { Header: "정지 여부", accessor: "isBanned", width: "10%", align: "center" },
  ];

  const skeletonRowData = Array.from({ length: 9 }).map(() => ({
    userId: <Skeleton variant="rounded" width={207.95} height={22.7} />,
    name: <Skeleton variant="rounded" width={207.95} height={22.7} />,
    email: <Skeleton variant="rounded" width={347.55} height={22.7} />,
    regDate: <Skeleton variant="rounded" width={90} height={22.7} />,
    isBanned: <Skeleton variant="rounded" width={25} height={22.7} />,
  }));

  const inputStyles = {
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "20rem",
        height: "2.4rem",
      },
    },
    autoComplete: "off",
  };

  function closePopUp() {
    setPopUpProps({ ...popupProps, open: false });
  }

  return (
    <>
      <MDBox pt={1}>
        <Grid container justifyContent="center">
          <Grid item xs={11.5}>
            <Card>
              <MDBox pt={1}>
                {rows && rows.length > 0 ? (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : rendering ? (
                  <DataTable
                    table={{ columns, rows: skeletonRowData }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="30.2575rem"
                  >
                    <Icon fontSize="large">event_busy</Icon>
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                      }}
                    >
                      등록된 사용자가 없습니다.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
            {rows ? (
              <>
                {pages && pages > 1 ? (
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
                      count={pages}
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

                        if (pages > 4) {
                          if (
                            pageIndex > 1 &&
                            ((pageIndex < pages - 2 && item.page - 1 < pageIndex - 2) ||
                              (pageIndex >= pages - 2 && item.page - 1 < pages - 5))
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
                      onClick={pageIndex === pages - 1 ? undefined : gotoLast}
                      sx={{
                        borderRadius: "100%", // 동그라미 효과
                        padding: "8px", // 크기 조정
                        marginTop: "2px",
                        transition: "background-color 0.2s ease-in-out", // 부드러운 전환 효과
                        "&:hover": {
                          backgroundColor:
                            pageIndex === pages - 1 ? "inherit" : "rgba(0, 0, 0, 0.03)",
                        },
                        cursor: pageIndex === pages - 1 ? "default" : "pointer",
                        backgroundColor: pageIndex === pages - 1 ? "transparent" : "inherit",
                        opacity: pageIndex === pages - 1 ? 0.4 : 1,
                        width: "2rem",
                        height: "2rem",
                        color: "rgba(0, 0, 0, 0.87)",
                      }}
                    />
                  </MDBox>
                ) : (
                  <MDBox mb={1.5}></MDBox>
                )}
                <MDBox display="flex" alignItems="center" justifyContent="center">
                  <MDInput
                    {...inputStyles}
                    type="text"
                    name="title"
                    id="title"
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                    placeholder="이름을 입력해주세요"
                    onKeyDown={handleEnter}
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
                      marginLeft: "0.5rem",
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
              </>
            ) : null}
          </Grid>
        </Grid>
      </MDBox>
      {popupProps.open && (
        <MDSnackbar
          color={popupProps.color}
          icon={popupProps.icon}
          title={popupProps.title}
          content={popupProps.content}
          open={popupProps.open}
          onClose={() => closePopUp()}
          close={() => closePopUp()}
          bgWhite
        />
      )}
    </>
  );
}

export default UserManage;
