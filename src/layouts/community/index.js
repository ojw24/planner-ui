import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { Pagination, PaginationItem, Grid, Card } from "@mui/material";
import { FirstPage, LastPage } from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import MDBox from "components/MDBox";

import DataTable from "examples/Tables/DataTable";

import loading from "../../assets/images/loading.gif";
import * as func from "./function";
import Icon from "@mui/material/Icon";
import MDTypography from "../../components/MDTypography";
import MDInput from "../../components/MDInput";
import MDButton from "../../components/MDButton";

function Community({ isAdmin, myId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const effectRan = useRef(false);
  const [disabled, setDisabled] = useState(false);
  const [searchType, setSearchType] = useState(
    new URLSearchParams(location.search).get("searchType") || "title"
  );
  const [searchValue, setSearchValue] = useState(
    new URLSearchParams(location.search).get("searchValue") || ""
  );
  const [searchParams, setSearchParams] = useState({
    boardId: 1,
    searchType: new URLSearchParams(location.search).get("searchType") || "title",
    searchValue: new URLSearchParams(location.search).get("searchValue") || "",
    page: new URLSearchParams(location.search).get("page") || 0,
    size: 9,
  });
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState(0);
  const getPageFromURL = () => {
    const queryParams = new URLSearchParams(location.search);
    return Number(queryParams.get("page")) || 0;
  };
  const [pageIndex, setPageIndex] = useState(getPageFromURL());

  useEffect(() => {
    const handlePopState = handleBack();

    func.findBoardMemos(searchParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.boardMemoId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/community/detail/${item.boardMemoId}?page=${res.data.number}&searchType=${
                  searchParams.searchType || "title"
                }${searchParams.searchValue ? `&searchValue=${searchParams.searchValue}` : ""}
                `,
                {
                  state: { isAdmin, myId },
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
        writer: item.userName + "(" + item.userId.slice(0, -3) + "***" + ")",
        regDate: item.regDtm.split("T")[0],
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const queryStr = window.location.href
      .replace(window.location.origin, "")
      .replace(window.location.pathname, "");

    if (queryStr === null || queryStr === "") {
      if (!effectRan.current) {
        const updatedParams = { ...searchParams, page: 0, searchType: "title", searchValue: "" };
        setSearchParams(updatedParams);
        setSearchType("title");
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
        const updatedParams = { ...searchParams, page: 0, searchType: "title", searchValue: "" };
        setSearchParams(updatedParams);
        setSearchType("title");
        setSearchValue("");
        setPageIndex(0);
        handlePage(updatedParams);
        effectRan.current = true;
      } else {
        const params = new URLSearchParams(queryStr);
        const page = params.get("page");
        const searchType = params.get("searchType");
        const searchValue = params.get("searchValue");

        const updatedParams = {
          ...searchParams,
          page: page,
          searchType: searchType,
          searchValue: searchValue,
        };
        setSearchParams(updatedParams);
        setSearchType(setSearchType);
        setSearchValue(searchValue);
        setPageIndex(Number(params.get("page")) || 0);
        handlePage(updatedParams);
        effectRan.current = true;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return handlePopState;
  }

  const columns = [
    { Header: "번호", accessor: "number", width: "10%", align: "center" },
    { Header: "제목", accessor: "title", align: "center", width: "68%", cellAlign: "left" },
    { Header: "작성자", accessor: "writer", align: "center", width: "15%", cellAlign: "center" },
    { Header: "등록일", accessor: "regDate", width: "12%", align: "center" },
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
    autoComplete: "off",
  };

  const typeStyles = {
    sx: {
      fontFamily: "Pretendard-Light",
      minWidth: "6.5rem",
      paddingX: "0.2rem",
      transform: "translateY(0)",
      transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
    },
  };

  const updateURL = (newPage) => {
    window.history.pushState(
      { page: pageIndex, searchType: searchType, searchValue: searchValue },
      "",
      `?page=${pageIndex}&searchType=${searchParams.searchType || "title"}${
        searchValue ? `&searchValue=${searchValue}` : ""
      }
                `
    );
    const newUrl = `/community?page=${newPage}&searchType=${searchParams.searchType || "title"}${
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

  function handlePage(updatedParams) {
    func.findBoardMemos(updatedParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.boardMemoId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/community/detail/${item.boardMemoId}?page=${res.data.number}&searchType=${
                  searchParams.searchType || "title"
                }${searchParams.searchValue ? `&searchValue=${searchParams.searchValue}` : ""}
                `,
                {
                  state: { isAdmin, myId },
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
        writer: item.userName + "(" + item.userId.slice(0, -3) + "***" + ")",
        regDate: item.regDtm.split("T")[0],
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
  }

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const handleRegister = () => {
    navigate("/community/register", {
      state: { isAdmin, myId },
    });
  };

  const search = () => {
    setDisabled(true);
    const updatedParams = {
      ...searchParams,
      page: 0,
      searchType: searchType,
      searchValue: searchValue,
    };
    setSearchParams(updatedParams);
    func.findBoardMemos(updatedParams).then((res) => {
      setDisabled(false);
      const mappedData = res.data.content.map((item) => ({
        number: item.boardMemoId,
        title: (
          <span
            onClick={() => {
              navigate(
                `/community/detail/${item.boardMemoId}?page=${res.data.number}&searchType=${
                  searchParams.searchType || "title"
                }${searchParams.searchValue ? `&searchValue=${searchParams.searchValue}` : ""}
                `,
                {
                  state: { isAdmin, myId },
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
        writer: item.userName + "(" + item.userId.slice(0, -3) + "***" + ")",
        regDate: item.regDtm.split("T")[0],
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
      updateURL(0);
      setPageIndex(0);
    });
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

  const handlePageChange = (newPage) => {
    updateURL(newPage);
    gotoPage(newPage);
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
                    <Icon fontSize="large">event_busy</Icon>
                    <MDTypography
                      sx={{
                        fontFamily: "Pretendard-Light",
                      }}
                    >
                      등록된 게시글이 없습니다.
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
                <MDBox display="flex" alignItems="center" justifyContent="center" gap="0.5rem">
                  <MDBox
                    sx={{
                      width: "7.5rem",
                      height: "2.4rem",
                    }}
                  >
                    <FormControl fullWidth>
                      <Select
                        id="demo-simple-select"
                        value={searchType}
                        sx={{
                          height: "2.4rem",
                          fontFamily: "Pretendard-Regular",
                          "& .MuiSelect-icon": {
                            display: "block !important",
                            width: "1.5rem",
                            height: "1.5rem",
                            top: "50%", // 아이콘을 정렬
                            transform: "translateY(-50%)",
                          },
                          "& .MuiSelect-iconOpen": {
                            transform: "translateY(-50%) rotate(180deg)", // 선택 시 아이콘 회전
                          },
                        }}
                        MenuProps={{
                          anchorOrigin: {
                            vertical: "top", //기준 위치: Select의 아래쪽
                            horizontal: "right", //기준 위치: Select의 왼쪽
                          },
                          transformOrigin: {
                            vertical: "bottom", //드롭다운 메뉴가 시작되는 위치
                            horizontal: "right",
                          },
                          disablePortal: true, // 항상 원래 위치에서 열리도록 강제
                          PaperProps: {
                            sx: {
                              width: "7.5rem", //드롭다운 폭 조정
                            },
                          },
                        }}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <MenuItem {...typeStyles} value="title">
                          제목
                        </MenuItem>
                        <MenuItem {...typeStyles} value="name">
                          작성자 이름
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDInput
                    {...inputStyles}
                    type="text"
                    name="searchValue"
                    id="searchValue"
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                    placeholder="검색어를 입력해주세요"
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
                </MDBox>
              </>
            ) : (
              <>
                <MDBox mt={1.5} display="flex" alignItems="center" justifyContent="center">
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
                    onClick={handleRegister}
                  >
                    {disabled ? (
                      <MDBox component="img" src={loading} alt="loading" width="1rem" />
                    ) : (
                      "등록"
                    )}
                  </MDButton>
                </MDBox>
              </>
            )}
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
}

Community.defaultProps = {
  isAdmin: false,
  myId: "",
};

Community.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  myId: PropTypes.string.isRequired,
};

export default Community;
