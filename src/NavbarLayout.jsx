import React, { useEffect } from "react";
import { AppShell, Center, Loader } from "@mantine/core";
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
    <AppShell navbar={{ width: 170, breakpoint: 0 }} padding={0}>
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main className="overflow-auto" style={{ height: "100vh" }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default NavbarLayout;
