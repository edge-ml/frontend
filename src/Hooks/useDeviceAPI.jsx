import { useContext, useEffect, useState } from "react";
import {
  getDeviceApiKey,
  switchDeviceApiActive,
  setDeviceApiKey as generateApiKeys_API,
  deleteDeviceApiKey,
} from "../services/ApiServices/DeviceApiService";
import useProjectStore from "../stores/projectStore";
import { getProjects } from "../services/ApiServices/ProjectService";

const useDeviceApi = () => {
  const { currentProject, setCurrentProject, setProjects } = useProjectStore();

  const [readKey, setReadKey] = useState(undefined);
  const [writeKey, setWriteKey] = useState(undefined);

  const updateKeys = async () => {
    const keys = await getDeviceApiKey();

    setReadKey(keys.readApiKey);
    setWriteKey(keys.writeApiKey);
  };

  useEffect(() => {
    updateKeys();
  }, []);

  useEffect(() => {
    updateKeys();
  }, [currentProject]);

  const refreshProjects = async () => {
    const projects = await getProjects();
    setProjects(projects);
  };

  const toggleDevieApi = async (state) => {
    await switchDeviceApiActive(state);
    await refreshProjects();
  };

  const generateApiKeys = async () => {
    const keys = await generateApiKeys_API();
    setReadKey(keys.readApiKey);
    setWriteKey(keys.writeApiKey);
  };

  const removeApiKeys = async () => {
    await deleteDeviceApiKey();
    setReadKey(undefined);
    setWriteKey(undefined);
  };

  return {
    toggleDevieApi: toggleDevieApi,
    generateApiKeys: generateApiKeys,
    removeApiKeys: removeApiKeys,
    readKey: readKey,
    writeKey: writeKey,
  };
};

export default useDeviceApi;
