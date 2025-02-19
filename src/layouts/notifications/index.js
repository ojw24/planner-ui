import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import { Pagination, PaginationItem, Grid, Card } from "@mui/material";
import { FirstPage, LastPage } from "@mui/icons-material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React example components
import DataTable from "examples/Tables/DataTable";

// Data
import PropTypes from "prop-types";
import loading from "../../assets/images/loading.gif";
import * as func from "./function";

function Notifications({ isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const getPageFromURL = () => {
    const queryParams = new URLSearchParams(location.search);
    return Number(queryParams.get("page")) || 0;
  };

  const effectRan = useRef(false);
  const [disabled, setDisabled] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchValue: new URLSearchParams(location.search).get("searchValue") || "",
    page: new URLSearchParams(location.search).get("page") || 0,
    size: 9,
  });
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(getPageFromURL());

  //notifications으로 진입 시 액션
  useEffect(() => {
    const queryStr = window.location.href
      .replace(window.location.origin, "")
      .replace(window.location.pathname, "");

    if (queryStr === null || queryStr === "") {
      if (!effectRan.current) {
        const updatedParams = { ...searchParams, page: 0, searchValue: "" };
        setSearchParams(updatedParams);
        setSearchValue("");
        setPageIndex(0);
        handlePage(updatedParams);
        effectRan.current = true;
      }
    } else {
      effectRan.current = false;
    }
  }, [new URLSearchParams(location.search)]);

  useEffect(() => {
    setPageIndex(getPageFromURL()); // URL이 변경될 때 pageIndex 업데이트
  }, [location.search]);

  useEffect(() => {
    const updatedParams = { ...searchParams, page: pageIndex };
    setSearchParams(updatedParams);
    handlePage(updatedParams);
  }, [pageIndex]);

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

  useEffect(() => {
    const handlePopState = handleBack();

    func.findNotices(searchParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/notifications/detail/${item.noticeId}?page=${res.data.number}${
                  searchParams.searchValue ? `&searchValue=${searchParams.searchValue}` : ""
                }`,
                {
                  state: { isAdmin },
                }
              );
            }}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")} // 마우스 오버 시 언더라인 추가
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")} // 마우스 벗어나면 제거
          >
            {item.title}
          </span>
        ),
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const columns = [
    { Header: "번호", accessor: "number", width: "10%", align: "center" },
    { Header: "제목", accessor: "title", align: "center", cellAlign: "left" },
    { Header: "등록일", accessor: "regDate", width: "11%", align: "center" },
  ];

  const inputStyles = {
    width: "0%",
    InputProps: {
      style: {
        fontFamily: "Pretendard-Light",
        width: "20rem",
        height: "2.4rem",
      },
    },
    InputLabelProps: {
      style: {
        fontFamily: "Pretendard-Light",
        top: "-6%",
      },
    },
    autoComplete: "off",
  };

  const handlePageChange = (newPage) => {
    updateURL(newPage);
    gotoPage(newPage);
  };

  const updateURL = (newPage) => {
    window.history.pushState(
      { page: pageIndex, searchValue: searchValue },
      "",
      `?page=${pageIndex}${searchValue ? `&searchValue=${searchValue}` : ""}`
    );
    const newUrl = `/notifications?page=${newPage}${
      searchValue ? `&searchValue=${searchValue}` : ""
    }`;
    window.history.replaceState(null, "", newUrl);
  };

  function handlePage(updatedParams) {
    func.findNotices(updatedParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/notifications/detail/${item.noticeId}?page=${res.data.number}${
                  searchParams.searchValue ? `&searchValue=${searchParams.searchValue}` : ""
                }`,
                {
                  state: { isAdmin },
                }
              );
            }}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")} // 마우스 오버 시 언더라인 추가
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")} // 마우스 벗어나면 제거
          >
            {item.title}
          </span>
        ),
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
  }

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

  const [searchValue, setSearchValue] = useState(
    new URLSearchParams(location.search).get("searchValue") || ""
  );
  const search = (params) => {
    setDisabled(true);
    const updatedParams = params ? params : { ...searchParams, page: 0, searchValue: searchValue };
    setSearchParams(updatedParams);
    func.findNotices(updatedParams).then((res) => {
      setDisabled(false);
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/notifications/detail/${item.noticeId}?page=${res.data.number}${
                  updatedParams.searchValue ? `&searchValue=${updatedParams.searchValue}` : ""
                }`,
                {
                  state: { isAdmin },
                }
              );
            }}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")} // 마우스 오버 시 언더라인 추가
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")} // 마우스 벗어나면 제거
          >
            {item.title}
          </span>
        ),
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
      updateURL(0);
      setPageIndex(0);
    });
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const handleRegister = () => {
    navigate("/notifications/register", {
      state: { isAdmin },
    });
  };

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
                ) : (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="30.2575rem"
                  >
                    <Icon fontSize="large">announcement</Icon>
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                      }}
                    >
                      등록된 공지사항이 없습니다.
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
                    label="제목"
                    name="title"
                    id="title"
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
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
                  {isAdmin ? (
                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="info"
                      sx={{
                        fontFamily: "'Pretendard-Bold', sans-serif",
                        fontSize: "0.9rem",
                        lineHeight: 1,
                        width: "5rem",
                        position: "absolute",
                        right: "3rem",
                      }}
                      disabled={disabled}
                      onClick={handleRegister}
                    >
                      {disabled ? (
                        <MDBox component="img" src={loading} alt="loading" width="1rem" />
                      ) : (
                        "등록"
                      )}
                    </MDButton>
                  ) : (
                    <></>
                  )}
                </MDBox>
              </>
            ) : (
              <>
                <MDBox mt={1.5} display="flex" alignItems="center" justifyContent="center">
                  {isAdmin ? (
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
                    >
                      {disabled ? (
                        <MDBox component="img" src={loading} alt="loading" width="1rem" />
                      ) : (
                        "등록"
                      )}
                    </MDButton>
                  ) : (
                    <></>
                  )}
                </MDBox>
              </>
            )}
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
}

Notifications.defaultProps = {
  isAdmin: false,
};

Notifications.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};

export default Notifications;
