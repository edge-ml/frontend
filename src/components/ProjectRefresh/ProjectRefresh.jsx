import React, { useContext, useEffect, useState } from 'react';
import NoProjectPage from './../NoProjectPage/NoProjectPage';
import { ProjectContext } from '../../ProjectProvider';

// const ProjectRefresh = ({ children }) => {
//   const { currentProject } = useContext(ProjectContext);

//   const childrenWithProps = React.Children.map(children, (child) => {
//     if (!currentProject || Object.keys(currentProject).length === 0) {
//       return <NoProjectPage></NoProjectPage>;
//     }
//     if (React.isValidElement(child)) {
//       return React.cloneElement(child, {
//         key: currentProject._id,
//         project: currentProject,
//       });
//     }
//     return child;
//   });

//   return childrenWithProps;
// };

const ProjectRefresh = ({ children }) => {
  const { currentProject } = useContext(ProjectContext);

  const childrenWithProps = React.Children.map(children, (child) => {
    return React.cloneElement(child, { project: currentProject });
  });
  return childrenWithProps;
};

export default ProjectRefresh;
