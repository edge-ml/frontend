import React from "react";

import "./loader.css";

/**
 * Animated edge-ml logo (soundwave) loader.
 * The bars of the soundwave pulse like an equalizer.
 */
const LogoLoader = ({ size = 48, color = "#073462", ...rest }) => {
  // Bars: [centerX, height] in the 16x16 viewBox
  const bars = [
    [2, 2],
    [4, 4],
    [6, 5],
    [8, 11],
    [10, 5],
    [12, 4],
    [14, 2],
  ];

  return (
    <svg
      className="logo-loader"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Loading"
      {...rest}
    >
      {bars.map(([x, h], i) => (
        <rect
          key={i}
          className="logo-loader-bar"
          x={x - 0.5}
          y={8 - h / 2}
          width={1}
          height={h}
          rx={0.5}
          fill={color}
          style={{
            animationDelay: `${i * 0.12}s`,
            animationDuration: `${0.9 + (i % 3) * 0.15}s`,
          }}
        />
      ))}
    </svg>
  );
};

export default LogoLoader;
