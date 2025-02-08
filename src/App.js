import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

import SignIn from "./layouts/authentication/sign-in";
import SignUp from "./layouts/authentication/sign-up";
import FindId from "./layouts/authentication/find-id";
import FindPassword from "./layouts/authentication/find-password";
import ResetPassword from "./layouts/authentication/reset-password";

import Interceptor from "layouts/common/Interceptor";

export default function App() {
  let isLogin = false;

  if (localStorage.getItem("jwt")) {
    isLogin = true;
  }

  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  let isResetPwd = false;

  if (useLocation().pathname === "/authentication/reset-password") {
    isResetPwd = true;
  }

  useEffect(() => {
    if (pathname === "/authentication/reset-password") {
      isResetPwd = true;
    }
  }, [pathname]);

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const getNavRoutes = (allRoutes) =>
    allRoutes
      .filter((route) => route.route.indexOf("/authentication"))
      .filter((route) => route.route.indexOf("/profile"));

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const [isHalf, setIsHalf] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsHalf(window.innerWidth <= window.screen.availWidth / 2);
    };

    handleResize(); // 마운트 시 실행
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        <Interceptor />
      </ThemeProvider>
      {!isLogin ? (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          <Routes>
            <Route exact path="/authentication/sign-in" element=<SignIn /> key="sign-in" />
            <Route exact path="/authentication/sign-up" element=<SignUp /> key="sign-up" />
            <Route exact path="/authentication/find-id" element=<FindId /> key="find-id" />
            <Route
              exact
              path="/authentication/find-password"
              element=<FindPassword />
              key="find-password"
            />
            <Route
              exact
              path="/authentication/reset-password"
              element=<ResetPassword />
              key="reset-password"
            />
            <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
          </Routes>
        </ThemeProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          {!isResetPwd ? (
            <DashboardLayout>
              <DashboardNavbar />
              <CssBaseline />
              <MDBox pt={isHalf ? 0 : 8}>
                {layout === "dashboard" && (
                  <>
                    <Sidenav
                      color={sidenavColor}
                      brand={
                        (transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite
                      }
                      brandName="Planner"
                      routes={getNavRoutes(routes)}
                      onMouseEnter={handleOnMouseEnter}
                      onMouseLeave={handleOnMouseLeave}
                    />
                    <Configurator />
                  </>
                )}
                {layout === "vr" && <Configurator />}
                <Routes>
                  {getRoutes(routes)}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </MDBox>
            </DashboardLayout>
          ) : (
            <>
              <CssBaseline />
              <Routes>
                <Route path="/authentication/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/authentication/reset-password" />} />
              </Routes>
            </>
          )}
        </ThemeProvider>
      )}
    </div>
  );
}
