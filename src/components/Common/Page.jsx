import React from "react";

const Page = ({ children, header }) => {
  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 mt-4">
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        {header}
      </div>
      {children}
    </div>
  );
};

export default Page;
