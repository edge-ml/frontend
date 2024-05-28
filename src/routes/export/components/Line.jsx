import React from 'react';
export const Line = ({ children, className, ...rest }) => (
  <div {...rest} className={`py-1${className ? ` ${className}` : ''}`}>
    {children}
  </div>
);
