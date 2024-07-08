import React from "react";
import JS from "./JS.svg";
import CPP from "./CPP.svg";
import C from "./C.svg";

const svgComponents = {
  JS: JS,
  CPP: CPP,
  C: C,
};

const PlatformList = ({ platforms, size, color }) => {
  const platformsSet = new Set(platforms);
  console.log(platformsSet);
  if (platformsSet.size === 0) {
    return <div className="d-inline">No Platforms</div>;
  }

  return (
    <div className="child-gap d-inline">
      {Array.from(platformsSet).map((platform) => {
        const logo = svgComponents[platform];
        return (
          logo && (
            <img
              src={logo}
              style={{ height: size, width: size, fill: color }}
            ></img>
          )
        );
      })}
    </div>
  );
};

export default PlatformList;
