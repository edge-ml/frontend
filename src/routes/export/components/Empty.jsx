import React from 'react';
export const Empty = ({ children = 'Empty', className = '', ...props }) => (
  <div
    className={`w-100 text-center text-secondary${
      className ? ` ${className}` : ''
    }`}
  >
    {children}
  </div>
);
