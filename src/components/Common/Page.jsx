import React from "react";

const Page = ({ children, header }) => {
  return (
    <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2 mt-4">
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        {header}
      </div>
      {children}
    </div>
  );
};

export default Page;
