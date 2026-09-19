import React, { useEffect } from "react";
import { AppShell, Center } from "@mantine/core";
import LogoLoader from "./modules/LogoLoader";
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
        <LogoLoader size={56} />
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
