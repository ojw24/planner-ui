import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, matchPath } from "react-router-dom";
import routes from "routes";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import ClickAwayListener from "@mui/base/ClickAwayListener";

import MDTypography from "components/MDTypography";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setOpenConfigurator,
  setOpenFriend,
  setIgnore,
  setIgnoreF,
} from "context";
import MenuItem from "@mui/material/MenuItem";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import ListItemIcon from "@mui/material/ListItemIcon";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import * as React from "react";

import LogOut from "./functions";

import MDAvatar from "../../../components/MDAvatar";

function DashboardNavbar({ absolute, light, isMini, image }) {
  const [controller, dispatch] = useMaterialUIController();
  const {
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    openFriend,
    darkMode,
    ignore,
    ignoreF,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname;
  const [profile, setProfile] = useState(image);

  useEffect(() => {
    setProfile(image);
  }, [image]);

  useEffect(() => {
    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /**
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleFriendOpen = () => setOpenFriend(dispatch, !openFriend);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickAway = (e) => {
    if (anchorEl && !anchorEl.contains(e.target)) {
      handleClose();
    }
  };

  const handleIgnore = () => setIgnore(dispatch, !ignore);
  const handleIgnoreF = () => setIgnoreF(dispatch, !ignoreF);

  const getName = (allRoutes, key) => {
    return key === "" ? "Dashboard" : allRoutes.find((route) => matchPath(route.route, key))?.name;
  };

  const renderAccountMenu = () => (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        disableScrollLock
        position="fixed"
        sx={{
          width: "0",
        }}
        PaperProps={{
          style: {
            transform: open ? "translateY(0)" : "translateY(-20px)",
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
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <MDTypography
            component={Link}
            to="/profile"
            variant="button"
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            마이 페이지
          </MDTypography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleIgnoreF();
            handleFriendOpen();
          }}
        >
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            친구
          </MDTypography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleIgnore();
            handleConfiguratorOpen();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            설정
          </MDTypography>
        </MenuItem>
        <MenuItem onClick={LogOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <MDTypography
            sx={{
              fontFamily: "Pretendard-light",
              fontSize: "0.9rem",
            }}
          >
            로그아웃
          </MDTypography>
        </MenuItem>
      </Menu>
    </ClickAwayListener>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const [isHalf, setIsHalf] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMaximized(window.innerWidth === window.screen.availWidth);
      setIsHalf(window.innerWidth <= window.screen.availWidth / 2);
    };

    handleResize(); // 마운트 시 실행
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={(theme) => ({
        ...navbar(theme, { transparentNavbar, absolute, light, darkMode }),
        width: isMaximized ? "77rem" : isHalf ? "0" : "inherit",
        mx: "1rem",
        mt: "0.25rem",
      })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs
            icon="home"
            title={getName(routes, route)}
            route={route}
            light={light}
            sx={iconsStyle}
          />
        </MDBox>
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <MDBox color={light ? "white" : "inherit"}>
            <IconButton
              size="large"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="notification-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={handleOpenMenu}
            >
              <Icon sx={iconsStyle}>notifications</Icon>
            </IconButton>
            <IconButton
              size="large"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="notification-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={handleClick}
            >
              {profile ? (
                <MDAvatar
                  id="profile"
                  src={"/image" + profile}
                  alt="profile-image"
                  sx={{
                    width: "1.75rem",
                    height: "1.75rem",
                  }}
                  shadow="sm"
                />
              ) : (
                <Icon sx={iconsStyle}>account_circle</Icon>
              )}
            </IconButton>
            {renderMenu()}
            {renderAccountMenu()}
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  image: "",
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  image: PropTypes.string,
};

export default DashboardNavbar;
