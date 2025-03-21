import * as React from "react";
import PropTypes from "prop-types";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Paper } from "@mui/material";

import Draggable from "react-draggable";
import Icon from "@mui/material/Icon";

const DraggablePaper = (props) => {
  return (
    <Draggable handle=".MuiPaper-root" cancel={"input, textarea, select, button"}>
      <Paper {...props} />
    </Draggable>
  );
};

export default function Modal({ content, open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
      PaperComponent={DraggablePaper}
    >
      <DialogTitle>
        <Icon
          sx={{
            position: "absolute",
            top: "0.5rem", // 상단 여백
            right: "0.5rem", // 우측 여백
            fontSize: "1rem !important",
            color: "black",
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          close
        </Icon>
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
}

Modal.defaultProps = {
  content: <></>,
  open: false,
  onClose: () => {},
};

Modal.propTypes = {
  content: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
