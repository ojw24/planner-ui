/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Goal from "layouts/goal";
import Schedule from "layouts/schedule";
import Community from "layouts/community";
import BoardMemo from "layouts/community/detail";
import BoardMemoRegister from "layouts/community/register";
import Notifications from "layouts/notifications";
import Notification from "layouts/notifications/detail";
import NotificationRegister from "layouts/notifications/register";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import FindId from "layouts/authentication/find-id";
import FindPassword from "layouts/authentication/find-password";
import ResetPassword from "layouts/authentication/reset-password";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "목표관리",
    key: "goal",
    icon: <Icon fontSize="small">checklist_rtl_icon</Icon>,
    route: "/goal",
    component: Goal,
  },
  {
    type: "collapse",
    name: "일정관리",
    key: "schedule",
    icon: <Icon fontSize="small">edit_calendar</Icon>,
    route: "/schedule",
    component: Schedule,
  },
  {
    type: "collapse",
    name: "커뮤니티",
    key: "community",
    icon: <Icon fontSize="small">forum</Icon>,
    route: "/community",
    component: Community,
  },
  {
    type: "collapse",
    name: "커뮤니티 상세",
    key: "board-memo",
    icon: <Icon fontSize="small">forum</Icon>,
    route: "/community/detail/:boardMemoId",
    component: BoardMemo,
  },
  {
    type: "collapse",
    name: "커뮤니티 등록",
    key: "board-memo-register",
    icon: <Icon fontSize="small">forum</Icon>,
    route: "/community/register",
    component: BoardMemoRegister,
  },
  {
    type: "collapse",
    name: "공지사항",
    key: "notifications",
    icon: <Icon fontSize="small">announcement</Icon>,
    route: "/notifications",
    component: Notifications,
  },
  {
    type: "collapse",
    name: "공지사항 상세",
    key: "notification",
    icon: <Icon fontSize="small">announcement</Icon>,
    route: "/notifications/detail/:noticeId",
    component: Notification,
  },
  {
    type: "collapse",
    name: "공지사항 등록",
    key: "notification-register",
    icon: <Icon fontSize="small">announcement</Icon>,
    route: "/notifications/register",
    component: NotificationRegister,
  },
  {
    type: "collapse",
    name: "마이 페이지",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: Profile,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: SignIn,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: SignUp,
  },
  {
    type: "collapse",
    name: "Find id",
    key: "find-id",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/find-id",
    component: FindId,
  },
  {
    type: "collapse",
    name: "Find password",
    key: "find-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/find-password",
    component: FindPassword,
  },
  {
    type: "collapse",
    name: "Reset password",
    key: "reset-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/reset-password",
    component: ResetPassword,
  },
];

export default routes;
