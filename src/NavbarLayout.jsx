import React, { useEffect } from "react";
import { Center, Loader } from "@mantine/core";
import Navbar from "./components/Navbar/Navbar";
import useProjectStore from "./stores/projectStore";

const NavbarLayout = ({ children }) => {
  const { projects, getProjects } = useProjectStore();

  useEffect(() => {
    getProjects();
  }, []);

  if (!projects) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className="d-flex vh-100 vw-100">
      <Navbar></Navbar>
      <div className="overflow-auto vw-100 vh-100">{children}</div>
    </div>
  );
};

export default NavbarLayout;
