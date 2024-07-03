import React from "react";

const svgComponents = {
  JS: React.lazy(() => import("./JS.svg")),
  CPP: React.lazy(() => import("./CPP.svg")),
};

const PlatformList = ({ platforms, size, color }) => {
  const platformsSet = new Set(platforms);

  if (platformsSet.size === 0) {
    return <div className="d-inline">No Platforms</div>;
  }

  return (
    <div className="child-gap">
      {Array.from(platformsSet).map((platform) => {
        const SvgComponent = svgComponents[platform];
        return (
          SvgComponent && (
            <React.Suspense fallback={<div>Loading...</div>} key={platform}>
              <SvgComponent
                style={{ height: size, width: size, fill: color }}
              />
            </React.Suspense>
          )
        );
      })}
    </div>
  );
};

export default PlatformList;
