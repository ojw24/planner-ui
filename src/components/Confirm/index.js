import * as React from "react";
import PropTypes from "prop-types";

import MDButton from "../MDButton";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MDBox from "../MDBox";

export default function ResponsiveDialog({ title, content, open, onClose, agreeFunc }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle
        id="responsive-dialog-title"
        sx={{
          fontFamily: "'Pretendard-Bold', sans-serif",
          fontSize: "1.1rem",
          paddingBottom: 0.5,
        }}
      >
        {title}
      </DialogTitle>
      {content ? (
        <DialogContent
          sx={{
            paddingBottom: 0,
          }}
        >
          <DialogContentText
            sx={{
              fontFamily: "'Pretendard-Regular', sans-serif",
              fontSize: "0.9rem",
              paddingBottom: 0.5,
              whiteSpace: "pre-line",
            }}
          >
            {content.replace(/\\n/g, "\n")}
          </DialogContentText>
        </DialogContent>
      ) : (
        <MDBox mb={2} />
      )}
      <DialogActions
        sx={{
          padding: 1,
          paddingTop: 0,
          height: "2.5rem",
        }}
      >
        <MDButton
          sx={{
            fontFamily: "Pretendard-Light !important",
            color: "#1976D2",
            "&:hover": {
              backgroundColor: "#E3F2FD",
            },
            fontSize: "0.8rem",
            lineHeight: 1,
            width: "2rem",
            height: "2rem",
            minWidth: "0 !important",
            minHeight: "0 !important",
            marginLeft: "auto",
            padding: 0,
          }}
          onClick={agreeFunc}
        >
          예
        </MDButton>
        <MDButton
          sx={{
            fontFamily: "Pretendard-Light !important",
            color: "#616161",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
            fontSize: "0.8rem",
            lineHeight: 1,
            width: "3rem",
            height: "2rem",
            minWidth: "0 !important",
            minHeight: "0 !important",
            marginLeft: "auto",
            padding: 0.5,
          }}
          onClick={onClose}
        >
          아니오
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ResponsiveDialog.defaultProps = {
  title: "",
  content: "",
  open: false,
  onClose: () => {},
  agreeFunc: () => {},
};

ResponsiveDialog.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  agreeFunc: PropTypes.func.isRequired,
};
