import React from "react";
import PropTypes from "prop-types";

import { Box, Tooltip } from "@mui/material";
import { ReactComponent as Boat } from "./boat.svg";
import { ReactComponent as Star } from "./lStar.svg";

import "./wave.css";

function Wave({ width, progress }) {
  const start = -10;
  const positions = Array.from({ length: 21 }, (_, i) => start + i * 5);
  const widthUnit = "px";
  const waveSize = width * 0.3; // width prop의 30%

  const getLeft = (width) => {
    const max = width - 25;
    let cal = (width * progress) / 100 - 25;
    cal = cal > max ? max : cal;
    return cal + "px";
  };

  const boatStyle = {
    style: {
      width: "50px",
      height: "50px",
      position: "relative",
      top: "160%",
      left: getLeft(width),
      zIndex: "1000",
      animation: "rotateAnimation 1.75s linear infinite",
      animationDirection: "alternate",
    },
  };

  const starStyle = {
    style: {
      width: "50px",
      height: "50px",
      position: "relative",
      top: "-400%",
      left: getLeft(width),
      zIndex: "900",
      display: progress === 100 ? "block" : "none",
    },
  };

  return (
    <Box
      height="1rem"
      sx={{
        position: "absolute",
        left: 0,
        top: "-0.2rem",
        display: window.innerWidth < 1200 ? "none" : "block", // 화면 너비가 50% 이하일 때 display: none
      }}
    >
      <Tooltip
        title={progress === 100 ? "목표 달성!" : progress + "%"}
        arrow
        placement="top"
        sx={{
          maxWidth: "100%",
        }}
        componentsProps={{
          tooltip: {
            sx: {
              fontFamily: "Pretendard-Bold",
              backgroundColor: "#87CEEB",
              borderRadius: "40%",
            },
          },
          arrow: {
            sx: {
              color: "#87CEEB", // 화살표 색상
            },
          },
        }}
      >
        <Boat {...boatStyle} />
      </Tooltip>
      <Box width={width + widthUnit} className="wave-base">
        {positions.map((left, index) => (
          <Box
            key={index}
            className="wave"
            sx={{
              left: `${left}%`,
              width: `${waveSize}${widthUnit}`,
              height: `${waveSize}${widthUnit}`,
            }}
          />
        ))}
      </Box>
      <Star {...starStyle} />
    </Box>
  );
}

Wave.defaultProps = {
  width: 0,
  progress: 0,
};

Wave.propTypes = {
  width: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

export default Wave;
