import React, { createContext, useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDPagination from "components/MDPagination";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React example components
import DataTable from "examples/Tables/DataTable";

// Data
import PropTypes from "prop-types";
import loading from "../../assets/images/loading.gif";
import * as func from "./function";

const Context = createContext();

function Notifications({ isAdmin }) {
  const [disabled, setDisabled] = useState(false);
  const [searchParams, setSearchParams] = useState({
    searchValue: "",
    page: 0,
    size: 9,
  });
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    func.findNotices(searchParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: item.title,
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
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

  const maxPagesToShow = 5;
  const startPage = Math.max(
    0,
    Math.min(pageIndex - Math.floor(maxPagesToShow / 2), pages - maxPagesToShow)
  );

  const [transitioning, setTransitioning] = useState(false);
  const handlePageChange = (newPage) => {
    setTransitioning(true); //페이지 전환 중 상태 설정
    setTimeout(() => {
      gotoPage(newPage);
      setTransitioning(false); // 전환 완료 후 상태 해제
    }, 50); // 50ms 딜레이 후 페이지 변경 적용
  };

  const renderPagination = Array.from({ length: Math.min(maxPagesToShow, pages) }, (_, i) => {
    const pageNumber = startPage + i;
    return (
      <MDPagination
        item
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        active={!transitioning && pageIndex === pageNumber}
      >
        {pageNumber + 1}
      </MDPagination>
    );
  });

  const gotoPage = (page) => {
    setPageIndex(page);
    const updatedParams = { ...searchParams, page };
    setSearchParams(updatedParams);
    func.findNotices(updatedParams).then((res) => {
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: item.title,
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
  };

  const gotoFirst = () => {
    setPageIndex(0);
    gotoPage(0);
  };

  const gotoLast = () => {
    setPageIndex(pages - 1);
    gotoPage(pages - 1);
  };

  const gotoPrev = () => {
    const page = pageIndex > 0 ? pageIndex - 1 : 0;
    setPageIndex(page);
    gotoPage(page);
  };

  const gotoNext = () => {
    const page = pageIndex < pages - 1 ? pageIndex + 1 : pages - 1;
    setPageIndex(page);
    gotoPage(page);
  };

  const [searchValue, setSearchValue] = useState("");
  const search = () => {
    setDisabled(true);
    const updatedParams = { ...searchParams, searchValue: searchValue };
    setSearchParams(updatedParams);
    func.findNotices(updatedParams).then((res) => {
      setDisabled(false);
      const mappedData = res.data.content.map((item) => ({
        number: item.noticeId,
        title: item.title,
        regDate: item.regDtm.split("T")[0],
        isTop: item.isTop,
      }));
      setRows(mappedData);
      setPages(res.data.totalPages);
    });
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      search();
    }
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
                  <Context.Provider
                    value={{ variant: "gradient", color: "success", size: "medium" }}
                  >
                    <Grid container mt={1.5} mb={1.5} justifyContent="center">
                      <MDPagination item onClick={gotoFirst}>
                        <Icon>first_page</Icon>
                      </MDPagination>
                      <MDPagination item onClick={gotoPrev}>
                        <Icon>chevron_left</Icon>
                      </MDPagination>
                      {renderPagination}
                      <MDPagination item onClick={gotoNext}>
                        <Icon>chevron_right</Icon>
                      </MDPagination>
                      <MDPagination item onClick={gotoLast}>
                        <Icon>last_page</Icon>
                      </MDPagination>
                    </Grid>
                  </Context.Provider>
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
                      setSearchValue(e.target.value.trim());
                    }}
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
